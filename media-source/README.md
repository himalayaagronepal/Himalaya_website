# Media source files

Original, un-optimized assets kept **outside** `public/` so they are not served
or deployed. The optimized derivatives in `public/` are what the site actually
uses (see `app/components/farms/FarmsHeroVideo.tsx` and the shared
`app/components/BackgroundVideo.tsx`).

Delivery is **Cloudinary-first** — the master is uploaded to Cloudinary, which
serves adaptive, CDN-cached derivatives. The hero `<video>` lists two CDN
sources best-first: VP9/webm (`f_webm,vc_vp9,q_auto:best,c_limit,w_1920`) for
Chrome/Firefox/Edge/Android, then H.264/mp4 (`f_mp4,q_auto:good,c_limit,w_1920`)
for Safari/iOS. VP9 gives the same visible quality as H.264 at ~⅔ the bytes, so
1080p stays high quality and buffer-free. The self-hosted `public/*_opt_*.mp4`
files are the last-resort fallback if the CDN is unreachable; the
`*_poster_*.jpg` files are the instant LCP stills.

## hariyali_farms_master.mp4

Raw 1920×1080, 24 fps, ~134 s, ~16 Mbps source for the **`/farms` hero**.

```bash
# Optimized self-hosted fallback (H.264, no audio, 1080p, faststart) -> public/hariyali_farms_opt_v1.mp4
ffmpeg -i hariyali_farms_master.mp4 -map 0:v:0 -an -vf "scale=1920:-2" \
  -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart \
  ../public/hariyali_farms_opt_v1.mp4

# Poster (LCP) -> public/hariyali_farms_poster_v1.jpg
ffmpeg -ss 2 -i hariyali_farms_master.mp4 -frames:v 1 -vf "scale=1920:-2" -q:v 4 \
  ../public/hariyali_farms_poster_v1.jpg

# High-quality Cloudinary master (2-pass, kept < 100 MB — Cloudinary's upload cap) -> hariyali_farms_cloud.mp4
ffmpeg -y -i hariyali_farms_master.mp4 -map 0:v:0 -an -vf "scale=1920:-2" \
  -c:v libx264 -b:v 5300k -maxrate 6500k -bufsize 13000k -pass 1 -preset medium \
  -pix_fmt yuv420p -f mp4 /dev/null
ffmpeg -y -i hariyali_farms_master.mp4 -map 0:v:0 -an -vf "scale=1920:-2" \
  -c:v libx264 -b:v 5300k -maxrate 6500k -bufsize 13000k -pass 2 -preset medium \
  -pix_fmt yuv420p -movflags +faststart hariyali_farms_cloud.mp4

# Upload that master to Cloudinary (public_id: hariyali_farms)
node ../scripts/upload-hariyali-video.js
```

## himalaya_agro_bg.mp4

Raw 1920×1080, ~32.6 s, ~8.34 Mbps source for the **Poultry Sheds banner**
background (formerly the `/farms` hero). Cloudinary public_id `himalaya_agro_bg_v2`,
self-hosted fallback `public/himalaya_agro_bg_opt_v2.mp4`,
poster `public/himalaya_agro_poster_v2.jpg`.

Regenerate the optimized files from it with:

```bash
# Optimized MP4 (H.264, no audio, 720p, faststart) -> public/himalaya_agro_bg_opt.mp4
ffmpeg -i himalaya_agro_bg.mp4 -map 0:v:0 -an -vf "scale=1280:-2" \
  -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart \
  ../public/himalaya_agro_bg_opt.mp4

# Smaller WebM (VP9, no audio, 720p) -> public/himalaya_agro_bg.webm
ffmpeg -i himalaya_agro_bg.mp4 -map 0:v:0 -an -vf "scale=1280:-2" \
  -c:v libvpx-vp9 -b:v 0 -crf 44 -row-mt 1 -cpu-used 2 -deadline good \
  -pix_fmt yuv420p ../public/himalaya_agro_bg.webm

# Poster from the loop-start frame (~66 KB) -> public/himalaya_agro_poster.jpg
ffmpeg -ss 0 -i himalaya_agro_bg.mp4 -frames:v 1 -vf "scale=1280:-2" -q:v 15 \
  ../public/himalaya_agro_poster.jpg
```
