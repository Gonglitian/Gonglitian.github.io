# Litian Gong

This site has moved to **[https://litiangong.com/](https://litiangong.com/)**.

本站已迁移至 **[https://litiangong.com/](https://litiangong.com/)**。

[https://gonglitian.github.io/](https://gonglitian.github.io/) now only redirects visitors to the new site. Each page includes:

- `<meta http-equiv="refresh" content="0; url=https://litiangong.com/">`
- `<link rel="canonical" href="https://litiangong.com/">`
- a `location.replace("https://litiangong.com/")` script
- a visible fallback link

`404.html` does the same thing, so old deep links still leave this host. `robots.txt` allows crawling so search engines can see the canonical URL and the refresh. There is no `sitemap.xml` on this host. `.nojekyll` disables Jekyll so GitHub Pages serves these files as-is.

The new site is a single homepage (plus a blog that did not exist here). Publications, projects, awards, service, and CV all live on that homepage, so every old path redirects to `https://litiangong.com/`.

| Old URL | New URL |
| --- | --- |
| `/` | https://litiangong.com/ |
| `/publications/` | https://litiangong.com/ |
| `/project/` | https://litiangong.com/ |
| `/awards/` | https://litiangong.com/ |
| `/services/` | https://litiangong.com/ |
| `/cv/` | https://litiangong.com/ |
| `/edit/` | https://litiangong.com/ |
| any other path | https://litiangong.com/ |

The previous source is on [`archive/old-site`](https://github.com/Gonglitian/Gonglitian.github.io/tree/archive/old-site). The last published build is on [`archive/old-gh-pages`](https://github.com/Gonglitian/Gonglitian.github.io/tree/archive/old-gh-pages). This repository stays open so GitHub Pages can keep serving the redirect.
