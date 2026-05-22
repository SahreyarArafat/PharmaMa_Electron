import React, { useEffect } from "react";
import useStockEntryStore from "../store/useStockEntryStore";
import { IoClose } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import "./saleTabs.css";

export default function StockEntryTabs() {
  const addPurchaseEntry = useStockEntryStore(
    (state) => state.addPurchaseEntry
  );
  const setActiveEntry = useStockEntryStore((state) => state.setActiveEntry);
  const activeEntryId = useStockEntryStore((state) => state.activeEntryId);
  const purchaseEntries = useStockEntryStore((state) => state.purchaseEntries);
  const removePurchaseEntry = useStockEntryStore(
    (state) => state.removePurchaseEntry
  );

  const handleAddEntry = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);

    addPurchaseEntry({
      entryId: `ENTRY-${timestamp}-${random}`,
      purchaseItems: [],
      createdAt: new Date().toISOString(),
    });
  };

  // Ensure at least one entry exists
  useEffect(() => {
    if (purchaseEntries.length === 0) {
      handleAddEntry();
    }
  }, [purchaseEntries]);

  return (
    <div className="stock-entry-tabs-container">
      {purchaseEntries.map((entry, index) => (
        <div
          key={entry.entryId}
          onClick={() => setActiveEntry(entry.entryId)}
          className={`stock-entry-tab ${
            entry.entryId === activeEntryId ? "active" : ""
          }`}
        >
          <span className="tab-text">Entry {index + 1}</span>

          <div
            className="closeIconContainer"
            onClick={(e) => {
              e.stopPropagation();
              removePurchaseEntry(entry.entryId);
            }}
          >
            <IoClose size={14} className="close-icon" />
          </div>
        </div>
      ))}

      {/* ➕ New Entry Button */}
      <div
        onClick={handleAddEntry}
        className="new-tab-button"
        title="New Stock Entry"
      >
        <IoMdAdd />
      </div>
    </div>
  );
}
