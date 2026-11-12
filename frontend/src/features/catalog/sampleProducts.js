/**
 * @file Sample product catalog, used until products come from an API.
 *
 * Products are built from fixed word lists with a seeded pseudo-random
 * generator, so the catalog is the same on every load and in every test.
 * The brand names are made up. The sellers take turns, so each sells about
 * the same number of products.
 */

import { SELLERS } from "@/features/sellers/sellers.js";
import { roundToCents } from "@/utils/money.js";
import { createSeededRandom, pickFrom } from "@/utils/seededRandom.js";
import { CATEGORIES, FREE_DELIVERY_MIN_PRICE } from "./catalogConfig.js";

/**
 * A product in the catalog.
 *
 * @typedef {object} Product
 * @property {string} id - Unique product code, for example "P0001".
 * @property {string} title - Product name as shown in the catalog.
 * @property {string} brand - Brand or publisher.
 * @property {string} sellerId - Id of the seller from SELLERS that sells the product.
 * @property {string} category - Category id from CATEGORIES.
 * @property {number} price - Current price in dollars.
 * @property {number | null} listPrice - Price before a discount, or null when not discounted.
 * @property {number} rating - Average customer rating from 1 to 5, with one decimal.
 * @property {number} reviewCount - Number of customer ratings.
 * @property {boolean} inStock - Whether the product can be ordered now.
 * @property {boolean} freeDelivery - Whether the product ships for free.
 * @property {number} daysSinceAdded - Days since the product was added; lower is newer.
 * @property {number} featuredRank - Position in the default "Featured" order.
 */

/** Number of products in the sample catalog. */
export const SAMPLE_PRODUCT_COUNT = 237;

const RANDOM_SEED = 20261111;
const PRICE_ENDING = 0.99;
const PRICE_SKEW = 2;
const MIN_RATING = 1;
const RATING_SPREAD = 4;
const RATING_SKEW = 0.35;
const MIN_REVIEW_COUNT = 1;
const MAX_REVIEW_COUNT = 25000;
const REVIEW_COUNT_SKEW = 3;
const IN_STOCK_SHARE = 0.88;
const DISCOUNTED_SHARE = 0.3;
const MIN_DISCOUNT = 0.1;
const MAX_DISCOUNT = 0.4;
const MAX_DAYS_SINCE_ADDED = 365;
const PRODUCT_CODE_DIGITS = 4;

/**
 * Formats a title as brand, item and variant, for example "Lumen Smart Watch, Black".
 *
 * @param {string} brand - Brand name.
 * @param {string} item - Item name.
 * @param {string} variant - Color, size or edition.
 * @returns {string} The product title.
 */
const brandFirstTitle = (brand, item, variant) => `${brand} ${item}, ${variant}`;

/**
 * Formats a book title with its edition, for example "Field Guide to Birds (Paperback)".
 *
 * @param {string} _publisher - Publisher name, not part of a book title.
 * @param {string} item - Book title.
 * @param {string} variant - Edition.
 * @returns {string} The product title.
 */
const bookTitle = (_publisher, item, variant) => `${item} (${variant})`;

