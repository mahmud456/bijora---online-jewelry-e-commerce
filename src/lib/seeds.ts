import { Product, Category, Coupon } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'rings', name: 'Rings', slug: 'rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80' },
  { id: 'necklaces', name: 'Necklaces', slug: 'necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80' },
  { id: 'earrings', name: 'Earrings', slug: 'earrings', image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500&q=80' },
  { id: 'bracelets', name: 'Bracelets & Bangles', slug: 'bracelets', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80' },
  { id: 'sets', name: 'Jewellery Sets', slug: 'sets', image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=500&q=80' },
  { id: 'anklets', name: 'Anklets', slug: 'anklets', image: 'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=500&q=80' }
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Aurum Classic Gold Band',
    sku: 'BJ-RG-001',
    category: 'rings',
    description: 'A timeless 18k solid gold band featuring a polished dome silhouette. Minimalist luxury crafted to last a lifetime, symbolizing eternal commitment or pure geometric expression. Ideal for stacking or solo wear.',
    originalPrice: 240,
    discountPrice: 180,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80'
    ],
    featured: true,
    newArrival: false,
    averageRating: 4.8,
    totalReviews: 12,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_2',
    name: 'Empress Emerald Solitaire Ring',
    sku: 'BJ-RG-002',
    category: 'rings',
    description: 'An exquisite hand-cut Colombian emerald of deep green hue, nested in a warm 18k rose gold prong setting with delicate side diamond clusters. Represents royalty and renewal.',
    originalPrice: 650,
    discountPrice: 590,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'
    ],
    featured: true,
    newArrival: true,
    averageRating: 5.0,
    totalReviews: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_3',
    name: 'Luna Baroque Pearl Pendant',
    sku: 'BJ-NL-001',
    category: 'necklaces',
    description: 'An elegant natural freshwater baroque pearl suspended on an adjustable gold vermeil chain. Every single piece features a uniquely organic pearl shape, celebrating individuality and natural charm.',
    originalPrice: 320,
    discountPrice: 280,
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80'
    ],
    featured: true,
    newArrival: false,
    averageRating: 4.5,
    totalReviews: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_4',
    name: 'Aethelgard Diamond Choker',
    sku: 'BJ-NL-002',
    category: 'necklaces',
    description: 'A luxurious choker necklace with precision-set round brilliant cut diamonds on a flexible 18k white gold collar. A spectacular display of light and sparkle, destined for the finest occasions.',
    originalPrice: 1200,
    discountPrice: 950,
    stock: 3,
    images: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
    ],
    featured: false,
    newArrival: true,
    averageRating: 4.9,
    totalReviews: 8,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_5',
    name: 'Celestial Textured Hoop Earrings',
    sku: 'BJ-ER-001',
    category: 'earrings',
    description: 'Add real stellar beauty to your attire with these celestial hoops, hammered by hand to create a shimmering crater effect that catches light from all angles. Solid sterling silver plated in 24k gold.',
    originalPrice: 180,
    discountPrice: 140,
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
    ],
    featured: false,
    newArrival: true,
    averageRating: 4.7,
    totalReviews: 10,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_6',
    name: 'Imperial Jade Drop Earrings',
    sku: 'BJ-ER-002',
    category: 'earrings',
    description: 'Deep green natural jade stones suspended from delicate gold chains. Symbolizing wisdom, balance, and luxury, these gorgeous earrings are comfortable for daily wear yet command unmatched attention.',
    originalPrice: 290,
    discountPrice: 240,
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&q=80'
    ],
    featured: true,
    newArrival: false,
    averageRating: 4.6,
    totalReviews: 14,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_7',
    name: 'Elixir Gold Chain Link Bracelet',
    sku: 'BJ-BR-001',
    category: 'bracelets',
    description: 'A bold, hand-assembled chain link bracelet made of chunky 18k yellow gold-plated brass. Features a custom architectural toggle clasp closure. Ideal for standard modern layering.',
    originalPrice: 220,
    discountPrice: 190,
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80'
    ],
    featured: false,
    newArrival: false,
    averageRating: 4.4,
    totalReviews: 9,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_8',
    name: 'Majestic Mandala Bangle',
    sku: 'BJ-BR-002',
    category: 'bracelets',
    description: 'An intricate, heavy bangle bracelet engraved with sacred geometric mandala motifs. Designed in the traditional artistry with modern flair. Features high-quality burgundy and gold enamel detailing.',
    originalPrice: 480,
    discountPrice: 420,
    stock: 7,
    images: [
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
    ],
    featured: true,
    newArrival: true,
    averageRating: 5.0,
    totalReviews: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_9',
    name: 'Grand Bridal Mandala Set',
    sku: 'BJ-ST-001',
    category: 'sets',
    description: 'A heavy, royal heirloom bridal set including an intricately detailed choker necklace and matching drop earrings. Richly decorated with floral mandala carving and fine crimson-red rubies.',
    originalPrice: 2500,
    discountPrice: 2200,
    stock: 2,
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
    ],
    featured: true,
    newArrival: true,
    averageRating: 5.0,
    totalReviews: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_10',
    name: 'Lily Silver Anklet Chain',
    sku: 'BJ-AK-001',
    category: 'anklets',
    description: 'A beautiful and minimalist 925 sterling silver anklet decorated with tiny silver beads and a dainty lily blossom charm. Adds a subtle jingle and graceful style to your steps.',
    originalPrice: 110,
    discountPrice: 90,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=800&q=80',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
    ],
    featured: false,
    newArrival: false,
    averageRating: 4.6,
    totalReviews: 11,
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_COUPONS: Coupon[] = [
  { code: 'BIJORA10', discountType: 'percent', value: 10 },
  { code: 'WELCOME5', discountType: 'percent', value: 5 },
  { code: 'GOLDEN50', discountType: 'fixed', value: 50, minPurchase: 300 }
];
