// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// const useInvoiceStore = create(
//   persist(
//     (set) => ({
//       // 🧾 State values used in NewSale.jsx
//       customerDetails: {}, // object to hold customer details
//       cartedProducts: [], // array of products in the cart
//       saleDetails: {},

//       // ✅ Actions for NewSale.jsx
//       setCustomerDetails: (details) => set({ customerDetails: details }),
//       setCartedProducts: (products) => set({ cartedProducts: products }),
//       setSaleDetails: (details) => set({ saleDetails: details }),

//       // 🧾 Invoice-related setters
//       clearInvoice: () =>
//         set({
//           customerDetails: {},
//           cartedProducts: [],
//           saleDetails: {},
//         }),
//     }),
//     {
//       name: "invoice-storage",
//     }
//   )
// );

// export default useInvoiceStore;


import { create } from "zustand";
import { persist } from "zustand/middleware";

const useInvoiceStore = create(
  persist(
    (set) => ({
      // 🧾 State values used in NewSale.jsx
      customerDetails: {}, // object to hold customer details
      cartedProducts: [], // array of products in the cart
      saleDetails: {},

      // ✅ Actions for NewSale.jsx
      setCustomerDetails: (details) =>
        set((state) => ({
          customerDetails: {
            ...state.customerDetails,
            ...details,
          },
        })),

      setSaleDetails: (details) =>
        set((state) => ({
          saleDetails: {
            ...state.saleDetails,
            ...details,
          },
        })),

      setCartedProducts: (products) => set({ cartedProducts: products }),

      // 🧾 Invoice-related setters
      clearInvoice: () =>
        set({
          customerDetails: {},
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
