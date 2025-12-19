import { create } from "zustand";
import { persist } from "zustand/middleware";

const usePharmaMaGenericDataStore = create(
  persist(
    (set) => ({
      processedData: [],
      setProcessedData: (data) => set({ processedData: data }),
    }),
    {
      name: "PharmaMa_GenericData ",
    }
  )
);

export default usePharmaMaGenericDataStore;
