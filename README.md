# db_project

A React web app for buying and selling, with sample data and no server yet.

## Overview

A single-page React app in `frontend/`, built with Vite. Users sign in with any email and password, then buy from a sample catalog, sell from their own shop and view sales reports. All data is generated sample data, kept in memory until logout. There is no backend or database yet.

## Features

- Home, sign-in and sign-up pages. Sign-up only shows a "not connected" notice.
- A personal area, reachable only by signing in, with three modes: Buy, Sell and Reports.
- **Buy → Shopping:** 237 sample products with search, filters, sorting and paging.
- **Buy → Pending Orders:** orders waiting for the seller; view details or cancel.
- **Buy → Purchases:** approved orders; view details or add their products to the cart again.
- **Cart:** a window at the bottom right of the Buy pages. "Order" creates one pending order per seller.
- **Sell → Orders:** orders from buyers; approve or unapprove (delete) each one.
- **Sell → Products:** the user's shop products; edit, remove or add products.
- **Reports:** monthly sales and purchases from placeholder figures, as tiles, a chart and a table.
- A profile page and log out.
- Light and dark mode, following the system setting.
- Nothing is sent over the network or saved in the browser.

## Tech stack

| Component | Technology | Version |
| --- | --- | --- |
| Language | JavaScript (JSX) | ES modules |
| UI library | React and React DOM | 19.3.1 |
| Routing | React Router | 8.5.1 |
| Build tool | Vite with `@vitejs/plugin-react` | 8.3.8 (plugin 6.3.0) |
| Styling | CSS Modules and CSS custom properties | Built into Vite |
| Tests | Vitest, React Testing Library, jsdom | 5.1.0, 16.3.3, 29.1.1 |
| Linting | ESLint | 10.14.0 |
| Container | Node.js build, nginx server | `node:24-alpine`, `nginx:1.30-alpine` |

## Prerequisites

| Tool | Version | Purpose |
| --- | --- | --- |
| Node.js | 22.22+, 24.x or 26+ (tested with 24.11.1) | Dev server, build, tests, lint |
| npm | Comes with Node.js | Installs dependencies, runs scripts |
| Docker | Tested with 28.5.1 | Runs the app without Node.js |

## Installation

1. Get the project files. TODO: verify (no git repository yet, so no clone URL).

2. Go to the frontend folder. The npm commands below run from there.

   ```bash
   cd frontend
   ```

3. Install the dependencies. Run it once, and again when `package.json` changes. Not needed for Docker.

   ```bash
   npm install
   ```

## Configuration

The app reads no environment variables. Configuration files:

- `compose.yaml`: the `frontend` service, on port 8080.
- `frontend/vite.config.js`: Vite and Vitest settings.
- `frontend/eslint.config.js`: lint rules.
- `frontend/nginx.conf`: how nginx serves the app in Docker.

## Running

### Development

In `frontend/`, start the dev server at `http://localhost:5173`. It reloads on every save; Ctrl+C stops it.

```bash
npm run dev
```

### Production

Build the app into `frontend/dist/`. Run it after code changes.

```bash
npm run build
```

Serve that build at `http://localhost:4173` to check it. Ctrl+C stops it.

```bash
npm run preview
```

### Docker

From the project folder, build and start the app at `http://localhost:8080`. Run it again after code changes; Ctrl+C stops it.

```bash
docker compose up --build
```

Remove the container when you are done.

```bash
docker compose down
```

## Testing

Vitest tests sit next to the code they cover (`*.test.js`, `*.test.jsx`). Run these commands in `frontend/`.

Run all tests once. Run it before you share a change.

```bash
npm test
```

Check the code with ESLint. Run it before you share a change.

```bash
npm run lint
```

Rerun the tests on every save while you work. Ctrl+C stops it.

```bash
npm run test:watch
```

## Project structure

```text
db_project/
├── frontend/              React app
│   ├── src/
│   │   ├── auth/          Sign-in session and route guard
│   │   ├── components/    Shared UI components
│   │   ├── features/      Cart, catalog, orders, reports, shop, sellers and users
│   │   ├── hooks/         Custom React hooks
│   │   ├── layouts/       Page layouts and top bars
│   │   ├── pages/         One folder per page
│   │   ├── routes/        URL paths
│   │   ├── styles/        Global styles and design tokens
│   │   ├── utils/         Formatting and helper functions
│   │   ├── App.jsx        Route table
│   │   └── main.jsx       Entry point
│   ├── Dockerfile         Builds the app and serves it with nginx
│   ├── nginx.conf         nginx settings
│   └── package.json       Dependencies and npm scripts
├── compose.yaml           Docker Compose file
└── README.md              This file
```

## APIs

Not applicable.

## Contributing

- Follow the workspace's code-conventions skill: a short JSDoc block on every file and function, no line comments.
- Each component and page has its own folder with its `.jsx` file, CSS Module and tests.
- Import from `src/` with the `@/` alias, and take URLs from `src/routes/paths.js`.
- Modes and their sidebar options are listed in `src/layouts/PersonalAreaLayout/modes.js`.
- Sample data lives in `src/features/`, ready to be replaced by a server.

Before you share a change, run the tests and the linter, then these two checks from the project folder.

Check the code conventions.

```bash
python ../.claude/skills/code-conventions/scripts/check_conventions.py frontend/src
```

Check this README.

```bash
python ../.claude/skills/project-docs/scripts/check_docs.py .
```

## License

Not applicable.
