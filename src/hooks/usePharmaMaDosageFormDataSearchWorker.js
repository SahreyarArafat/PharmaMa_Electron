// hooks/medicineDosageFormSearchWorker.js
import { useState, useEffect, useRef, useMemo } from "react";
import useMedicineDosageFormDataStore from "../store/useMedicineDosageFormsDataStore";
import { getLocalPharmaMaDosageFormData } from "../services/localPharmaMaDataSearchService";

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function usePharmaMaDosageFormDataSearchWorker() {
  const { processedData, setProcessedData } = useMedicineDosageFormDataStore();
  const [dosageFormFilteredData, setDosageFormFilteredData] = useState([]);
  const [dosageFormLoading, setDosageFormLoading] = useState(false);
  const [workerInitialized, setWorkerInitialized] = useState(false);
  const [error, setError] = useState(null);

  const searchWorkerRef = useRef(null);
  const retryCountRef = useRef(0);

  const fuseOptions = useMemo(
    () => ({
      keys: ["name"], // change depending on your dosage form object key
      threshold: 0.2,
      includeScore: true,
    }),
    []
  );

  // ✅ Retry with exponential backoff
  const fetchWithRetry = async () => {
    try {
      const rawMedicinesData = await getLocalPharmaMaDosageFormData();

      if (!rawMedicinesData || rawMedicinesData.length === 0) {
        console.error("⚠️ No dosage form data found.");

        throw new Error("⚠️ No dosage form data found.");
      }

      const preprocessed = rawMedicinesData;

      setProcessedData(preprocessed);
      console.log("✅ Successfully fatch medicine dosage form data.");

      retryCountRef.current = 0; // ✅ Reset retry counter
      setError(null);
    } catch (err) {
      console.error("❌ Failed to fetch Dosage Form data:", err);
      setError("Failed to fetch Dosage Form data");

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
        setDosageFormFilteredData(results);
        setDosageFormLoading(false);
      }
    };

    return () => worker.terminate();
  }, [processedData, fuseOptions]);

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        if (!query.trim()) {
          setDosageFormFilteredData([]);
          return;
        }

        if (!workerInitialized) {
          setDosageFormLoading(false);
          return;
        }

        setDosageFormLoading(true);
        searchWorkerRef.current?.postMessage({ action: "search", query });
      }, 500),
    [workerInitialized]
  );

  const reloadDosageFormWorker = () => {
    console.log("🔄 Dosage Form Data is reloading.");

    // setWorkerInitialized(false);
    // setProcessedData([]); // Force re-fetch
    retryCountRef.current = 0;
    fetchWithRetry();
  };

  return {
    allDosageForm: processedData,
    dosageFormLoading,
    dosageFormFilteredData,
    dosageFormSearch: debouncedSearch,
    reloadDosageFormWorker,
    error,
  };
}
