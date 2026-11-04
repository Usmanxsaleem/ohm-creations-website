# OHM Creations: Portfolio Website

The portfolio and services website for **OHM Creations**, a creative studio offering website design, digital marketing, SEO, 2D art, 3D art, animation and VTuber model avatars.

Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. You can also just double-click `index.html`.

## Structure

```
index.html          page content (all sections)
styles.css          theme and layout (colors come from the logo: navy → cyan)
script.js           animations, portfolio filter, lightbox, contact form
assets/logo.png     transparent logo (logo.jpg is the original)
assets/favicon.png
assets/gallery/     portfolio images (from Behance)
```

## Things to fill in before going live

Search `index.html` for `TODO`:

1. **Contact form**: create a free form at https://formspree.io and replace `YOUR_FORM_ID` in the form `action`.
2. **Email**: replace `hello@ohmcreations.com` with your real address.
3. **Social links**: replace the `#` links for Instagram, LinkedIn, Facebook and X, or delete the ones you don't use.

## Adding portfolio pieces

Put an image (ideally `.webp`, about 1000px wide) in `assets/gallery/`, then copy one `<figure class="tile">` block in the `#work` section. Set `data-cat` to `art`, `model`, `book` or `seo` so it shows up under the right filter.

## Deploy (free)

- **GitHub Pages**: repo Settings → Pages → deploy from the `main` branch, root folder. On a free account the repo has to be public.
- **Netlify / Vercel**: drag and drop the folder, or connect the repo. No build command needed.
