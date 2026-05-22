import React, { useState, useEffect, useMemo } from "react";
import Topbar from "../../components/Topbar";
import Navbar from "../../components/Navbar";
import "../../styles/stockLevels.css";
import { getLocalInventoryProductsData } from "../../services/localInventorySearchService";

function StockLevels() {
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);

  const [inventoryData, setInventoryData] = useState([]);

  useEffect(() => {
    async function loadInventory() {
      const data = await getLocalInventoryProductsData();
      setInventoryData(data || []);
    }

    loadInventory();
  }, []);

  console.log(inventoryData);

  // 🔹 Calculate total stock
  const calculateTotalStock = (batches) =>
    batches.reduce((sum, batch) => sum + batch.quantity, 0);

  // 🔹 Expiry Status Logic
  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    if (expiry < today) return "Expired";

    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    if (expiry <= threeMonthsLater) return "Near Expiry";

    return "Safe";
  };

  // 🔹 Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventoryData.filter((product) => {
      const totalStock = calculateTotalStock(product.batches);

      const matchesSearch = product.brandName
        .toLowerCase()
        .includes(search.toLowerCase());

      const isLowStock = totalStock < product.minStockLevel;

      const hasExpiring = product.batches.some(
        (b) => getExpiryStatus(b.expiry) !== "Safe",
      );

      if (showLowStock && !isLowStock) return false;
      if (showExpiring && !hasExpiring) return false;

      return matchesSearch;
    });
  }, [inventoryData, search, showLowStock, showExpiring]);

  return (
    <div>
      <Topbar />

      <div className="navbarAndContentMaincontainer">
        <Navbar />

        <div className="contentContainer">
          <div className="newSaleContainer">
            <h1 className="pageHeader">Stock Levels</h1>

            {/* 🔎 Search + Filters */}
            <div className="stockFilterContainer">
              <input
                type="text"
                placeholder="Search medicine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="searchInput"
              />

              <label>
                <input
                  type="checkbox"
                  checked={showLowStock}
                  onChange={() => setShowLowStock(!showLowStock)}
                />
                Low Stock Only
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={showExpiring}
                  onChange={() => setShowExpiring(!showExpiring)}
                />
                Expiring / Expired
              </label>
            </div>

            {/* 📦 Stock Summary Table */}
            <div className="stockTable">
              <div className="stockTableHeader">
                <div className="col brandCol">Brand</div>
                <div className="col centerCol">Total Stock</div>
                <div className="col centerCol">Min Level</div>
                <div className="col centerCol">Status</div>
                <div className="col actionCol">Action</div>
              </div>

              {filteredInventory.map((product, index) => {
                const totalStock = calculateTotalStock(product.batches);
                const isLowStock = totalStock < product.minStockLevel;

                return (
                  <div
                    key={product._id}
                    className={`stockRow ${index % 2 === 0 ? "evenRow" : "oddRow"}`}
                  >
                    <div className="stockFlexRow">
                      <div className="col brandCol">{product.brandName}</div>

                      <div className="col centerCol">{totalStock}</div>

                      <div className="col centerCol">
                        {product.minStockLevel}
                      </div>

                      <div
                        className={`col centerCol ${
                          totalStock === 0
                            ? "status-out"
                            : isLowStock
                              ? "status-low"
                              : "status-normal"
                        }`}
                      >
                        {totalStock === 0
                          ? "Out of Stock"
                          : isLowStock
                            ? "Low Stock"
                            : "Normal"}
                      </div>

                      <div className="col actionCol">
                        <button
                          className="viewBtn"
                          onClick={() =>
                            setExpandedProduct(
                              expandedProduct === product._id
                                ? null
                                : product._id,
                            )
                          }
                        >
                          View
                        </button>
                      </div>

                      {expandedProduct === product._id && (
                        <div className="expandedSection">
                          <div className="batchHeader">
                            <div>Batch No</div>
                            <div>Quantity</div>
                            <div>Expiry</div>
                            <div>Status</div>
                          </div>

                          {product.batches?.map((batch, i) => (
                            <div key={i} className="batchRow">
                              <div>{batch.batchNumber || "-"}</div>
                              <div>{batch.quantity}</div>
                              <div>{batch.expiry}</div>
                              <div>{getExpiryStatus(batch.expiry)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockLevels;
