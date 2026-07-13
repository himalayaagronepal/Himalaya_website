"use client";

import { create } from "zustand";

type CartItem = { productId: string; quantity: number };

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  add: (productId: string, quantity?: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  add: (productId, quantity = 1) => {
    const items = get().items.slice();
    const idx = items.findIndex((i) => i.productId === productId); 
    if (idx > -1) items[idx].quantity = quantity;
    else items.push({ productId, quantity });
    set({ items });
  },
  remove: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
  clear: () => set({ items: [] }),
}));