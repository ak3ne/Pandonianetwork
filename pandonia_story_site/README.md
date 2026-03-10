# Pandonia Story Site

Static storytelling site about the Pandonia Global Network, Pandora instruments, and Level-2 NO2 interpretation.

## Deployment target

Recommended host: Cloudflare Pages.

This project is a static site. There is no build step and no backend.

## Recommended repository layout

Use `pandonia_story_site` itself as the repository root.

Do not publish from `/Users/akane/Documents/New project`, because that parent directory contains unrelated files.

## Cloudflare Pages settings

If your GitHub repository contains only the contents of this folder:

- Framework preset: `None`
- Build command: leave blank
- Build output directory: `.`
- Root directory: leave blank

If the UI insists on a build command, use:

- Build command: `exit 0`

If your GitHub repository contains the parent project and this site stays in a subfolder:

- Framework preset: `None`
- Build command: leave blank
- Build output directory: `.`
- Root directory: `pandonia_story_site`

If the UI insists on a build command, use:

- Build command: `exit 0`

## Fastest publish path

1. Create a new GitHub repository for this site.
2. Upload only the contents of `pandonia_story_site`.
3. In Cloudflare Dashboard:
   - go to `Workers & Pages`
   - click `Create`
   - choose `Pages`
   - choose `Connect to Git`
   - connect the GitHub repository
4. Use the settings listed above.
5. Deploy.
6. Cloudflare will give you a public URL like `your-project.pages.dev`.

## Custom domain

After the first successful deploy:

1. Open the Pages project.
2. Go to `Custom domains`.
3. Add your domain.
4. Follow Cloudflare DNS instructions.

## Current external dependencies

The site is deployable as-is, but it still depends on some external hosted resources:

- Google Fonts
- `three.min.js` from `unpkg`
- `globe.gl` from `unpkg`
- Plotly CDN
- Kyushu University logo loaded from the official university website

For a fully self-contained public deployment, those should eventually be vendored locally.

## Local verification before deploy

Open `index.html` in a browser and check:

- hero globe loads
- station dots respond
- inline instrument video plays
- maps and charts render
- footer logos load

## Official references used in the site

- https://www.pandonia-global-network.org/home/
- https://data.hetzner.pandonia-global-network.org/
- https://datachecker.pandonia-global-network.org/
- https://pandora.gsfc.nasa.gov/
