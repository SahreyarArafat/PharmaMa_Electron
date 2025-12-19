import { create } from "zustand";
import { persist } from "zustand/middleware";

const useProductStore = create(
  persist(
    (set) => ({
      productList: [], // ✅ stores all product entries
      activeProductId: null, // ✅ currently selected product

      // Actions
      addProduct: (product) =>
        set((state) => ({
          productList: [...state.productList, product],
          activeProductId: product.id,
        })),

      updateProduct: (id, updatedFields) =>
        set((state) => ({
          productList: state.productList.map((product) =>
            product.id === id ? { ...product, ...updatedFields } : product
          ),
        })),

      deleteProduct: (id) =>
        set((state) => {
          const updatedList = state.productList.filter((p) => p.id !== id);
          const newActive =
            state.activeProductId === id && updatedList.length
              ? updatedList[0].id
              : updatedList.length
              ? updatedList[0].id
              : null;

          return {
            productList: updatedList,
            activeProductId: newActive,
          };
        }),

      setActiveProduct: (id) => set({ activeProductId: id }),

      clearProducts: () => set({ productList: [], activeProductId: null }),
    }),
    {
      name: "product-storage",
    }
  )
);

export default useProductStore;
