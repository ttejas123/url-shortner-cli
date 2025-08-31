# URL Shortener CLI

A simple TypeScript command‑line tool to create and manage short codes for URLs, backed by a lightweight JSON database (tiny-db). It can:
- Generate a short code for a given URL
- Resolve a short code back to the original URL
- Open the original URL in your default browser and track hits
- List all stored links
- Delete a short code

## Prerequisites
- Node.js 18+ (recommended)
- npm 9+ or compatible package manager (pnpm/yarn instructions are analogous)

## Install dependencies
This project uses tiny-db for storage. If you’re using this repository directly, install dependencies first:

```bash
npm install
# Ensure tiny-db is installed (in case it isn't in package.json yet)
npm install tiny-db --save
```

## Build
Transpile the TypeScript source to JavaScript:

```bash
npm run build
```

The compiled output goes to `dist/`.

## Link the CLI (optional, for a global command)
Linking lets you run the CLI as `url-short` from anywhere on your machine:

```bash
npm link
```

After linking, you can run:

```bash
url-short -h
```

To remove the link later:

```bash
npm unlink -g url-shortner-cli
```

Alternatively, without linking you can run the CLI in dev mode:

```bash
npm run dev -- -h
# or
node dist/index.js -h
```

## Where data is stored (tiny-db)
This tool uses `tiny-db` and initializes a database with the name `links.json`. By tiny-db’s defaults, the data file is typically stored under a folder in your home directory, e.g. on macOS/Linux:

- `~/.tinydb/links.json`

This means your stored short links will persist across runs. You can open or back up this file directly if needed.

## Usage
Run `url-short -h` to see all options:

```
Usage:
  url-short -s <url> [--alias <code>] [--len <n>] Create a short code
  url-short -e <code>                                 Print original URL
  url-short -o <code>                                   Open in browser
  url-short -l                                          List all
  url-short -d <code>                                 Delete code
  url-short -h                                          Show help
```

Notes:
- If your input URL doesn’t include a scheme, `https://` will be added automatically (e.g., `example.com` becomes `https://example.com/`).
- `--alias` lets you specify a custom code (must be unique).
- `--len` controls random code length when no alias is provided (default 6).

### Examples
Create a short code for a URL:

```bash
url-short -s https://example.com/some/long/path
# -> prints something like: Ab3xYz
```

Create with a custom alias:

```bash
url-short -s https://example.com --alias home
# -> prints: home
```

Expand a code to the original URL:

```bash
url-short -e home
# -> https://example.com/
```

Open a code in the default browser and increment hits:

```bash
url-short -o home
# -> Opened https://example.com/
```

List all stored links (shows hits and creation time):

```bash
url-short -l
# home   https://example.com/   [hits:3] [created:2025-08-31T09:20:00.000Z]
```

Delete a code:

```bash
url-short -d home
# -> Deleted.
```

## Running tests
This project uses Vitest.

- Run the test suite once:

```bash
npm test
```

- Watch mode:

```bash
npm run test:watch
```

## Development notes
- Dev run (without building):

```bash
npm run dev -- -s example.com
```

- Build and run from dist:

```bash
npm run build
node dist/index.js -l
```

## Troubleshooting
- Command not found: If `url-short` isn’t recognized, ensure you ran `npm run build` followed by `npm link`, or run via `npm run dev`/`node dist/index.js`.
- tiny-db not found: If you see a module resolution error for `tiny-db`, install it explicitly:

```bash
npm install tiny-db --save
```

- Data file location: On most systems it will be `~/.tinydb/links.json`. If the file doesn’t exist yet, it will be created when you store your first link.

## License
MIT