import { useState, useEffect, useRef, useMemo } from "react";
import usePharmaMaBrandDataStore from "../store/usePharmaMaBrandDataStore";
import { getLocalPharmaMaBrandData } from "../services/localPharmaMaDataSearchService";

// ✅ Debounce helper
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function usePharmaMaBrandDataSearchWorker() {
  const { processedData, setProcessedData } = usePharmaMaBrandDataStore();
  const [filteredBrandData, setFilteredBrandData] = useState([]);
  const [brandDataLoading, setBrandDataLoading] = useState(false);
  const [workerInitialized, setWorkerInitialized] = useState(false);
  const [error, setError] = useState(null);

  const searchWorkerRef = useRef(null);
  const retryCountRef = useRef(0);

  const fuseOptions = useMemo(
    () => ({
      keys: ["brandAndStrength", "genericName"],
      threshold: 0.3,
      includeScore: true,
    }),
    []
  );

  // ✅ Retry with exponential backoff
  const fetchWithRetry = async () => {
    try {
      const rawMedicinesData = await getLocalPharmaMaBrandData();

      if (!rawMedicinesData || rawMedicinesData.length === 0) {
        console.error("⚠️ No medicine data found.");

        throw new Error("⚠️ No medicine data found.");
      }

      const preprocessed = rawMedicinesData.map((item) => ({
        ...item,
        brandAndStrength: `${item.brandName?.replace("-", "")} ${
          item.strength
        }`,
        genericName: `${item.genericName}`,
      }));

      setProcessedData(preprocessed);

      console.log("✅ Success to fatch medicine brand data.");

      retryCountRef.current = 0; // ✅ Reset retry counter
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch medicine data:", err);
      setError("Failed to fetch data");

      retryCountRef.current += 1;
      if (retryCountRef.current <= 5) {
        const delay = [5000, 15000, 30000, 30000, 30000][
          retryCountRef.current - 1
        ];
        console.warn(
          `🔄 Retry #${retryCountRef.current} in ${delay / 1000}s...`
        );

        setTimeout(fetchWithRetry, delay);
      } else {
        console.error("🛑 Max retries reached. Manual reload required.");
      }
    }
  };

  // ✅ Initial data fetch
  useEffect(() => {
    if (processedData?.length > 0) return;
    fetchWithRetry();
  }, [processedData]);

  // ✅ Worker initialization
  useEffect(() => {
    if (processedData?.length === 0) return;

    if (searchWorkerRef.current) searchWorkerRef.current.terminate();

    const worker = new Worker(
      new URL("../workers/searchWorker.js", import.meta.url),
      { type: "module" }
    );

    searchWorkerRef.current = worker;

    worker.postMessage({
      action: "initialize",
      data: processedData,
      options: fuseOptions,
    });

    worker.onmessage = (e) => {
      if (e.data === "initialized") {
        setWorkerInitialized(true);
      } else if (Array.isArray(e.data)) {
        const results = e.data.map((r) => r.item);
        setFilteredBrandData(results);
        setBrandDataLoading(false);
      }
    };

    return () => worker.terminate();
  }, [processedData, fuseOptions]);

  // ✅ Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        if (!query.trim()) {
          setFilteredBrandData([]);
          return;
        }

        if (!workerInitialized) {
          setBrandDataLoading(false);
          return;
        }

        setBrandDataLoading(true);
        searchWorkerRef.current?.postMessage({ action: "search", query });
      }, 500),
    [workerInitialized]
  );

  // ✅ Manual reload button action
  const reloadBrandData = () => {
    console.log("🔄 BrandData is reloading.");
    // setWorkerInitialized(false);
    // setProcessedData([]); // Force re-fetch
    retryCountRef.current = 0;
    fetchWithRetry();
  };

  return {
    brandDataLoading,
    filteredBrandData,
    error,
    brandDataSearch: debouncedSearch,
    reloadBrandData,
  };
}
