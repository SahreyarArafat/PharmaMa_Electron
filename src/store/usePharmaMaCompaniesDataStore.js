import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePharmaMaCompaniesDataStore = create(
  persist(
    (set) => ({
      processedData: [],
      setProcessedData: (data) => set({ processedData: data }),
    }),
    {
      name: "PharmaMa_CompaniesData ",
    }
  )
);

export default usePharmaMaCompaniesDataStore;
