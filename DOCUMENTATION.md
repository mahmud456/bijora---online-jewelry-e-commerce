# Bijora - Online Jewelry E-Commerce Documentation

Welcome to the official developer and administrative documentation for **Bijora**, an elegant, highly premium e-commerce platform custom-tailored for high-end boutique jewelry. 

---

## 🎨 Visual Identity & Design Concept

Bijora is built around a **Sophisticated Regal Slate & Gold** visual concept. Every component is designed to convey high trust, timeless craft, and luxurious value.

- **Primary Canvas**: Clean, spacious layout utilizing generous negative space, soft off-whites (`#FAF9F6`), and absolute deep charcoal/stone grays (`#1A1A1A`, `#1C1917`) to highlight the vibrant details of fine precious metal jewelry.
- **Accent Elements**: Warm metallic gold highlights (`#C5A059`, `#D4AF37`) to frame titles, ratings, primary action states, and branding borders.
- **Typography Pairings**:
  - **Display / Headings**: *Cinzel* & *Playfair Display* styled with generous letter-spacing, tracking, and semi-bold weights.
  - **Status & Indicators**: High-readability sans-serif text (*Inter*) paired with clear data rows styled in *JetBrains Mono* (e.g. SKUs, Order IDs, and price fields).
- **Interactive Micro-Animations**: Smooth scale transitions on product hover, sliding side-drawers for the shopping cart, and sleek fade-in overlays using `motion/react`.

---

## 💎 Core User-Facing Features

### 1. Multi-Lingual Translation Engine (EN / BN)
Bijora natively supports full bilingual toggling between **English** and **Bangla (বাংলা)**.
- Single-tap translation toggle located in the main header utility bar.
- Fully translated product catalogs, category names, sliders, filters, checkout fields, and confirmation modals.
- Clean language dictionary built directly into the core state context with simple `t('key')` selector queries.

### 2. High-Performance Jewelry Showroom
- **Dynamic Filtering**: Users can filter jewelry instantly by category, search text queries (matching Title, SKU, or Description), and real-time sliding price limits.
- **Advanced Sorting**: Support for default ranking, price-ascending, price-descending, and "New Arrival" priority flags.
- **Dynamic Detail Views**: Implements interactive multi-angle image carousels, expandable descriptions, active rating stars, and live review sections.

### 3. Smart Shopping Cart & Coupon System
- **Real-Time Calculation**: Automatic tracking of subtotal, district-based shipping rates, coupon discounts, and grand totals.
- **Intelligent Coupon Engine**: Dynamic validation of percent-based or flat-rate codes with required minimum purchase limits (e.g. `GOLDEN10` for 10% off).

### 4. Triple-Channel Flexible Checkout
To match the purchasing habits of high-end boutique buyers, Bijora provides **three independent checkout gateways**:
1. **WhatsApp Deep-Link Checkout**: Auto-compiles user details and cart items into a formatted Bangla/English message, opening a pre-populated chat directly with Bijora's sales representatives.
2. **Messenger Deep-Link Checkout**: Initiates direct order details submission redirecting users with structured text templates to Facebook Messenger.
3. **Standard Database Checkout**: Places a secure, fully tracked order directly in the Firebase Firestore database, notifying the administrator in real-time.

### 5. AI Jewelry Stylist (Powered by Gemini)
- **Interactive Conversational Assistant**: Natively integrated with Gemini using the modern `@google/genai` TypeScript SDK.
- **Smart Recommendations**: Evaluates user skin tone, event vibe (casual, bridal, festive), preferred metal finishes, and budget boundaries.
- **Dynamic Matching**: Recommends actual items from the local store catalog matching the Gemini AI logic output.

### 6. User Profiles & Persistence
- Secure User Accounts powered by Firebase Authentication.
- Dynamic delivery profile synchronization (Full Name, Phone Number, District, Area, and Delivery Address) auto-populating checkout fields on all future sessions.

---

## 🛡️ Administrative Workspace (Admin Panel)

Authorized administrators with the `'admin'` role can access a private workspace containing six powerful subsystems:

