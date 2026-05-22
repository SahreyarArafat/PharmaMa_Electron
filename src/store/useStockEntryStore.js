// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// const useProductStore = create(
//   persist(
//     (set) => ({
//       productList: [], // ✅ stores all product entries
//       activeProductId: null, // ✅ currently selected product

//       // Actions
//       addProduct: (product) =>
//         set((state) => ({
//           productList: [...state.productList, product],
//           activeProductId: product.id,
//         })),

//       updateProduct: (id, updatedFields) =>
//         set((state) => ({
//           productList: state.productList.map((product) =>
//             product.id === id ? { ...product, ...updatedFields } : product
//           ),
//         })),

//       deleteProduct: (id) =>
//         set((state) => {
//           const updatedList = state.productList.filter((p) => p.id !== id);
//           const newActive =
//             state.activeProductId === id && updatedList.length
//               ? updatedList[0].id
//               : updatedList.length
//               ? updatedList[0].id
//               : null;

//           return {
//             productList: updatedList,
//             activeProductId: newActive,
//           };
//         }),

//       setActiveProduct: (id) => set({ activeProductId: id }),

//       clearProducts: () => set({ productList: [], activeProductId: null }),
//     }),
//     {
//       name: "product-storage",
//     }
//   )
// );

// export default useProductStore;

//////////////////////////////////////////////////////////////////

// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// const useStockEntryStore = create(
//   persist(
//     (set, get) => ({
//       // ---------------- STATE ----------------
//       purchaseItems: [], // Products to be added to inventory
//       activeVariantId: null, // Focused product row

//       // ---------------- ADD PRODUCT ----------------
//       addPurchaseItem: (product) =>
//         set((state) => {
//           const existing = state.purchaseItems.find(
//             (p) => p.variantId === product.variantId
//           );

//           // If already added → update quantity
//           if (existing) {
//             return {
//               purchaseItems: state.purchaseItems.map((p) =>
//                 p.variantId === product.variantId
//                   ? { ...p, quantity: p.quantity + 1 }
//                   : p
//               ),
//               activeVariantId: product.variantId,
//             };
//           }

//           return {
//             purchaseItems: [
//               ...state.purchaseItems,
//               {
//                 ...product,
//                 quantity: product.quantity ?? 1,
//               },
//             ],
//             activeVariantId: product.variantId,
//           };
//         }),

//       // ---------------- UPDATE PURCHASE ITEM ----------------
//       updatePurchaseItem: (variantId, updatedFields) =>
//         set((state) => ({
//           purchaseItems: state.purchaseItems.map((item) =>
//             item.variantId === variantId ? { ...item, ...updatedFields } : item
//           ),
//         })),

//       // ---------------- REMOVE ITEM ----------------
//       removePurchaseItem: (variantId) =>
//         set((state) => {
//           const updated = state.purchaseItems.filter(
//             (p) => p.variantId !== variantId
//           );

//           return {
//             purchaseItems: updated,
//             activeVariantId: updated.length ? updated[0].variantId : null,
//           };
//         }),

//       // ---------------- ACTIVE ITEM ----------------
//       setActivePurchaseItem: (variantId) => set({ activeVariantId: variantId }),

//       // ---------------- CLEAR AFTER SUBMIT ----------------
//       clearPurchase: () =>
//         set({
//           purchaseItems: [],
//           activeVariantId: null,
//         }),
//     }),
//     {
//       name: "purchase-storage", // ✅ market-role based
//       partialize: (state) => ({
//         purchaseItems: state.purchaseItems,
//         activeVariantId: state.activeVariantId,
//       }),
//     }
//   )
// );

// export default useStockEntryStore;

//////////////////////////////////////////////////////////

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStockEntryStore = create(
  persist(
    (set) => ({
      // ================== STATE ==================
      purchaseItems: [], // All products in the purchase invoice

      // ================== ADD ITEM ==================
      addPurchaseItem: (product) =>
        set((state) => {
          const existing = state.purchaseItems.find(
            (item) => item.variantId === product.variantId
          );

          // If already exists → increase quantity
          if (existing) {
            return {
              purchaseItems: state.purchaseItems.map((item) =>
                item.variantId === product.variantId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          // New item
          return {
            purchaseItems: [
              ...state.purchaseItems,
              {
                ...product,
              },
            ],
          };
        }),

      // ================== UPDATE ITEM ==================
      updatePurchaseItem: (variantId, updatedFields) =>
        set((state) => ({
          purchaseItems: state.purchaseItems.map((item) =>
            item.variantId === variantId ? { ...item, ...updatedFields } : item
          ),
        })),

      // ================== REMOVE ITEM ==================
      removePurchaseItem: (variantId) =>
        set((state) => ({
          purchaseItems: state.purchaseItems.filter(
            (item) => item.variantId !== variantId
          ),
        })),

      // ================== CLEAR AFTER SUBMIT ==================
      clearPurchase: () => set({ purchaseItems: [] }),
    }),
    {
      name: "purchase-storage", // persists draft purchase if refresh happens
      partialize: (state) => ({
        purchaseItems: state.purchaseItems,
      }),
    }
  )
);

export default useStockEntryStore;
