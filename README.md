# Prodrome Website

This is a one-page static site for `theprodrome.com`. You can upload the contents of this folder to a regular webhost.

## Where To Put Assets

Put image files in:

```text
assets/images/
```

The current site references these organized filenames:

```text
poster.webp
poster-sfw.webp
trailer-poster.webp
still-1.webp
still-2.webp
still-3.webp
still-4.webp
jason-mark.webp
behind-the-scenes-tattoo.webp
directors-statement.webp
jason-snow.webp
tom-kunzman.webp
deonte-finch.webp
favicon.webp
og-image.webp
```

Optional folders are already here if you want them later:

```text
assets/video/
assets/fonts/
```

## Trailer

The trailer is Vimeo video `1214477179` (unlisted, hash `a312ae3c1b`).

The page does not load the Vimeo player on arrival. It shows a cover image and
only swaps in the iframe when someone clicks play, which keeps the initial load
light. If you change the video, update it in three places:

- `script.js` — the `iframe.src` built in the play handler
- `index.html` — the `<noscript>` fallback iframe
- `index.html` — `embedUrl` in the `Movie` structured data

The cover image is `assets/images/trailer-cover.jpg`, a 16:9 crop of
`trailer-poster.webp`. Replace it with another 1600x900 image to change it.

## Intro

`intro.js` runs the blood intro over the whole page. It lasts under 1.5s, plays
once per browser session, is skipped entirely for visitors who ask for reduced
motion, and can be dismissed with any click or keypress. If JavaScript is off
the overlay never appears at all.

## Footer Links

There are no social icons. The footer carries two buttons: "Text Me", and a
secondary one linking back to `realjsnow.com`.
