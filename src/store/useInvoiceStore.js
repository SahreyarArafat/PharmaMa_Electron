import { create } from "zustand";
import { persist } from "zustand/middleware";

const useInvoiceStore = create(
  persist(
    (set) => ({
      // 🧾 State values used in NewSale.jsx
      cartedProducts: [], // array of products in the cart
      saleDetails: {},

      // ✅ Actions for NewSale.jsx
      setCartedProducts: (products) => set({ cartedProducts: products }),
      setSaleDetails: (details) => set({ saleDetails: details }),

      // 🧾 Invoice-related setters
      clearInvoice: () =>
        set({
          cartedProducts: [],
          saleDetails: {},
        }),
    }),
    {
      name: "invoice-storage",
    }
  )
);

export default useInvoiceStore;
