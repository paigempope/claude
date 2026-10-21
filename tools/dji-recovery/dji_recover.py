#!/usr/bin/env python3
"""
dji_recover.py - recover deleted DJI video clips (.MP4 / .LRF / .JPG) from an
exFAT SD card.  READ-ONLY: it never writes a single byte to the card.

Two passes:
  1. exFAT directory pass - deleted files usually keep their directory entry
     (original name, size, start cluster, timestamps).  Those are rebuilt with
     their real names, and the allocation bitmap tells us whether any of their
     clusters have since been overwritten by newer recordings.
  2. Carving pass - every *unallocated* cluster is scanned for MP4 headers
     ('ftyp'); the MP4 box structure (ftyp/mdat/moov...) gives the exact file
     length.  Catches clips whose directory entries were wiped.

Usage (macOS):
  diskutil list                       # find the card, e.g. /dev/disk4
  diskutil unmountDisk /dev/disk4     # unmount (do NOT eject)
  sudo python3 dji_recover.py /dev/rdisk4 --list           # just look
  sudo python3 dji_recover.py /dev/rdisk4 ~/Desktop/Recovered

The source may also be a disk image file (e.g. made with dd).
"""

import argparse
import datetime
import os
import re
import struct
import subprocess
import sys
import time

SECTOR = 512
MEDIA_EXT = ('.MP4', '.MOV', '.LRF', '.JPG', '.DNG', '.SRT', '.WAV')
MP4_EXT = ('.MP4', '.MOV', '.LRF')
KNOWN_BOXES = {b'ftyp', b'free', b'skip', b'mdat', b'moov', b'udta', b'meta',
               b'uuid', b'wide', b'pnot', b'camd', b'pict', b'moof', b'mfra',
               b'sidx', b'styp', b'prfl', b'junk', b'pdin'}


# ---------------------------------------------------------------- raw access

class RawReader:
    """Sector-aligned reader (macOS /dev/rdiskN rejects unaligned reads)."""

    def __init__(self, path):
        self.path = path
        self.fd = os.open(path, os.O_RDONLY)
        self.size = self._size()

    def _size(self):
        try:
            end = os.lseek(self.fd, 0, os.SEEK_END)
            if end > 0:
                return end
        except OSError:
            pass
        if sys.platform == 'darwin':
            # DKIOCGETBLOCKSIZE / DKIOCGETBLOCKCOUNT
            import fcntl
            bs = struct.unpack('<I', fcntl.ioctl(self.fd, 0x40046418, b'\0' * 4))[0]
            bc = struct.unpack('<Q', fcntl.ioctl(self.fd, 0x40086419, b'\0' * 8))[0]
            return bs * bc
        raise SystemExit('Cannot determine size of %s' % self.path)

    def read(self, offset, length):
        if length <= 0 or offset >= self.size:
            return b''
        length = min(length, self.size - offset)
        start = offset - offset % SECTOR
        end = offset + length
        end += (-end) % SECTOR
        end = min(end, self.size + (-self.size) % SECTOR)
        buf = bytearray()
        pos = start
        while pos < end:
            want = min(end - pos, 32 << 20)
            for attempt in range(3):
                try:
                    chunk = os.pread(self.fd, want, pos)
                    break
                except OSError as e:
                    if attempt == 2:
                        print('  ! read error at %d: %s (zero-filled)' % (pos, e))
                        chunk = b'\0' * want
            if not chunk:
                break
            buf += chunk
            pos += len(chunk)
        return bytes(buf[offset - start: offset - start + length])


# ---------------------------------------------------------------- exFAT

