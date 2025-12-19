import { create } from "zustand";
import { persist } from "zustand/middleware";

const useInvoiceStore = create(
  persist(
    (set) => ({
      saleList: [], // ⬅️ holds multiple sale objects
      activeSaleId: null, // ⬅️ ID of the currently active sale

      // Actions
      createNewSale: (newSale) =>
        set((state) => ({
          saleList: [...state.saleList, newSale],
          activeSaleId: newSale.invoiceNumber,
        })),

      removeSale: (invoiceId) =>
        set((state) => {
          const updatedList = state.saleList.filter(
            (sale) => sale.invoiceNumber !== invoiceId
          );
          const newActive =
            state.activeSaleId === invoiceId && updatedList.length
              ? updatedList[0].invoiceNumber
              : updatedList.length
              ? updatedList[0].invoiceNumber
              : null;

          return {
            saleList: updatedList,
            activeSaleId: newActive,
          };
        }),

      updateSale: (invoiceId, updatedFields) =>
        set((state) => ({
          saleList: state.saleList.map((sale) =>
            sale.invoiceNumber === invoiceId
              ? { ...sale, ...updatedFields }
              : sale
          ),
        })),

      setActiveSale: (invoiceId) => set({ activeSaleId: invoiceId }),

      clearSales: () => set({ saleList: [], activeSaleId: null }),
    }),
    {
      name: "invoice-storage",
    }
  )
);

export default useInvoiceStore;
