# gabrielreisesilva.github.io

Portfolio site for Gabriel Reis e Silva — Senior Technical Designer at Halo Studios.

Live at **https://gabrielreisesilva.github.io/**.

## Local preview

Static HTML/CSS, no build step. From this folder:

```powershell
python -m http.server 8765
# open http://localhost:8765/
```

## Structure

```
.
├── index.html                    # Landing
├── about/                        # About + résumé + contact
├── projects/                     # Game, tool, installation, and experiment pages
├── case-studies/                 # Deep-dive case studies
├── assets/img/                   # All images and videos
├── styles/site.css               # All styles (single file, no framework)
└── scripts/                      # Small vanilla-JS helpers
```

## Publishing

Every push to `main` is served by GitHub Pages from the repo root. The `.nojekyll`
file at the root disables Jekyll processing so file/folder names with leading
underscores are served as-is if they ever appear.