class ExFAT:
    def __init__(self, dev, part_off):
        self.dev = dev
        self.base = part_off
        bs = dev.read(part_off, 512)
        self.bps = 1 << bs[108]
        self.spc = 1 << bs[109]
        self.cluster = self.bps * self.spc
        self.fat_off = part_off + struct.unpack_from('<I', bs, 80)[0] * self.bps
        self.heap_off = part_off + struct.unpack_from('<I', bs, 88)[0] * self.bps
        self.nclusters = struct.unpack_from('<I', bs, 92)[0]
        self.root = struct.unpack_from('<I', bs, 96)[0]
        self.bitmap = None
        self._fat_cache = {}

    def coff(self, c):
        return self.heap_off + (c - 2) * self.cluster

    def valid(self, c):
        return 2 <= c < self.nclusters + 2

    def fat(self, c):
        page = c // 1024
        if page not in self._fat_cache:
            self._fat_cache[page] = self.dev.read(self.fat_off + page * 4096, 4096)
        data = self._fat_cache[page]
        i = (c % 1024) * 4
        return struct.unpack_from('<I', data, i)[0] if i + 4 <= len(data) else 0

    def chain(self, first, nofat, length):
        n = max(1, -(-length // self.cluster))
        if nofat:
            return [first + i for i in range(n)]
        out, c = [], first
        while self.valid(c) and len(out) < n and c not in out[-1:]:
            out.append(c)
            c = self.fat(c)
        return out

    def read_chain(self, clusters, length):
        out = bytearray()
        # merge contiguous runs for speed
        i = 0
        while i < len(clusters) and len(out) < length:
            j = i
            while j + 1 < len(clusters) and clusters[j + 1] == clusters[j] + 1:
                j += 1
            run = (j - i + 1) * self.cluster
            out += self.dev.read(self.coff(clusters[i]), min(run, length - len(out)))
            i = j + 1
        return bytes(out)

    def allocated(self, c):
        if self.bitmap is None or not self.valid(c):
            return False
        i = c - 2
        return bool(self.bitmap[i >> 3] & (1 << (i & 7))) if (i >> 3) < len(self.bitmap) else False

    # Directory parsing -------------------------------------------------

    def parse_dir(self, data):
        """Yield entry sets (live and deleted) found in a directory blob."""
        n = len(data) // 32
        i = 0
        while i < n:
            e = data[i * 32:(i + 1) * 32]
            t = e[0]
            if t == 0x81 and self.bitmap is None:       # allocation bitmap
                fc, ln = struct.unpack_from('<IQ', e, 20)
                self.bitmap = self.read_chain(self.chain(fc, True, ln), ln)
            if t in (0x85, 0x05):
                sec = e[1]
                live = t == 0x85
                ents = [data[(i + k) * 32:(i + k + 1) * 32] for k in range(1, sec + 1)]
                if len(ents) == sec and sec >= 2 and (ents[0][0] & 0x7F) == 0x40:
                    st = ents[0]
                    flags, namelen = st[1], st[3]
                    valid_len = struct.unpack_from('<Q', st, 8)[0]
                    first = struct.unpack_from('<I', st, 20)[0]
                    length = struct.unpack_from('<Q', st, 24)[0]
                    name = ''
                    for fe in ents[1:]:
                        if (fe[0] & 0x7F) != 0x41:
                            break
                        name += fe[2:32].decode('utf-16-le', 'replace')
                    name = name[:namelen]
                    yield dict(name=name, live=live,
                               is_dir=bool(struct.unpack_from('<H', e, 4)[0] & 0x10),
                               ctime=exfat_time(struct.unpack_from('<I', e, 8)[0]),
                               mtime=exfat_time(struct.unpack_from('<I', e, 12)[0]),
                               nofat=bool(flags & 2), first=first,
                               size=valid_len or length)
                    i += 1 + sec
                    continue
            i += 1

    def walk(self, first=None, nofat=False, size=None, path='', depth=0, seen=None):
        """Walk tree; descends into live and deleted subdirectories."""
        seen = seen if seen is not None else set()
        if first is None:
            first = self.root
            clusters, c = [], first
            while self.valid(c) and c not in clusters and len(clusters) < 4096:
                clusters.append(c)
                c = self.fat(c)
            size = len(clusters) * self.cluster
        else:
            clusters = self.chain(first, nofat, size)
        if not clusters or clusters[0] in seen or depth > 12:
            return
        seen.add(clusters[0])
        data = self.read_chain(clusters, size)
        for ent in self.parse_dir(data):
            ent['path'] = path + '/' + ent['name']
            if ent['is_dir']:
                if self.valid(ent['first']) and 0 < ent['size'] < (64 << 20):
                    yield from self.walk(ent['first'], ent['nofat'], ent['size'],
                                         ent['path'], depth + 1, seen)
            else:
                yield ent


def exfat_time(v):
    try:
        return datetime.datetime(1980 + (v >> 25), (v >> 21) & 15, (v >> 16) & 31,
                                 (v >> 11) & 31, (v >> 5) & 63, (v & 31) * 2)
    except ValueError:
        return None


def find_exfat(dev):
    def is_exfat(off):
        return dev.read(off + 3, 8) == b'EXFAT   '
    if is_exfat(0):
        return 0
    mbr = dev.read(0, 1024)
    cands = []
    if mbr[510:512] == b'\x55\xaa':
        for k in range(4):
            lba = struct.unpack_from('<I', mbr, 446 + 16 * k + 8)[0]
            if lba:
                cands.append(lba * SECTOR)
    if mbr[512:520] == b'EFI PART':
        ent_lba, n, esz = struct.unpack_from('<QII', mbr, 512 + 72)
        tab = dev.read(ent_lba * SECTOR, min(n, 128) * esz)
        for k in range(min(n, 128)):
            lba = struct.unpack_from('<Q', tab, k * esz + 32)[0]
            if lba:
                cands.append(lba * SECTOR)
    for off in cands:
        if is_exfat(off):
            return off
    # brute force: first 512 MB
    for off in range(0, min(dev.size, 512 << 20), 8 << 20):
        blob = dev.read(off, 8 << 20)
        p = blob.find(b'\xebv\x90EXFAT   ')
        while p != -1:
            if (off + p) % SECTOR == 0:
                return off + p
            p = blob.find(b'\xebv\x90EXFAT   ', p + 1)
    return None


# ---------------------------------------------------------------- MP4

def mp4_extent(read, start, limit):
    """Walk top-level MP4 boxes from `start`. Returns (length, info) or None."""
    pos, seen, info = start, [], {}
    while pos < limit:
        h = read(pos, 16)
        if len(h) < 8:
            break
        size, typ = struct.unpack('>I4s', h[:8])
        hdr = 8
        if size == 1:
            if len(h) < 16:
                break
            size = struct.unpack('>Q', h[8:16])[0]
            hdr = 16
        elif size == 0:            # box runs to end - recording interrupted
            info['open_ended'] = True
            break
        if typ not in KNOWN_BOXES or size < hdr:
            break
        if not seen and typ != b'ftyp':
            return None
        seen.append(typ)
        if typ == b'moov':
            mv = read(pos + hdr, min(size - hdr, 4096))
            k = mv.find(b'mvhd')
            if k >= 4:
                ver = mv[k + 4]
                if ver == 1:
                    ts, dur = struct.unpack_from('>IQ', mv, k + 24)
                else:
                    ts, dur = struct.unpack_from('>II', mv, k + 16)
                if ts:
                    info['duration'] = dur / ts
        pos += size
        if b'moov' in seen and b'mdat' in seen:
            break
    if not seen:
        return None
    info['boxes'] = [t.decode('latin1') for t in seen]
    info['complete'] = b'moov' in seen and b'mdat' in seen
    length = min(pos, limit) - start
    return length, info


# ---------------------------------------------------------------- helpers

def human(n):
    for u in ('B', 'KB', 'MB', 'GB', 'TB'):
        if n < 1024 or u == 'TB':
            return '%.1f %s' % (n, u)
        n /= 1024.0


def guard_outdir(src, outdir):
    """Refuse to write recovered files back onto the card itself."""
    if sys.platform != 'darwin':
        return
    m = re.search(r'disk(\d+)', src)
    if not m:
        return
    try:
        out = subprocess.run(['df', outdir], capture_output=True, text=True).stdout
    except OSError:
        return
    m2 = re.search(r'/dev/disk(\d+)', out)
    if m2 and m2.group(1) == m.group(1):
        raise SystemExit('REFUSING: output folder is on the SD card itself. '
                         'Pick a folder on another drive.')


def copy_out(dev, outpath, runs, total, mtime=None):
    """runs = list of (offset, length) on the device."""
    done = 0
    with open(outpath, 'wb') as f:
        for off, ln in runs:
            p = 0
            while p < ln:
                chunk = dev.read(off + p, min(32 << 20, ln - p))
                if not chunk:
                    break
                f.write(chunk)
                p += len(chunk)
                done += len(chunk)
                print('\r    %5.1f%%' % (100.0 * done / max(total, 1)), end='', flush=True)
    print('\r', end='')
    if mtime:
        ts = time.mktime(mtime.timetuple())
        os.utime(outpath, (ts, ts))


def mp4_prefix(head):
    """Bytes of a clip from its start up to and including the mdat header.
    Returns (prefix, mdat_box_offset, header_len) or None."""
    pos = 0
    while pos + 16 <= len(head):
        size, typ = struct.unpack_from('>I4s', head, pos)
        hdr = 8
        if size == 1:
            size, hdr = struct.unpack_from('>Q', head, pos + 8)[0], 16
        if typ == b'mdat':
            return head[:pos + hdr], pos, hdr
        if typ not in KNOWN_BOXES or size < 8:
            return None
        pos += size
    return None


def salvage(dev, runs, size, ref_head, outpath, mtime=None):
    """Rebuild a clip whose first cluster(s) were overwritten: the moov index at
    the end survives, so transplant a header from a healthy clip of the same
    camera and point mdat at the surviving moov."""
    pre = mp4_prefix(ref_head)
    if not pre:
        return 'no usable reference clip'
    prefix, mdat_at, hdr = pre
    # find moov at the tail: a box whose size reaches exactly to end of file
    tail_len = min(size, 16 << 20)
    tail_off = size - tail_len
    tail = bytearray()
    done = 0
    for off, ln in runs:
        a, b = max(done, tail_off), min(done + ln, size)
        if a < b:
            tail += dev.read(off + (a - done), b - a)
        done += ln
    k = tail.rfind(b'moov')
    while k >= 4:
        bsz = struct.unpack_from('>I', tail, k - 4)[0]
        if tail_off + k - 4 + bsz == size:
            break
        k = tail.rfind(b'moov', 0, k)
    if k < 4:
        return 'index (moov) not found at end'
    moov_at = tail_off + k - 4
    mdat_size = moov_at - mdat_at
    hdr_bytes = bytearray(prefix)
    if hdr == 16:
        struct.pack_into('>Q', hdr_bytes, mdat_at + 8, mdat_size)
    elif mdat_size < 1 << 32:
        struct.pack_into('>I', hdr_bytes, mdat_at, mdat_size)
    else:
        return 'reference header too small for this clip'
    copy_out(dev, outpath, runs, size, mtime)
    with open(outpath, 'r+b') as f:
        f.write(hdr_bytes)
    return None


def free_space(path):
    st = os.statvfs(path)
    return st.f_bavail * st.f_frsize


def unique(path):
    base, ext = os.path.splitext(path)
    k, p = 1, path
    while os.path.exists(p):
        p = '%s_%d%s' % (base, k, ext)
        k += 1
    return p


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('source', help='raw card device (/dev/rdiskN) or image file')
    ap.add_argument('outdir', nargs='?', help='where to save recovered files')
    ap.add_argument('--list', action='store_true', help='only report, save nothing')
    ap.add_argument('--no-carve', action='store_true', help='skip raw carving pass')
    ap.add_argument('--lrf-only', action='store_true',
                    help='recover only small .LRF proxies (saves disk space)')
    args = ap.parse_args()

    if not args.list and not args.outdir:
        ap.error('give an output folder, or use --list')
    try:
        dev = RawReader(args.source)
    except PermissionError:
        raise SystemExit('Permission denied - run with sudo.')
    except OSError as e:
        raise SystemExit('Cannot open %s: %s\n(Did you unmount it with '
                         '"diskutil unmountDisk"?)' % (args.source, e))
    if args.outdir:
        os.makedirs(args.outdir, exist_ok=True)
        guard_outdir(args.source, args.outdir)

    print('Source: %s  (%s)' % (args.source, human(dev.size)))
    report = []
    claimed = []   # (start, end) device byte ranges already recovered

    part = find_exfat(dev)
    fs = None
    if part is None:
        print('No exFAT filesystem found - carving whole device.')
    else:
        fs = ExFAT(dev, part)
        print('exFAT at offset %d, cluster %s, %d clusters'
              % (part, human(fs.cluster), fs.nclusters))

    # ---------------- pass 1: directory entries
    if fs:
        print('\n[1/2] Reading directory entries ...')
        entries = list(fs.walk())
        if fs.bitmap is None:
            print('  ! allocation bitmap not found; overwrite detection disabled')
        trash_live = [e for e in entries if e['live'] and '/.Trashes/' in e['path']
                      and e['name'].upper().endswith(MEDIA_EXT)
                      and not e['name'].startswith('._')]
        if trash_live:
            print('\n  *** %d file(s) are still sitting in the Mac Trash on this card!'
                  % len(trash_live))
            for e in trash_live:
                print('      %s  %s' % (e['path'], human(e['size'])))
            print('  Mount the card, open Trash in Finder, select them, "Put Back".\n')
        live_names = {e['name'] for e in entries if e['live']}
        deleted = [e for e in entries if not e['live'] and e['size'] > 0
                   and not e['name'].startswith('._')
                   and e['name'].upper().endswith(MEDIA_EXT)
                   and fs.valid(e['first'])]
        print('  %d live files, %d deleted media entries found'
              % (len(entries) - len([e for e in entries if not e['live']]), len(deleted)))

        ref_heads = {}     # '.MP4' / '.LRF' -> first bytes of a healthy clip
        for e in entries:
            ext = os.path.splitext(e['name'].upper())[1]
            if (e['live'] and ext in MP4_EXT and ext not in ref_heads
                    and not e['name'].startswith('._') and fs.valid(e['first'])):
                h = dev.read(fs.coff(e['first']), 4096)
                if h[4:8] == b'ftyp' and mp4_prefix(h):
                    ref_heads[ext] = h

        for e in sorted(deleted, key=lambda x: x['name']):
            up = e['name'].upper()
            if args.lrf_only and not up.endswith('.LRF'):
                continue
            if e['name'] in live_names:
                status = 'still exists (copy is live)'
                report.append((e['name'], e['size'], status, ''))
                continue
            clusters = fs.chain(e['first'], e['nofat'], e['size'])
            if not e['nofat'] and len(clusters) * fs.cluster < e['size']:
                # FAT chain was cleared on delete - assume contiguous
                clusters = fs.chain(e['first'], True, e['size'])
            over = sum(1 for c in clusters if fs.allocated(c))
            pct = 100.0 * over / max(len(clusters), 1)
            head = dev.read(fs.coff(clusters[0]), 16)
            extra = ''
            if up.endswith(MP4_EXT):
                ok_head = head[4:8] == b'ftyp'
                if ok_head:
                    ext = mp4_extent(lambda o, n: dev.read(o, n), fs.coff(clusters[0]),
                                     fs.coff(clusters[0]) + e['size'])
                    if ext and ext[1].get('duration'):
                        extra = '%.0fs' % ext[1]['duration']
                    if ext and not ext[1]['complete']:
                        extra += ' (index missing - may need repair)'
            elif up.endswith(('.JPG', '.DNG')):
                ok_head = head[:2] == b'\xff\xd8' or head[:4] in (b'II*\0', b'MM\0*')
            else:
                ok_head = True
            runs, i = [], 0
            while i < len(clusters):
                j = i
                while j + 1 < len(clusters) and clusters[j + 1] == clusters[j] + 1:
                    j += 1
                runs.append((fs.coff(clusters[i]), (j - i + 1) * fs.cluster))
                i = j + 1
            # trim last run to exact size
            total, trimmed = 0, []
            for off, ln in runs:
                ln = min(ln, e['size'] - total)
                if ln > 0:
                    trimmed.append((off, ln))
                    total += ln
            salvageable = (not ok_head and up.endswith(MP4_EXT) and pct < 50
                           and os.path.splitext(up)[1] in ref_heads)
            if pct >= 99.9:
                status = 'OVERWRITTEN'
            elif salvageable:
                status = 'SALVAGE (start lost, %.0f%% overwritten)' % pct
            elif not ok_head:
                status = ('OVERWRITTEN (start lost, %.0f%% overwritten)' % pct
                          if pct else 'header gone')
            elif over:
                status = 'PARTIAL (%.0f%% overwritten)' % pct
            else:
                status = 'INTACT'
            report.append((e['name'], e['size'], status, extra))
            print('  %-40s %10s  %-28s %s' % (e['name'], human(e['size']), status, extra))
            if status.startswith(('OVERWRITTEN', 'header gone')):
                continue
            for off, ln in trimmed:
                claimed.append((off, off + ln))
            if args.list:
                continue
            if free_space(args.outdir) < e['size'] + (256 << 20):
                print('    ! not enough free space for this file - skipped')
                continue
            if salvageable:
                base, ext = os.path.splitext(e['name'])
                dst = unique(os.path.join(args.outdir, base + '_SALVAGED' + ext))
                err = salvage(dev, trimmed, total, ref_heads[os.path.splitext(up)[1]],
                              dst, e['mtime'])
                if err:
                    print('    salvage failed: %s' % err)
                    continue
            else:
                dst = unique(os.path.join(args.outdir, e['name']))
                copy_out(dev, dst, trimmed, total, e['mtime'])
            print('    saved -> %s' % dst)

    # ---------------- pass 2: carving unallocated space
    if not args.no_carve:
        print('\n[2/2] Carving free space for video headers (this reads the whole '
              'card; ~1 min per 5 GB) ...')
        claimed.sort()

        def is_claimed(o):
            return any(a <= o < b for a, b in claimed)

        align = fs.cluster if fs else SECTOR
        start = fs.heap_off if fs else 0
        end = (fs.heap_off + fs.nclusters * fs.cluster) if fs else dev.size
        chunk = 64 << 20
        pos, n_found, t0 = start, 0, time.time()
        while pos < end:
            blob = dev.read(pos, min(chunk + 8, end - pos))
            if not blob:
                break
            el = time.time() - t0
            rate = (pos - start) / el if el > 1 else 0
            eta = (end - pos) / rate if rate else 0
            print('\r  %5.1f%%  %s/s  ETA %dm   ' % (100.0 * (pos - start) / (end - start),
                                                    human(rate), eta // 60), end='', flush=True)
            next_pos = pos + chunk
            p = blob.find(b'ftyp')
            while p != -1 and p < chunk:
                off = pos + p - 4
                if off >= start and (off - start) % align == 0 and not is_claimed(off):
                    c = 2 + (off - fs.heap_off) // fs.cluster if fs else None
                    if fs is None or not fs.allocated(c):
                        ext = mp4_extent(lambda o, n: dev.read(o, n), off, end)
                        if ext and ext[0] > 64 << 10:
                            length, info = ext
                            n_found += 1
                            name = 'carved_%05d_at_%012x.MP4' % (n_found, off)
                            dur = ('%.0fs' % info['duration']) if info.get('duration') else ''
                            st = 'CARVED' + ('' if info['complete'] else ' (index missing)')
                            if fs:
                                cl = range(c, c + -(-length // fs.cluster))
                                ov = sum(1 for x in cl if fs.allocated(x))
                                if ov:
                                    st += ' %.0f%% overwritten' % (100.0 * ov / len(cl))
                            print('\r  %-40s %10s  %-28s %s' % (name, human(length), st, dur))
                            report.append((name, length, st, dur))
                            claimed.append((off, off + length))
                            if not args.list and not args.lrf_only:
                                if free_space(args.outdir) < length + (256 << 20):
                                    print('    ! not enough free space - skipped')
                                else:
                                    dst = os.path.join(args.outdir, name)
                                    copy_out(dev, dst, [(off, length)], length)
                                    print('    saved -> %s' % dst)
                            # jump past this clip
                            if off + length > pos + p:
                                skip_to = off + length
                                skip_to += (-(skip_to - start)) % align
                                if skip_to >= next_pos:
                                    next_pos = skip_to
                                    break
                                p = skip_to - pos + 3
                p = blob.find(b'ftyp', p + 1)
            pos = next_pos
        print('\r  carving done, %d extra clip(s) found.            ' % n_found)

    # ---------------- report
    if args.outdir:
        rp = os.path.join(args.outdir, 'recovery_report.csv')
        with open(rp, 'w') as f:
            f.write('name,bytes,status,notes\n')
            for r in report:
                f.write('"%s",%d,"%s","%s"\n' % r)
        print('\nReport: %s' % rp)
    ok = [r for r in report if r[2].startswith(('INTACT', 'CARVED', 'PARTIAL', 'SALVAGE'))]
    print('\nSUMMARY: %d recoverable item(s), %s total'
          % (len(ok), human(sum(r[1] for r in ok))))
    for s in ('INTACT', 'PARTIAL', 'SALVAGE', 'OVERWRITTEN', 'CARVED'):
        k = [r for r in report if r[2].startswith(s)]
        if k:
            print('  %-12s %4d  (%s)' % (s, len(k), human(sum(r[1] for r in k))))


if __name__ == '__main__':
    main()
