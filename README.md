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

The trailer is currently using a sample Vimeo embed in `index.html`.

When the real trailer is uploaded to Vimeo, replace the iframe `src` with your Vimeo player URL:

```html
https://player.vimeo.com/video/YOUR_VIDEO_ID?title=0&byline=0&portrait=0
```

## Social Links

The TikTok and Instagram links are placeholders right now. Search for `href="#"` in `index.html` and replace those values with the real profile URLs.
