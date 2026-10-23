import type { Product } from '../src';

export const mug: Product = {
  id: 'p1',
  handle: 'mitten-mug',
  title: 'Mitten State Mug',
  vendor: 'Rust Belt Pottery',
  price: { amount: 1800, currencyCode: 'USD' },
  compareAtPrice: { amount: 2400, currencyCode: 'USD' },
  image: { src: '/mug.jpg', alt: '', width: 800, height: 800 },
  availableForSale: true,
  inventoryQuantity: 3,
  badges: ['local-maker'],
  rating: { value: 4.6, count: 38 },
};

export const tee: Product = {
  id: 'p2',
  handle: 'detroit-tee',
  title: 'Detroit Hustles Harder Tee',
  price: { amount: 3200, currencyCode: 'USD' },
  availableForSale: false,
};
