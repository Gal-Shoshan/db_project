# db_project

A React web application with home, sign-in and sign-up pages and a personal area, not connected to a server yet.

## Overview

The project currently consists of its web front end, in `frontend/`. It is a single-page React application written in JavaScript, built with Vite, with client-side routing by React Router. Signing in is local only: when both sign-in fields are filled in, the app starts a session and opens the personal area, without checking the credentials anywhere. The sign-in form is the only way into the personal area. The session holds only the email address, lives in memory and is never saved to browser storage, so a reload or a typed URL starts signed out, and opening any public page (for example with the browser's Back button) ends it. The personal area has its own top bar and no links to the public pages. The sign-up form sends nothing and only shows a "not connected" notice. The Shopping page of the Buy mode is an online-store catalog over 237 generated sample products, which are searched, filtered, sorted and paged in the browser. Every product has one of six made-up sellers. The Buy mode shows a cart window at the bottom right; ordering turns the cart into one pending order per seller. The Pending Orders page of the Buy mode lists 24 generated sample orders that the sellers have not accepted yet, plus the orders placed from the cart. The Purchases page lists 36 generated sample orders that the sellers accepted, and can put a purchase's products back in the cart. Every user can both buy and sell, so the Sell mode's Orders page lists 18 generated sample orders that made-up buyers placed with the user's own shop, for the user to approve or unapprove, and its Products page shows the 24 products of the user's shop in the Shopping page's layout, where the user can change each product's name, price and quantity in stock, remove a product, and add new products. All orders are kept in one shared list with their buyer and seller, the way a server will keep them, and each page shows its part of it. The cart and every change to the orders last until the user logs out; no server is told. The Reports mode shows monthly sales and purchase volumes from fixed placeholder figures, marked "Sample data" on the page. There is no backend or database yet. Running `docker compose up --build` in the project folder builds the Docker image and serves the app with nginx at `http://localhost:8080`.

## Features

- A home page with buttons that open the sign-up and sign-in pages.
- A sign-in page with email and password fields. Submitting with either field empty (or only spaces) shows an error under that field; submitting with both filled in opens the personal area.
- A personal area at `/personal-area`, reachable only by signing in. Opening it or its profile page by URL, after a reload, or after leaving to a public page leads to the sign-in page.
- A personal-area top bar with the brand (not a link), the Mode selector (Sell, Buy, Reports), a "View profile" link and a "Log out" button. It has no link to the home page or back to the personal area.
- Each mode has its own URL. The Sell and Buy modes show a left sidebar with the options they offer, and open their first option: Sell offers Orders (`/personal-area/sell/orders`) and Products (`/personal-area/sell/products`), and Buy offers Shopping (`/personal-area/buy/shopping`), Pending Orders (`/personal-area/buy/pending-orders`) and Purchases (`/personal-area/buy/purchases`). The Reports mode (`/personal-area/reports`) has no sidebar.
- A Shopping catalog laid out like a large online store:
  - A search box at the top. Every search word must appear in a product's title, brand or category.
  - Under it, a "Filters" button and a "Sort by" menu. The button opens a panel with Category, Price, Customer reviews, "In stock only" and "FREE delivery" filters, which apply at once. It shows how many filters are in use, and the panel has "Clear all filters".
  - Sort orders: Featured, Price: Low to High, Price: High to Low, Avg. Customer Review and Newest Arrivals.
  - A results line such as `1–50 of 237 results`, then a grid of product cards: a picture placeholder for the category, the title, star rating and number of ratings, the price, a struck-through list price for discounted products, "FREE delivery" or "Currently unavailable.", and an "Add to cart" button with how many units are already in the cart (for example `2 in cart`). The button is disabled for unavailable products and at 10 units of one product.
  - At most 50 products per page. The number of pages is the number of products divided by 50, plus one page for any remainder (237 sample products make 5 pages).
  - A pager at the bottom with Previous, the page numbers and Next. Changing the page scrolls back to the top, and any other change returns to page 1.
  - The search text, filters, sort order and page are kept in the URL (for example `?q=speaker&category=electronics&sort=price-asc&page=2`), so the browser's Back and Forward buttons step through them.
- A Pending Orders page of the orders that the sellers have not accepted yet:
  - At the top, the same "Filters" button and "Sort by" menu as the Shopping page. The panel has Seller, Price (Under $50 up to $500 & above) and Order date (From and To days, both included) filters, which apply at once, and "Clear all filters".
  - Sort orders: Date: Newest First, Date: Oldest First, Price: Low to High, Price: High to Low and Seller: A to Z.
  - A count line such as `24 pending orders`, or `5 of 24 pending orders` when filters are in use, then a table with Date, Price and Seller columns and a "Cancel" button in each row.
  - Clicking a row anywhere except "Cancel" opens an "Order details" window with the order number, date and time, seller, status, each product with its quantity and price, and the order total. The date in each row is a button, so the window also opens from the keyboard. The window closes with its close button, Escape or a click outside it.
  - "Cancel" opens a "Cancel this order?" window. "Keep order" closes it; "Cancel order" removes the order from the list and shows a notice that it was cancelled. Cancelled orders stay removed while the user moves between pages, and the full list returns at the next sign-in.
  - The filters and sort order are kept in the URL (for example `?seller=harborview&from=2026-11-01&sort=price-asc`).
  - Messages for when no order is pending and for when the filters match no order; the second has a "Clear all filters" button.
  - The sample orders are numbered ORD-1037 to ORD-1060, after the purchases. Orders placed from the cart get the next number after every existing order (ORD-2019 and up, after the shop's sample orders).
- A Purchases page of the orders that the sellers accepted:
  - At the top, the same "Filters" button and "Sort by" menu, with the same Seller, Price and sort choices. The date filter is "Date approved", and "Date: Newest First" and "Date: Oldest First" sort by the day the seller approved the order.
  - A count line such as `36 purchases`, then a table with Date (the day the seller approved the order), Price and Seller columns and an "Add to cart" button in each row.
  - Clicking a row anywhere except "Add to cart" opens the same "Order details" window, which here also shows the date approved and the status "Approved by the seller".
  - "Add to cart" puts the purchase's products in the cart with their quantities, at today's prices, without opening the details. A status line says how many items were added, names products that are unavailable now and so were left out, and says when a product was already at the cart's limit of 10.
  - The 36 sample purchases (ORD-1001 to ORD-1036) were placed from May to September 2026, and each was approved one hour to three days after it was placed. Some of their products are out of stock now.
- An Orders page in the Sell mode, of the orders placed with the user's shop that wait for the user's approval:
  - At the top, the same "Filters" button and "Sort by" menu. The filters are Buyer (one checkbox per buyer), Price and Order date; the sort orders are the four date and price orders and Buyer: A to Z.
  - A count line such as `18 orders waiting for approval`, then a table with Date (the day the order was placed), Price and Order by (the buyer's name) columns.
  - Clicking a row opens the "Order details" window, with the buyer under "Order by" and three buttons at the bottom: "Close" closes the window; "Approve" marks the order approved, so it leaves this list and moves to the buyer's Purchases; "Unapprove" deletes the order, so it leaves this list and the buyer's Pending Orders. A notice then says what was done.
  - The 18 sample orders (ORD-2001 to ORD-2018) come from seven made-up buyers and were placed during the 14 days up to November 10, 2026. They hold products of the user's shop (see the Products page). The user never orders from their own shop.
- A Products page in the Sell mode, of the products of the user's shop, laid out like the Shopping page:
  - The same search box, "Filters" button and "Sort by" menu, results line, product cards and pager. The filters, sort orders, search text and page are kept in the URL in the same way.
  - Each card shows the product's quantity in stock (for example `In stock: 12`) and an "Edit" button instead of "Add to cart". A product with a quantity of 0 is unavailable, and its card says "Currently unavailable."
  - "Edit" opens an "Edit product" window with the product code, category, brand, customer rating (or "No ratings yet") and status (Available or Unavailable, which follows the quantity as it is typed), and Name, Price (USD) and Quantity in stock fields. At the bottom, "Update" saves the changes, and a red trash button (named "Remove from store") removes the product. Escape and the close button close the window without saving.
  - The trash button first opens a "Remove this product?" window on top, which asks "Are you sure you want to remove …?". "Remove product" removes it from the store and closes both windows; "Keep product" (or Escape) returns to the Edit window.
  - A round "+" button stays at the bottom right of the window while the page scrolls. It opens a "New product" window in the center of the screen with Name, Brand, Category (a drop-down list), Price (USD) and Quantity in stock fields, all required, and an "Add to the store" button at the bottom. The new product gets the next product code (S0025 and up), no discount and no ratings, and appears first in the Featured order. The form starts empty each time the window opens.
  - The name must be 1 to 120 characters, the brand 1 to 60 characters, the price above $0 and up to $100,000 with at most two decimals, and the quantity a whole number from 0 to 9,999. Invalid values show an error under the field, and focus moves to the first one.
  - After an update, a removal or an addition, a status line says what was done, and adds that the product is unavailable to buyers when its quantity is 0. After a removal, keyboard focus moves to this line. A price at or above the list price removes the struck-through list price, and free delivery follows the new price.
  - The 24 sample products (S0001 to S0024) are copies of catalog products with the shop's own codes and a random quantity from 0 to 40; some start at 0. Added, edited and removed products stay that way until the user logs out.
- A cart window at the bottom right of the Buy mode's pages (Shopping, Pending Orders and Purchases), and of no other mode. The pages leave space at the bottom so their last row can scroll above it:
  - Closed, it is a small window with a cart icon, the number of units on a badge, the total price and an arrow that opens it.
  - Open, it grows into a larger window in the same corner with each product's title, unit price and seller, "−" and "+" buttons around the quantity (from 1 to 10), a "Remove" button and the line total; then the total, "Clear" and "Order".
  - "Order" places one pending order per seller, empties the cart and shows the new order numbers with a "View pending orders" link. "Clear" removes every product.
  - The arrow or Escape closes it. It is not a modal window, so products can still be added from the page while it is open.
  - The cart keeps its products while the user moves between pages and modes, and starts empty at the next sign-in.
- A Reports dashboard of monthly sales and purchases over twelve months (November 2025 to October 2026), from fixed placeholder figures marked "Sample data":
  - Key-figure tiles: total sales and total purchases, each with a trend line; net (sales minus purchases); and the latest month's sales with its change from the month before (for example `+14.2% vs September`, with an arrow and a sign as well as a color).
  - A "Monthly volume" column chart with a Sales and a Purchases column per month, a legend, round dollar ticks, and a value label on the peak month of each series. Hovering over a month, or moving between months with Tab and the arrow keys, Home and End, shows a tooltip with both figures and the net.
  - A "Monthly breakdown" table with sales, purchases and net per month and a totals row. It holds every figure the chart shows, and on narrow screens it shortens the month names.
  - Sales and Purchases keep the same colors in the chart, the legend, the tiles and the table, in light and dark mode. The colors pass the color-blindness and contrast checks of the dataviz skill's palette validator.
- A profile page at `/personal-area/profile` that shows the signed-in email address. No mode is selected there; choosing a mode in the top bar returns to it.
- Logging out ends the session and opens the sign-in page.
- A sign-up page with full name, email, password (at least 8 characters) and password confirmation; a confirmation that doesn't match is flagged on the field. Submitting a valid form only shows a "not connected to a server yet" notice.
- A top bar on the public pages with the brand, linking home, and "Sign in" and "Sign up" links that highlight the current page.
- No data is sent over the network, and nothing is saved in browser storage.
- A not-found page for any unknown URL, with a link back home.
- Light and dark color schemes that follow the operating system setting.

## Tech stack

| Component | Technology | Version |
| --- | --- | --- |
| Language | JavaScript (JSX) | ES modules |
| UI library | React and React DOM | 19.3.1 |
| Routing | React Router | 8.5.1 |
| Build tool and dev server | Vite with `@vitejs/plugin-react` | 8.3.8 (plugin 6.3.0) |
| Styling | CSS Modules and global CSS custom properties | Built into Vite |
| Tests | Vitest, React Testing Library, jsdom | 5.1.0, 16.3.3, 29.1.1 |
| Linting | ESLint with the React Hooks and React Refresh plugins | 10.14.0 |
| Container | Node.js build stage, nginx web server | `node:24-alpine`, `nginx:1.30-alpine` |

## Prerequisites

| Tool | Version | Purpose |
| --- | --- | --- |
| Node.js | 22.22 or later 22.x, 24.x, or 26 and later (tested with 24.11.1) | Runs the dev server, build, tests and linter |
| npm | Bundled with Node.js (tested with 11.6.2) | Installs dependencies and runs the scripts |
| Docker | Tested with 28.5.1 | Builds and runs the app in a container, with no local Node.js needed |

## Installation

1. Get the project files. TODO: verify (the workspace is not in a git repository yet, so there is no clone URL).

2. Move into the `frontend/` folder, where the npm commands run.

   ```bash
   cd frontend
   ```

3. Install the dependencies listed in `package.json` into `frontend/node_modules/`. Run it once after getting the project, and again whenever `package.json` changes. The Docker setup does not need it, because the image installs its own.

   ```bash
   npm install
   ```

## Configuration

The frontend reads no environment variables.

`compose.yaml` defines one `frontend` service, built from `frontend/Dockerfile` and published on host port 8080.

`frontend/vite.config.js` holds the Vite and Vitest settings, including the `@` import alias for `frontend/src/` and a 15-second time limit per test. `frontend/eslint.config.js` holds the lint rules. `frontend/nginx.conf` controls how the Docker image serves the app: unknown paths fall back to `index.html` so that client-side routes work on reload, and hashed files in `/assets/` are cached for a year.

## Running

### Development

Move into the `frontend/` folder, where the npm commands run. Skip it if your terminal is already there.

```bash
cd frontend
```

Start the Vite dev server at `http://localhost:5173`. Use it while you work on the code: it reloads the page when a file changes. Press Ctrl+C to stop it.

```bash
npm run dev
```

### Production

Move into the `frontend/` folder. Skip it if your terminal is already there.

```bash
cd frontend
```

Build the optimized static files into `frontend/dist/`. Run it before `npm run preview`, and again after every code change you want to check.

```bash
npm run build
```

Serve the build in `frontend/dist/` at `http://localhost:4173` to check it locally. Run it after `npm run build`, because it does not rebuild. Press Ctrl+C to stop it.

```bash
npm run preview
```

To run the production build as a server, use the Docker setup below.

### Docker

These commands run from the project folder and need only Docker, not Node.js or `npm install`.

Build the frontend image from `frontend/Dockerfile` and start it, as `compose.yaml` defines. Run it to start the system, and again after every code change, because a container keeps serving the build it was made from. The app opens at `http://localhost:8080`, the terminal shows the nginx log, and Ctrl+C stops it.

```bash
docker compose up --build
```

Stop and remove the container and the network that Compose created. Run it when you are done with the app.

```bash
docker compose down
```

To use Docker without Compose, build the image and name it `db_project_frontend`. Run it the first time and after every code change.

```bash
docker build -t db_project_frontend frontend
```

Start a container from that image at `http://localhost:8080`. Run it after the build. Ctrl+C stops the container, which is then removed.

```bash
docker run --rm -p 8080:80 db_project_frontend
```

## Testing

The 200 Vitest tests in 26 files sit next to the code they cover (`*.test.js` and `*.test.jsx`). Besides the cases below, they cover the Reports page (key figures, chart description and legend, table rows and totals, the hover tooltip and keyboard movement between months), the report sums, the month labels, the chart scale and the number formatters. They check routing between the public pages, the sign-in rules, the personal area (entry only through sign-in, the session ending when the browser goes back to a public page, the contents of the top bar, each mode and its sidebar, the profile and logging out), the sign-up form, and the Shopping catalog: the page-count rule, search, every filter and sort order, the URL state, the sample data, and the page layout and paging as a user sees them. For Pending Orders they check the sample orders, the URL state, every filter and sort order, the order date helpers, and the page as a user sees it: its place in the Buy sidebar, the table, the details window, cancelling with and without confirming, and a cancelled order staying gone after visiting another page. For Purchases they check the sample purchases, filtering and sorting by the approval date, and the page as a user sees it: the table, the details window with the approval date and status, and Add to cart, including products that are unavailable now. For the Sell mode's Orders they check the shop's sample orders, the shared order list (each page's part of it, approving, deleting an order for both its buyer and its seller, and numbering new orders), and the page as a user sees it: the table, sorting and filtering by buyer, and Close, Approve and Unapprove in the details window. For the Sell mode's Products they check the shop's sample products, the Edit and New product form checks, product codes, building and editing a product (availability, free delivery and list price), and the page as a user sees it: the catalog layout, search, the Edit window's details and values, Update, setting the quantity to 0, errors for invalid values, closing without saving, removing with and without confirming, adding a product from the "+" button with its errors and empty form, and an update lasting across modes. For the cart they check its rules (limits, totals, one order per seller, adding an earlier order's items) and how a user sees it: shown only in the Buy mode, Add to cart, "+", "−", Remove, Clear, Escape, Order creating pending orders, and the cart lasting across modes. They also check that no form makes a network request and that nothing is saved in browser storage. The commands below run them and the linter.

Move into the `frontend/` folder, where the npm commands run. Skip it if your terminal is already there.

```bash
cd frontend
```

Run all the tests once and report the results. Run it before you share a change.

```bash
npm test
```

Check the code with ESLint. Run it before you share a change.

```bash
npm run lint
```

Rerun the tests each time a file changes. Use it while you write code or tests, and press Ctrl+C to stop it.

```bash
npm run test:watch
```

## Project structure

```text
db_project/
├── frontend/                React web application
│   ├── public/              Files served as-is (favicon)
│   ├── src/
│   │   ├── auth/            In-memory session: AuthProvider, useAuth, RequireAuth route guard
│   │   ├── components/      Shared UI: TopBar, Brand, NavBar, SideNav, PageTitle, Button, Card, Dialog, FormField, SelectField, AuthForm, SegmentedControl, FilterSortBar, FilterPanel, Pagination, RatingStars, Price, StatTile, Sparkline, ChartLegend
│   │   ├── constants/       Application-wide constants, such as the product name
│   │   ├── features/
│   │   │   ├── cart/        Shopping cart: cart rules, the in-memory cart store, the cart window and the Add to cart button
│   │   │   ├── catalog/     Product catalog: settings, sample products, URL state, search/filter/sort/paging rules, and the catalog components that the Shopping and Products pages share
│   │   │   ├── orders/      Orders for Pending Orders, Purchases and the Sell mode's Orders: settings, the order lists' date and person, sample orders, the shared in-memory order store, URL state, filter/sort rules, and the shared order-list parts (controls, table, notice, details and cancel windows)
│   │   │   ├── reports/     Reports: placeholder monthly figures, month labels, sums, the volume chart and the breakdown table
│   │   │   ├── sellers/     The six made-up sellers of the products and orders
│   │   │   ├── shop/        The user's shop products: sample products, product codes, add and edit rules, form checks, the in-memory product store, and the Edit button, the "+" button and the Edit, Remove and New product windows
│   │   │   └── users/       The signed-in user (buyer and owner of a shop) and the made-up buyers who order from that shop
│   │   ├── hooks/           Custom hooks for form state, browser tab titles, scrolling to the top on page change, measuring an element's width and moving focus after a control disappears
│   │   ├── layouts/         PublicLayout, PersonalAreaLayout (its top bar and the list of modes), ModeLayout (a mode's sidebar) and BuyModeLayout (the Buy mode with its cart window at the bottom right)
│   │   ├── pages/           One folder per page: HomePage, SignInPage, SignUpPage, OrdersPage, ProductsPage, ShoppingPage, PendingOrdersPage, PurchasesPage, ReportsPage, ProfilePage, NotFoundPage
│   │   ├── routes/          URL paths of the pages
│   │   ├── styles/          Global styles and design tokens
│   │   ├── test/            Test setup (with stand-ins for the dialog methods jsdom lacks) and helpers
│   │   ├── utils/           Currency, percent and number formatting, rounding to cents, seeded random numbers for sample data, and round value-axis scales for charts
│   │   ├── App.jsx          Route table
│   │   └── main.jsx         Entry point that mounts the app
│   ├── Dockerfile           Builds the app and serves it with nginx
│   ├── nginx.conf           nginx settings for the single-page app
│   ├── index.html           HTML page that loads src/main.jsx
│   ├── package.json         Dependencies and npm scripts
│   ├── vite.config.js       Vite and Vitest configuration
│   └── eslint.config.js     ESLint configuration
├── compose.yaml             Docker Compose file with the frontend service
└── README.md                This file
```

## APIs

Not applicable.

## Contributing

Code follows the workspace's code-conventions skill in `../.claude/skills/code-conventions/`. Every file, component and function has a short JSDoc block, and the code has no line comments. Each component or page has its own folder holding its `.jsx` file, its CSS Module and its tests. Imports from `src/` use the `@/` alias, and links use the paths in `src/routes/paths.js`. Pages of the personal area go under the `RequireAuth` and `PersonalAreaLayout` routes in `src/App.jsx`, read the session with `useAuth`, and must not link to the public pages. The modes and their sidebar options are listed in `src/layouts/PersonalAreaLayout/modes.js`. To add an option to a mode, add its path to `src/routes/paths.js`, add it to the mode's `options` in `modes.js`, and add its route under that mode's `ModeLayout` route in `src/App.jsx`. The catalog's page size, categories, price ranges, rating choices and sort orders are set in `src/features/catalog/catalogConfig.js`. Its search, filter, sort and paging rules are pure functions in `src/features/catalog/searchCatalog.js`, so a product API can later replace the sample data in `sampleProducts.js` without changing the page. The Shopping and Products pages are both `ProductCatalog` from `src/features/catalog/components/ProductCatalog/`, which takes the products and a `renderCardAction` function for each card's button (Add to cart or Edit). The shop's products, with their quantity in stock, are held by `ShopProductsProvider` in `src/features/shop/`, which wraps the personal area in `src/App.jsx`; the limits, product codes and the fields that follow an edit or a new product are in `shopProducts.js`, and both forms' checks in `validateProductForm.js`. List pages share the "Filters" and "Sort by" bar in `src/components/FilterSortBar/` and the filter panel parts in `src/components/FilterPanel/`; pop-up windows use `src/components/Dialog/`. The order lists' price ranges, sort orders and status labels are set in `src/features/orders/ordersConfig.js`, and the sellers in `src/features/sellers/sellers.js`. Each order list's date (`placedAt` or `approvedAt`) and the person it names (the seller, or the buyer under "Order by") are set in `src/features/orders/orderLists.js`, and the filter and sort rules for any list are pure functions in `src/features/orders/searchOrders.js`. The three order pages are built from the shared order-list parts in `src/features/orders/components/` (the Filters and Sort by controls, the count line, the table with an optional action button per row, the notice, the empty-list message and the details window with optional buttons) and keep their filters in the URL with `useOrderListQuery`. Every order is stored once in `OrdersProvider`, which wraps the personal area in `src/App.jsx`, with its buyer and seller; `src/features/orders/orderSelectors.js` picks each page's part (the user's pending orders and purchases, and the orders waiting for the user's approval). An orders API can replace the sample list in `sampleOrders.js` and the local `placeOrders`, `approveOrder` and `removeOrder` there. The signed-in user's id and shop name, and the made-up buyers, are in `src/features/users/users.js` until users come from a server. The cart's rules (the 10-unit limit, totals and one order per seller) are pure functions in `src/features/cart/cartLines.js`, and `CartProvider` sits inside `OrdersProvider` so that ordering can add pending orders. Order totals and order numbers come from `src/features/orders/orderItems.js` for both the cart and the orders. The Reports figures are the `MONTHLY_VOLUMES` list in `src/features/reports/monthlyVolumes.js`; replacing it with server data updates the tiles, chart and table together. Chart colors are the `--color-series-*` and `--color-chart-*` tokens in `src/styles/global.css`, with separate light and dark values; check any new series color with the dataviz skill's palette validator before using it.

Before you finish a change, run the linter and the tests as shown under Testing, then these two checks from the project folder.

Check that the frontend code follows the code-conventions skill (a docstring on every file and function, no line comments). Run it before you share a change.

```bash
python ../.claude/skills/code-conventions/scripts/check_conventions.py frontend/src
```

Check this README against the project-docs templates. Run it after you update the README.

```bash
python ../.claude/skills/project-docs/scripts/check_docs.py .
```

At the end of every change, update this README with the project-docs skill, as the workspace's `CLAUDE.md` requires.

## License

Not applicable.
