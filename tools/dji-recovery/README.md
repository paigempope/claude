# DJI SD-card clip recovery

`dji_recover.py` recovers deleted DJI clips (`.MP4`, `.LRF` proxies, `.JPG`) from an
exFAT SD card. It **only reads** the card and never writes to it.

What it does:

1. **Recovers files by their exFAT entries.** Deleted files usually keep their directory
   entry, so clips come back with their **original names and dates**. The allocation
   bitmap shows whether any part of a clip has been overwritten by newer recordings.
2. **Salvages clips whose start was overwritten.** It copies the header from a healthy
   clip on the same card and points it at the clip's index, which is still intact.
   Only the overwritten seconds are lost.
3. **Carves free space.** It scans every unallocated cluster for MP4 headers and uses the
   MP4 box structure to get each clip's exact length. This catches clips whose directory
   entries were wiped.
4. **Finds files still in the Mac Trash.** It flags clips that are still in the card's
   hidden `.Trashes` folder.

## Run it on a Mac

**Stop recording to the card first.** Every new clip can overwrite deleted footage.

```bash
# 1. Find the card. It's the ~256 GB "external, physical" disk, e.g. /dev/disk4
diskutil list

# 2. Unmount it. Don't eject it.
diskutil unmountDisk /dev/disk4

# 3. Look first. This saves nothing and shows what's recoverable.
sudo python3 ~/Downloads/dji_recover.py /dev/rdisk4 --list

# 4. Recover to a folder on a drive with enough free space (NOT the SD card)
sudo python3 ~/Downloads/dji_recover.py /dev/rdisk4 ~/Desktop/Recovered
```

Note the **r** in `/dev/rdisk4`. The raw device is much faster to read.

- The card is read twice: first the directories (seconds), then the whole card for
  carving. On a 256 GB card, carving takes about 45–60 minutes. Add `--no-carve` to skip it.
- Not enough space? `--lrf-only` saves only the small low-res proxies.
- If the Mac asks to install developer tools when you run `python3`, accept and re-run.
- `recovery_report.csv` in the output folder lists every clip and its status.

## Status meanings

| Status | Meaning |
|---|---|
| `INTACT` | Byte-for-byte original |
| `PARTIAL (x% overwritten)` | Saved, but x% of it is now newer footage, so expect glitches |
| `SALVAGE` | Start was overwritten. Rebuilt as `*_SALVAGED.MP4`, so the first moments are lost |
| `CARVED` | Found by raw scan, named `carved_NNNNN_at_<offset>.MP4` (LRF proxies included) |
| `OVERWRITTEN` | Gone: newer recordings replaced it |

Try VLC for any file QuickTime won't open.
