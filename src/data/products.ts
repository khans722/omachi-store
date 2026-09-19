import { Product } from '@/types';

export let productsStore: Product[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export function getProducts(): Product[] {
  return productsStore;
}

export function getProductById(id: string): Product | undefined {
  return productsStore.find((p) => p.id === id || p.slug === id);
}