const CATALOG_WORDS = Object.freeze({
  electronics: {
    brands: ["Pixelworks", "Lumen", "Northwind", "Kestrel"],
    items: [
      "Wireless Earbuds",
      "Bluetooth Speaker",
      "USB-C Fast Charger",
      "27-inch 4K Monitor",
      "Mechanical Keyboard",
      "Wireless Mouse",
      "Smart Watch",
      "1TB Portable SSD",
      "Noise Cancelling Headphones",
      "HD Webcam",
    ],
    variants: ["Black", "White", "Graphite", "Silver"],
    priceRange: [12, 420],
    formatTitle: brandFirstTitle,
  },
  "home-kitchen": {
    brands: ["Oakhaven", "Hearth & Co.", "Tidewater", "Fernway"],
    items: [
      "Drip Coffee Maker",
      "Air Fryer, 5 qt",
      "8-inch Chef's Knife",
      "Nonstick Frying Pan",
      "Electric Kettle",
      "Countertop Blender",
      "LED Table Lamp",
      "Knit Throw Blanket",
      "Fabric Storage Bins, 3-Pack",
      "Bamboo Cutting Board",
    ],
    variants: ["Stainless Steel", "Matte Black", "Cream", "Sage"],
    priceRange: [9, 260],
    formatTitle: brandFirstTitle,
  },
  books: {
    brands: ["Harbor House", "Oakhaven Press", "Bluebird Books"],
    items: [
      "The Quiet Harbor: A Novel",
      "Weeknight Dinners: 100 Easy Recipes",
      "A Short History of Rome",
      "Learning JavaScript, 3rd Edition",
      "The Night Garden",
      "Walking the Alps: A Travel Guide",
      "Stars and Stones: Poems",
      "Small Habits, Big Changes",
      "The Last Lighthouse Keeper",
      "Field Guide to Birds",
    ],
    variants: ["Paperback", "Hardcover"],
    priceRange: [7, 45],
    formatTitle: bookTitle,
  },
  "sports-outdoors": {
    brands: ["Summit", "Trailhead", "Kestrel", "Northwind"],
    items: [
      "Non-Slip Yoga Mat",
      "Insulated Water Bottle, 32 oz",
      "2-Person Camping Tent",
      "40L Hiking Backpack",
      "Resistance Bands Set",
      "Adjustable Dumbbell",
      "Cycling Helmet",
      "Down Sleeping Bag",
      "Speed Jump Rope",
      "Trekking Poles",
    ],
    variants: ["Blue", "Charcoal", "Forest Green", "Orange"],
    priceRange: [8, 320],
    formatTitle: brandFirstTitle,
  },
  "toys-games": {
    brands: ["Bluebird", "Playwell", "Brightline"],
    items: [
      "Building Blocks Set, 500 Pieces",
      "1000-Piece Jigsaw Puzzle",
      "Family Strategy Board Game",
      "Remote Control Car",
      "Plush Teddy Bear",
      "Kids Art Kit",
      "Party Card Game",
      "Wooden Train Set",
      "Stunt Kite",
      "Science Experiment Kit",
    ],
    variants: ["Ages 3+", "Ages 6+", "Ages 8+", "Ages 12+"],
    priceRange: [6, 140],
    formatTitle: brandFirstTitle,
  },
  beauty: {
    brands: ["Lumen", "Fernway", "Clearwater"],
    items: [
      "Hydrating Face Moisturizer",
      "Vitamin C Serum",
      "Daily Sunscreen SPF 50",
      "Gentle Foaming Cleanser",
      "Argan Oil Shampoo",
      "Electric Toothbrush",
      "Ionic Hair Dryer",
      "Lip Balm, 4-Pack",
      "Body Lotion",
      "Makeup Brush Set",
    ],
    variants: ["Fragrance-Free", "Travel Size", "Original", "Unscented"],
    priceRange: [5, 120],
    formatTitle: brandFirstTitle,
  },
});

/**
 * Returns a price in the category's range, skewed toward cheaper items and ending in .99.
 *
 * @param {function(): number} random - Random number generator.
 * @param {[number, number]} priceRange - Lowest and highest whole-dollar price.
 * @returns {number} The price in dollars.
 */
function randomPrice(random, [minPrice, maxPrice]) {
  return roundToCents(Math.floor(minPrice + (maxPrice - minPrice) * random() ** PRICE_SKEW) + PRICE_ENDING);
}

/**
 * Builds one sample product.
 *
 * @param {function(): number} random - Random number generator.
 * @param {number} index - Position of the product in the catalog.
 * @returns {Product} The product.
 */
function createProduct(random, index) {
  const category = pickFrom(random, CATEGORIES).id;
  const words = CATALOG_WORDS[category];
  const brand = pickFrom(random, words.brands);
  const title = words.formatTitle(brand, pickFrom(random, words.items), pickFrom(random, words.variants));
  const price = randomPrice(random, words.priceRange);
  const isDiscounted = random() < DISCOUNTED_SHARE;
  const discount = MIN_DISCOUNT + (MAX_DISCOUNT - MIN_DISCOUNT) * random();

  return {
    id: `P${String(index + 1).padStart(PRODUCT_CODE_DIGITS, "0")}`,
    title,
    brand,
    sellerId: SELLERS[index % SELLERS.length].id,
    category,
    price,
    listPrice: isDiscounted ? roundToCents(price / (1 - discount)) : null,
    rating: Math.round((MIN_RATING + RATING_SPREAD * random() ** RATING_SKEW) * 10) / 10,
    reviewCount: MIN_REVIEW_COUNT + Math.floor((MAX_REVIEW_COUNT - MIN_REVIEW_COUNT) * random() ** REVIEW_COUNT_SKEW),
    inStock: random() < IN_STOCK_SHARE,
    freeDelivery: price >= FREE_DELIVERY_MIN_PRICE,
    daysSinceAdded: Math.floor(MAX_DAYS_SINCE_ADDED * random()),
    featuredRank: index,
  };
}

/**
 * Builds the whole sample catalog from the fixed seed.
 *
 * @returns {ReadonlyArray<Product>} The products, in featured order.
 */
function buildSampleProducts() {
  const random = createSeededRandom(RANDOM_SEED);
  return Object.freeze(Array.from({ length: SAMPLE_PRODUCT_COUNT }, (_, index) => createProduct(random, index)));
}

/**
 * The sample products, in featured order.
 *
 * @type {ReadonlyArray<Product>}
 */
export const SAMPLE_PRODUCTS = buildSampleProducts();
