import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePharmaMaBrandDataStore = create(
  persist(
    (set) => ({
      processedData: [],
      setProcessedData: (data) => set({ processedData: data }),
    }),
    {
      name: "PharmaMa_BrandData",
    }
  )
);

export default usePharmaMaBrandDataStore;