1. **Revenue & Earnings Analytics**: Real-time widgets tracking Total Sales in Bangladeshi Taka (৳), total completed orders, pending orders, and average order value.
2. **Real-Time Catalog Manager**: Add, edit, or delete items. Upload multi-image links, configure SKUs, set regular/discount prices in ৳ (Taka), categorize products, and manage stock quantities.
3. **Order Lifecycle Tracker**: Monitor incoming customer transactions. Instantly view delivery addresses, contact numbers, order notes, and update statuses (`Pending` ➔ `Processing` ➔ `Completed` ➔ `Cancelled`).
4. **Promotion & Coupon Editor**: Instantly declare new coupon rules, set validity thresholds, configure percentage/fixed discounts, and activate banner alerts.
5. **Customer Reviews Moderation**: Audit and manage product ratings, comments, and review timelines.
6. **Live Web Settings & Dynamic Layout**: Re-order sections (Intro banner, categories list, featured products grid, arrivals, promotional coupons) and update store logos or background branding in real-time.

---

## 🗄️ Firestore Database Layout Reference Sheet

For production setup, manually instantiate the following **6 collections** in the Firebase Console:

### Collection List Summary:
1. `users` (User Profiles & Roles)
2. `products` (Jewelry Catalog Inventory)
3. `orders` (Purchase Transactions)
4. `reviews` (Product Ratings & Testimonials)
5. `coupons` (Active Discounts & Promo Codes)
6. `settings` (Dynamic Website Branding & Configurations)

---

### 1. `users` Collection
- **Path**: `users/{uid}`
- **Description**: Stores user profile details and access privileges.

| Field Name | Firestore Data Type | Example Value / Description |
| :--- | :--- | :--- |
| `uid` | `string` | `"uX8h38NkaP92MnsL"` (Matches Auth UID) |
| `fullName` | `string` | `"Al-Amin Rahman"` |
| `email` | `string` | `"alamin@example.com"` |
| `phoneNumber` | `string` (Optional) | `"+8801712345678"` |
| `deliveryAddress`| `string` (Optional) | `"House 12, Road 4, Sector 3"` |
| `district` | `string` (Optional) | `"Dhaka"` |
| `area` | `string` (Optional) | `"Uttara"` |
| `role` | `string` | `"customer"` or `"admin"` |
| `createdAt` | `timestamp` | `June 30, 2026 at 10:00:00 AM UTC` |

#### JSON Representation:
```json
{
  "uid": "uX8h38NkaP92MnsL",
  "fullName": "Al-Amin Rahman",
  "email": "alamin@example.com",
  "phoneNumber": "+8801712345678",
  "deliveryAddress": "House 12, Road 4, Sector 3",
  "district": "Dhaka",
  "area": "Uttara",
  "role": "customer",
  "createdAt": "2026-06-30T10:00:00.000Z"
}
```

---

### 2. `products` Collection
- **Path**: `products/{productId}`
- **Description**: Holds the jewelry inventory data.

| Field Name | Firestore Data Type | Example Value / Description |
| :--- | :--- | :--- |
| `id` | `string` | `"prod_01j1a"` |
| `name` | `string` | `"Royal Gold Pearl Choker"` |
| `sku` | `string` | `"BJ-CH-GP01"` |
| `category` | `string` | `"Necklaces"` |
| `description` | `string` | `"A luxurious hand-crafted piece accented with fresh water pearls..."` |
| `originalPrice` | `number` | `24500` (Represented in ৳ Taka) |
| `discountPrice` | `number` (Optional) | `22000` |
| `stock` | `number` | `15` |
| `images` | `array` (of strings) | `["https://example.com/img1.jpg", "https://example.com/img2.jpg"]` |
| `featured` | `boolean` | `true` |
| `newArrival` | `boolean` | `false` |
| `averageRating` | `number` (Optional) | `4.8` |
| `totalReviews` | `number` (Optional) | `5` |
| `createdAt` | `timestamp` | `June 30, 2026 at 10:00:00 AM UTC` |

#### JSON Representation:
```json
{
  "id": "prod_01j1a",
  "name": "Royal Gold Pearl Choker",
  "sku": "BJ-CH-GP01",
  "category": "Necklaces",
  "description": "A luxurious hand-crafted piece accented with fresh water pearls.",
  "originalPrice": 24500,
  "discountPrice": 22000,
  "stock": 15,
  "images": [
    "https://example.com/img1.jpg",
    "https://example.com/img2.jpg"
  ],
  "featured": true,
  "newArrival": false,
  "averageRating": 4.8,
  "totalReviews": 5,
  "createdAt": "2026-06-30T10:00:00.000Z"
}
```

