# Decoupled Drupal Front-End

A small **React + TypeScript** front-end for a **Drupal** CMS, built as a
learning project. Drupal owns the content; this app fetches each region of the
page from Drupal as JSON and renders it.

Right now it renders the **site header** (name, logo, main menu). It's
structured so that the footer, main content, and other regions are added the
same way — one component each.

---

## Architecture

```
  ┌─────────────────────────┐        HTTP + JSON        ┌────────────────────────┐
  │  front.ddev.site         │  ───────────────────────▶ │  dtest.ddev.site        │
  │  static files, no PHP    │   GET /ts-demo/header     │  Drupal CMS             │
  │  (this repo → html/)     │  ◀─────────────────────── │  custom endpoint        │
  │  React mounts in #app    │   { siteName, menu, … }   │  + CORS for this origin │
  └─────────────────────────┘                           └────────────────────────┘
```

- The SPA is plain static files. A web server points at `html/`.
- Drupal runs on a **separate host** and answers **cross-origin** requests;
  CORS is enabled on the Drupal side for the SPA's origin.
- Local dev is **HTTP only** (the ddev environment has no trusted TLS certs, so
  a browser `fetch()` to `https://` Drupal fails). Load the SPA over `http://`.

The Drupal base URL lives in one place: [`html/src/api.ts`](html/src/api.ts).

---

## Run it

```bash
npm install
npm run build      # type-check, then bundle html/src → html/dist/front.js
```

Serve `html/` with any static server and open it over HTTP. During development:

```bash
npm run watch      # rebuild on save (reload the browser yourself)
```

`html/dist/` is generated and git-ignored — `npm run build` recreates it.

---

## Project structure

```
html/
├── index.html              minimal shell — just <div id="app"> + the bundle
├── css/front.css           one style block per region component
└── src/
    ├── front.ts            entry point — mounts <App> into #app
    ├── api.ts              DRUPAL_BASE + getJson<T>(path) helper
    ├── App.tsx             composes the page from region components
    └── components/
        ├── Header.tsx      CONTAINER  — fetches /ts-demo/header, owns loading/error
        └── Menu.tsx        PRESENTATIONAL — pure recursive <nav>, no fetching
```

The **container / presentational** split in `Header` + `Menu` is the pattern to
repeat: one component fetches and holds state, small child components just
render props.

---

## Adding a region

1. **Drupal side** — expose a JSON endpoint, e.g. `GET /ts-demo/footer`
   returning whatever that region needs.
2. **`api.ts`** — nothing to change; call the shared helper.
3. **New container component** — copy `Header.tsx`:

   ```tsx
   type FooterData = { /* the endpoint's shape */ };

   export function Footer() {
       const [state, setState] = useState<...>({ phase: 'loading' });
       useEffect(() => {
           let cancelled = false;
           getJson<FooterData>('/ts-demo/footer')
               .then((data) => !cancelled && setState({ phase: 'ready', data }))
               .catch(/* … */);
           return () => { cancelled = true; };
       }, []);
       // loading / error / ready → markup
   }
   ```

4. **`App.tsx`** — drop `<Footer />` into the tree.
5. **`css/front.css`** — add a `.site-footer` block.

---

## Backend contract

The header endpoint is served by a custom Drupal module. It returns:

```json
{
  "siteName": "My Site",
  "slogan":   "",
  "logoUrl":  "http://dtest.ddev.site/core/themes/olivero/logo.svg",
  "menu": [
    { "title": "Home", "url": "/", "children": [] }
  ]
}
```

The controller, for reference (lives in the Drupal module, not this repo):

```php
public function header(): CacheableJsonResponse {
    $site = $this->configFactory->get('system.site');
    $themeName = (string) $this->configFactory->get('system.theme')->get('default');

    $data = [
        'siteName' => (string) $site->get('name'),
        'slogan'   => (string) $site->get('slogan'),
        'logoUrl'  => $this->logoUrl($themeName),
        'menu'     => $this->mainMenu(),   // main menu tree → [{title, url, children}]
    ];

    $cache = new CacheableMetadata();
    $cache->addCacheableDependency($site);
    $cache->addCacheTags(['config:system.menu.main']);

    $response = new CacheableJsonResponse($data);
    $response->addCacheableDependency($cache);
    return $response;
}
```

CORS is configured in Drupal's `services.yml` to allow the SPA origin for
`GET`, `HEAD`, and `OPTIONS`.
