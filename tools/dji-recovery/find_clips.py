#!/usr/bin/env python3
"""
find_clips.py - search a whole Mac (all drives, Trash, Photos library, app
caches) for DJI clips, including renamed copies.

A clip matches if
  * its name contains DJI_<timestamp>_<number> with a wanted number, or
  * it is a video whose internal recording date (MP4 'mvhd' box) falls in the
    wanted date window - this catches copies that were renamed, e.g. by the
    Photos library or an editing app.

Usage:
  sudo python3 find_clips.py                       # defaults below
  sudo python3 find_clips.py --numbers 898-999,1-71 --dates 2001-02-20:2001-03-05
"""

import argparse
import datetime
import os
import re
import struct
import sys
import time

VIDEO_EXT = ('.mp4', '.mov', '.lrf', '.m4v')
SKIP_PREFIXES = ('/System', '/dev', '/proc', '/private/var/vm', '/cores',
                 '/Volumes/Recovery', '/Volumes/Preboot', '/Volumes/VM')
NAME_RE = re.compile(r'DJI_(\d{14})_(\d{4})', re.I)
EPOCH_1904 = datetime.datetime(1904, 1, 1)


def parse_numbers(spec):
    out = set()
    for part in spec.split(','):
        a, _, b = part.partition('-')
        out.update(range(int(a), int(b or a) + 1))
    return out


def mvhd_date(path):
    """Recording date stored in an MP4/MOV, or None."""
    try:
        with open(path, 'rb') as f:
            size = os.fstat(f.fileno()).st_size
            pos = 0
            while pos + 8 <= size:
                f.seek(pos)
                h = f.read(16)
                if len(h) < 8:
                    return None
                bsize, typ = struct.unpack('>I4s', h[:8])
                hdr = 8
                if bsize == 1:
                    bsize, hdr = struct.unpack('>Q', h[8:16])[0], 16
                elif bsize == 0:
                    bsize = size - pos
                if bsize < hdr:
                    return None
                if typ == b'moov':
                    f.seek(pos + hdr)
                    moov = f.read(min(bsize - hdr, 1 << 16))
                    k = moov.find(b'mvhd')
                    if k < 4:
                        return None
                    ver = moov[k + 4]
                    secs = (struct.unpack_from('>Q', moov, k + 8)[0] if ver == 1
                            else struct.unpack_from('>I', moov, k + 8)[0])
                    return EPOCH_1904 + datetime.timedelta(seconds=secs)
                if not typ.isalnum() and typ not in (b'free', b'skip', b'mdat', b'wide', b'ftyp'):
                    return None
                pos += bsize
    except (OSError, OverflowError, struct.error):
        return None
    return None


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--numbers', default='898-999,1-71')
    ap.add_argument('--dates', default='2001-02-20:2001-03-05',
                    help='internal recording date window, YYYY-MM-DD:YYYY-MM-DD')
    ap.add_argument('--out', default=None, help='report file (default: Desktop)')
    ap.add_argument('roots', nargs='*', default=['/'])
    args = ap.parse_args()

    want = parse_numbers(args.numbers)
    d0, d1 = [datetime.datetime.strptime(x, '%Y-%m-%d') for x in args.dates.split(':')]
    d1 += datetime.timedelta(days=1)
    home = os.path.expanduser('~' + os.environ.get('SUDO_USER', ''))
    out = args.out or os.path.join(home, 'Desktop', 'dji_search_report.txt')

    by_name, by_date, denied = [], [], []
    seen = set()
    scanned, t0, last = 0, time.time(), 0
    for root in args.roots:
        for dirpath, dirnames, filenames in os.walk(root, onerror=lambda e: denied.append(e.filename)):
            if dirpath.startswith(SKIP_PREFIXES) and dirpath != '/':
                dirnames[:] = []
                continue
            for fn in filenames:
                p = os.path.join(dirpath, fn)
                scanned += 1
                if time.time() - last > 2:
                    last = time.time()
                    print('\r  %d files checked, %d name matches, %d renamed-copy matches   '
                          % (scanned, len(by_name), len(by_date)), end='', flush=True)
                try:
                    st = os.lstat(p)
                except OSError:
                    continue
                if not os.path.isfile(p) or os.path.islink(p):
                    continue
                key = (st.st_dev, st.st_ino)
                if key in seen:
                    continue
                seen.add(key)
                m = NAME_RE.search(fn)
                if m and int(m.group(2)) in want:
                    by_name.append((int(m.group(2)), m.group(1), st.st_size, p))
                    continue
                if fn.lower().endswith(VIDEO_EXT) and st.st_size > (100 << 10) and not m:
                    d = mvhd_date(p)
                    if d and d0 <= d < d1:
                        by_date.append((d, st.st_size, p))

    print('\r  %d files checked in %d min.%s' % (scanned, (time.time() - t0) // 60, ' ' * 30))
    lines = []
    nums = sorted({n for n, _, _, _ in by_name}, key=lambda n: (n < 500, n))
    lines.append('CLIPS FOUND BY NAME: %d files, %d different clip numbers' % (len(by_name), len(nums)))
    for n, ts, size, p in sorted(by_name, key=lambda r: (r[0] < 500, r[0], r[3])):
        lines.append('  %04d  %8.1f MB  %s' % (n, size / 1e6, p))
    lines.append('')
    lines.append('POSSIBLE RENAMED COPIES (video recorded %s to %s): %d'
                 % (args.dates.split(':')[0], args.dates.split(':')[1], len(by_date)))
    for d, size, p in sorted(by_date):
        lines.append('  %s  %8.1f MB  %s' % (d.strftime('%Y-%m-%d %H:%M:%S'), size / 1e6, p))
    missing = sorted(want - set(nums), key=lambda n: (n < 500, n))
    lines.append('')
    lines.append('CLIP NUMBERS NOT FOUND BY NAME: %d' % len(missing))
    lines.append('  ' + ' '.join('%04d' % n for n in missing))
    prot = sorted({d for d in denied if d and ('Library' in d or 'Trash' in d or 'Photos' in d)})
    if prot:
        lines.append('')
        lines.append('COULD NOT OPEN %d protected folder(s), e.g.:' % len(prot))
        lines += ['  ' + d for d in prot[:10]]
        lines.append('  -> give Terminal "Full Disk Access" (System Settings > Privacy & '
                     'Security) and run again.')
    text = '\n'.join(lines)
    print(text)
    try:
        with open(out, 'w') as f:
            f.write(text + '\n')
        print('\nReport saved to %s' % out)
    except OSError as e:
        print('\n(could not save report: %s)' % e)


if __name__ == '__main__':
    main()