---

### 3. `orders` Collection
- **Path**: `orders/{orderId}`
- **Description**: Contains finalized standard purchases.

| Field Name | Firestore Data Type | Example Value / Description |
| :--- | :--- | :--- |
| `id` | `string` | `"ORD_20260630_A9B8"` |
| `customerName` | `string` | `"Sabrina Akhter"` |
| `customerPhone` | `string` | `"01811112222"` |
| `district` | `string` | `"Chittagong"` |
| `area` | `string` | `"Halishahar"` |
| `address` | `string` | `"Block-B, Lane 5, House 4"` |
| `orderNote` | `string` (Optional) | `"Deliver after 4:00 PM."` |
| `products` | `array` (of maps) | Array of `OrderItem` map objects (see schema below) |
| `subtotal` | `number` | `44000` |
| `shippingCharge` | `number` | `120` |
| `discount` | `number` | `2000` |
| `total` | `number` | `42120` |
| `status` | `string` | `"Pending" \| "Processing" \| "Completed" \| "Cancelled"` |
| `timestamp` | `timestamp` | `June 30, 2026 at 10:00:00 AM UTC` |
| `userId` | `string` (Optional) | `"uX8h38NkaP92MnsL"` |

#### Nested Map Schema - `OrderItem`:
- `productId`: `string` (e.g. `"prod_01j1a"`)
- `name`: `string` (e.g. `"Royal Gold Pearl Choker"`)
- `price`: `number` (e.g. `22000`)
- `quantity`: `number` (e.g. `2`)
- `image`: `string` (e.g. `"https://example.com/img1.jpg"`)

#### JSON Representation:
```json
{
  "id": "ORD_20260630_A9B8",
  "customerName": "Sabrina Akhter",
  "customerPhone": "01811112222",
  "district": "Chittagong",
  "area": "Halishahar",
  "address": "Block-B, Lane 5, House 4",
  "orderNote": "Deliver after 4:00 PM.",
  "products": [
    {
      "productId": "prod_01j1a",
      "name": "Royal Gold Pearl Choker",
      "price": 22000,
      "quantity": 2,
      "image": "https://example.com/img1.jpg"
    }
  ],
  "subtotal": 44000,
  "shippingCharge": 120,
  "discount": 2000,
  "total": 42120,
  "status": "Pending",
  "timestamp": "2026-06-30T10:00:00.000Z",
  "userId": "uX8h38NkaP92MnsL"
}
```

---

### 4. `reviews` Collection
- **Path**: `reviews/{reviewId}`
- **Description**: Ratings submitted by authenticated buyers.

| Field Name | Firestore Data Type | Example Value / Description |
| :--- | :--- | :--- |
| `id` | `string` | `"rev_9A12B"` |
| `productId` | `string` | `"prod_01j1a"` |
| `userId` | `string` | `"uX8h38NkaP92MnsL"` |
| `userName` | `string` | `"Al-Amin Rahman"` |
| `rating` | `number` | `5` (Value from 1 to 5) |
| `comment` | `string` | `"Exquisite detailing, highly recommend!"` |
| `timestamp` | `timestamp` | `June 30, 2026 at 10:00:00 AM UTC` |

#### JSON Representation:
```json
{
  "id": "rev_9A12B",
  "productId": "prod_01j1a",
  "userId": "uX8h38NkaP92MnsL",
  "userName": "Al-Amin Rahman",
  "rating": 5,
  "comment": "Exquisite detailing, highly recommend!",
  "timestamp": "2026-06-30T10:00:00.000Z"
}
```

---

### 5. `coupons` Collection
- **Path**: `coupons/{couponCode}`
- **Description**: Stores discount parameters with codes as collection IDs.

| Field Name | Firestore Data Type | Example Value / Description |
| :--- | :--- | :--- |
| `code` | `string` | `"GOLDEN10"` (Matching document ID key) |
| `discountType` | `string` | `"percent"` or `"fixed"` |
| `value` | `number` | `10` (representing 10% or ৳10 flat) |
| `minPurchase` | `number` (Optional) | `5000` (Minimum cart total in ৳) |

