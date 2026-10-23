/**
 * Domain types shared across the storefront.
 * Money is stored in minor units (cents) to avoid floating-point drift.
 */
export interface Money {
  /** Amount in minor units, e.g. 2499 = $24.99 */
  amount: number;
  /** ISO 4217 code, e.g. "USD" */
  currencyCode: string;
}

export interface ProductImage {
  src: string;
  /** Empty string marks the image as decorative. Omit to fall back to the product title. */
  alt?: string;
  width?: number;
  height?: number;
}

export type ProductBadge = 'new' | 'local-maker' | 'bestseller' | 'limited';

export interface ProductRating {
  /** 0–5, decimals allowed */
  value: number;
  count: number;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  /** Maker or brand, e.g. "Detroit Candle Co." */
  vendor?: string;
  price: Money;
  /** Original price; shown struck through when greater than `price`. */
  compareAtPrice?: Money | null;
  image?: ProductImage | null;
  availableForSale: boolean;
  /** Units left; drives the "Only N left" badge. Undefined means untracked. */
  inventoryQuantity?: number;
  badges?: ProductBadge[];
  rating?: ProductRating | null;
}
