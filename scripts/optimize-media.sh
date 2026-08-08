#!/usr/bin/env bash
# Converts catalogue photography dropped into public/media into web-sized WebP.
#
# Workflow: drop a .png/.jpg into public/media, then run `npm run media`.
# The original is archived in media-src/ (never deployed, since only public/
# ships) and a .webp of the same basename takes its place in public/media.
#
# Re-running is safe: sources already converted are skipped unless the original
# is newer than its .webp.

set -euo pipefail

QUALITY=82
MAX_WIDTH=1400
MEDIA_DIR="public/media"
ARCHIVE_DIR="media-src"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "error: cwebp not found. Install it with: brew install webp" >&2
  exit 1
fi

cd "$(dirname "$0")/.."
mkdir -p "$ARCHIVE_DIR"

image_width() {
  if command -v magick >/dev/null 2>&1; then
    magick identify -format '%w' "$1[0]" 2>/dev/null
  elif command -v sips >/dev/null 2>&1; then
    sips -g pixelWidth "$1" 2>/dev/null | awk '/pixelWidth/{print $2}'
  fi
}

converted=0
skipped=0
before_total=0
after_total=0

while IFS= read -r source; do
  base="$(basename "$source")"
  stem="${base%.*}"
  target="$MEDIA_DIR/$stem.webp"

  if [ -f "$target" ] && [ "$target" -nt "$source" ]; then
    skipped=$((skipped + 1))
    continue
  fi

  before=$(wc -c <"$source" | tr -d ' ')
  width="$(image_width "$source")"

  # cwebp -resize scales up as happily as down, so only pass it when the source
  # is genuinely wider than the cap.
  if [ -n "$width" ] && [ "$width" -gt "$MAX_WIDTH" ]; then
    cwebp -quiet -q "$QUALITY" -resize "$MAX_WIDTH" 0 "$source" -o "$target"
  else
    cwebp -quiet -q "$QUALITY" "$source" -o "$target"
  fi

  after=$(wc -c <"$target" | tr -d ' ')
  before_total=$((before_total + before))
  after_total=$((after_total + after))
  converted=$((converted + 1))

  mv "$source" "$ARCHIVE_DIR/$base"
  printf '  %-28s %5sKB -> %4sKB\n' "$stem" "$((before / 1024))" "$((after / 1024))"
done < <(find "$MEDIA_DIR" -maxdepth 1 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) | sort)

if [ "$converted" -eq 0 ]; then
  echo "Nothing to convert ($skipped already optimized)."
else
  echo
  echo "Converted $converted file(s): $((before_total / 1024 / 1024))MB -> $((after_total / 1024))KB"
  echo "Originals archived in $ARCHIVE_DIR/"
  if [ "$skipped" -gt 0 ]; then echo "Skipped $skipped already-optimized file(s)."; fi
fi
