# Build & Deploy

This guide describes how to build the library and publish its artifacts for HTML integration, npm, and CDN distribution.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/)

## Install dependencies

```sh
pnpm install
```

The playground has its own lockfile and is installed separately when needed:

```sh
pnpm --dir playground install
```

## Development

Watch and rebuild the library on file changes:

```sh
pnpm dev
```

Run tests:

```sh
pnpm test
```

## Production build

```sh
pnpm build
```

This runs two Rollup builds in parallel:

| Script | Config | Output |
| --- | --- | --- |
| `pnpm rollup:full` | `rollup-full.config.mjs` | Full build with GUI |
| `pnpm rollup:core` | `rollup-core.config.mjs` | Core build without GUI |

### Artifacts

The build produces the following files under `dist/`:

| File | Description |
| --- | --- |
| `dist/cookieconsent.umd.js` | UMD bundle — exposes `CookieConsent` globally (HTML / script tag) |
| `dist/cookieconsent.esm.js` | ESM bundle — for bundlers (Vite, Webpack, etc.) |
| `dist/cookieconsent.css` | Complete stylesheet |
| `dist/css-components/*.css` | Optional modular CSS (base, modals, color schemes) |
| `dist/core/cookieconsent-core.umd.js` | Core-only UMD bundle (no GUI) |
| `dist/core/cookieconsent-core.esm.js` | Core-only ESM bundle (no GUI) |

The `dist/` folder and `types/` are included in the published npm package (`package.json` → `"files"`).

## HTML integration

For a plain HTML website, only two files are required:

- `dist/cookieconsent.css`
- `dist/cookieconsent.umd.js`

Example:

```html
<html>
    <head>
        <link rel="stylesheet" href="/path/to/cookieconsent.css">
    </head>
    <body>
        <script type="module" src="cookieconsent-config.js"></script>
    </body>
</html>
```

```javascript
// cookieconsent-config.js
import '/path/to/cookieconsent.umd.js';

CookieConsent.run({
    // configuration
});
```

For CDN URLs and framework-specific setups, see the [Getting Started guide](https://cookieconsent.orestbida.com/essential/getting-started.html).

## Deploy / release

### 1. Prepare a release

1. Update the version in `package.json`.
2. Run `pnpm build` to regenerate `dist/`.
3. Run `pnpm test` to verify the build.
4. Commit the changes, including the updated `dist/` files.

### 2. Create a GitHub release

Publishing a release on GitHub triggers the [NPM Registry workflow](.github/workflows/publish.yml), which publishes the package to [npm](https://www.npmjs.com/package/vanilla-cookieconsent):

- **Stable release** → published with the `latest` tag
- **Prerelease** → published with the `next` tag

The workflow requires an `NPM_TOKEN` secret configured in the repository settings.

### 3. Distribution channels

Once a release tag exists, artifacts are available through:

| Channel | Usage |
| --- | --- |
| **npm** | `pnpm add vanilla-cookieconsent@<version>` |
| **jsDelivr (CDN)** | `https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@<version>/dist/cookieconsent.umd.js` |
| **GitHub Releases** | Download the `dist/` folder from the [releases page](https://github.com/orestbida/cookieconsent/releases) |
| **Self-hosted** | Copy `dist/cookieconsent.css` and `dist/cookieconsent.umd.js` to your static file server |

### 4. Documentation site

The documentation is built separately with VitePress:

```sh
pnpm docs:build
```

## CI

- **CircleCI** (`.circleci/config.yml`) runs tests on changes to `src/` or `tests/`.
- **GitHub Actions** (`.github/workflows/publish.yml`) publishes to npm when a GitHub release is published.