#### JSON Representation:
```json
{
  "code": "GOLDEN10",
  "discountType": "percent",
  "value": 10,
  "minPurchase": 5000
}
```

---

### 6. `settings` Collection
- **Path**: `settings/{settingId}`
- **Description**: Global storefront content setup and structure. Recommended settingId is `"web"`.

| Field Name | Firestore Data Type | Example Value / Description |
| :--- | :--- | :--- |
| `logoUrl` | `string` | `"https://example.com/bijora-logo.png"` |
| `theme` | `string` | `"dark-gold"` (Defines stylesheet config) |
| `sectionsOrder` | `array` (of strings) | `["intro", "categories", "featured", "coupon", "arrivals"]` |
| `sections` | `map` | Configuration map for customizable web sections (see below) |

#### Nested Section Layout - `WebSectionConfig`:
- `visible`: `boolean` (Determines if section renders on front-end)
- `backgroundImage`: `string` (Optional)
- `title`: `string` (Optional)
- `subtitle`: `string` (Optional)
- `description`: `string` (Optional)
- `couponCode`: `string` (Optional)
- `buttonText`: `string` (Optional)

#### JSON Representation:
```json
{
  "logoUrl": "https://example.com/bijora-logo.png",
  "theme": "dark-gold",
  "sectionsOrder": ["intro", "categories", "featured", "coupon", "arrivals"],
  "sections": {
    "intro": {
      "visible": true,
      "title": "Timeless Elegance & Royal Heritage",
      "subtitle": "Discover Hand-Crafted Masterpieces",
      "backgroundImage": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1920",
      "buttonText": "Explore Collection"
    },
    "categories": {
      "visible": true,
      "title": "Curated Collections",
      "subtitle": "Shop Jewelry by Categories"
    },
    "featured": {
      "visible": true,
      "title": "Signature Masterpieces",
      "subtitle": "Most loved by our royal patrons"
    },
    "coupon": {
      "visible": true,
      "title": "Inaugural Royal Invitation",
      "description": "Unlock ৳2,000 off on your first gold purchase above ৳20,000.",
      "couponCode": "ROYAL2000",
      "buttonText": "Claim Invite"
    },
    "arrivals": {
      "visible": true,
      "title": "Fresh Off the Craft Bench",
      "subtitle": "Explore our newly released designer products"
    }
  }
}
```

---

## 🏗️ Folder Structure

For developer reference, the modular source tree of Bijora is laid out as follows:

```bash
├── package.json                   # Dependency manager (React 19, Vite, Express, esbuild, Tailwind)
├── server.ts                      # Express API proxy (Vite dev server & Gemini API bridge)
├── metadata.json                  # Application permissions, name, and capabilities
├── firestore.rules                # Role-based secure database access rules
├── firebase-blueprint.json        # Blueprints of expected data fields & validations
├── src/
│   ├── main.tsx                   # Main React DOM entry point
│   ├── App.tsx                    # Top-level Page Router, Filters, and Dialog overlays
│   ├── types.ts                   # Strongly-typed TypeScript interfaces
│   ├── index.css                  # Tailwinds directives and luxury theme setups
│   ├── components/
│   │   ├── Header.tsx             # Interactive header, bilingual utility bar, cart toggle
│   │   ├── Footer.tsx             # Curated site links, physical showrooms list, newsletters
│   │   ├── ProductCard.tsx        # Card designs with overlay animations & quick view actions
│   │   ├── AiStylist.tsx          # Conversational side panel with Gemini integration
│   │   └── AdminPanel.tsx         # Dashboard, dynamic inventory editor, orders, and custom settings
│   ├── context/
│   │   └── StoreContext.tsx       # Core state engine (auth hooks, cart controllers, coupon triggers)
│   ├── lib/
│   └── utils/
```

---

## 🛠️ Execution & Deployment Workflows

- **Local Development**: Launches the Node server using dynamic TypeScript runtime (`tsx`):
  ```bash
  npm run dev
  ```
- **Production Build**: Compiles client-side static assets to `/dist` and bundles `server.ts` to `/dist/server.cjs` using high-speed bundling (`esbuild`):
  ```bash
  npm run build
  ```
- **Launch Production Server**: Boots up the compiled full-stack environment binding to port `3000`:
  ```bash
  npm run start
  ```
