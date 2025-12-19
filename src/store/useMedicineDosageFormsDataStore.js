import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePharmaMaDosageFormDataStore = create(
  persist(
    (set) => ({
      processedData: [],
      setProcessedData: (data) => set({ processedData: data }),
    }),
    {
      name: "PharmaMa_DosageForm",
    }
  )
);

export default usePharmaMaDosageFormDataStore;
