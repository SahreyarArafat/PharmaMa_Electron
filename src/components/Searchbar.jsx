import React, { useState, useMemo, useEffect, useRef } from "react";
import { FixedSizeList as List } from "react-window";
// Styles
import "./searchbar.css";
// Medicine Data
import brandMedicineData from "../assets/Medicine Data/Medicine Brand Data/allHarbal&AllopathicBrandName.json";
import genericMedicineData from "../assets/Medicine Data/Medicine Generic Data/allHerbal&AllopathicGenericData.json";
// Medicine Icon Images
import dosageIconsMap from "../assets/Medicine Data/dosageIcons.js";
import defultDosageIcon from "../assets/Medicine Data/Dosage Icon/medicine.png";
import defultHerbalMedicineIcon from "../assets/Medicine Data/Dosage Icon/herbal-meds-2.png";
// Icons
import { IoSearch } from "react-icons/io5";

// Preprocess data to include combined fields
const processedData = brandMedicineData.map((item) => ({
  ...item,
  brandAndStrength: `${item.brandName.replace("-", "")} ${
    item.strength
  }`.toLowerCase(),
  genericName: `${item.genericName}`.toLocaleLowerCase(),
}));

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function SearchBar({ onCartUpdate }) {
  const [medicineName, setMedicineName] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartedProducts, setCartedProducts] = useState([]);
  const [searchWorker, setSearchWorker] = useState(null); // Store worker instance
  const [workerInitialized, setWorkerInitialized] = useState(false);
  const [isListVisible, setIsListVisible] = useState(false); // Track list visibility
  const containerRef = useRef(null); // Reference to the container

  const fuseOptions = useMemo(
    () => ({
      keys: ["brandAndStrength", "genericName"],
      threshold: 0.3,
      includeScore: true,
    }),
    []
  );

  // Initialize worker
  useEffect(() => {
    const worker = new Worker(
      new URL("../workers/searchWorker.js", import.meta.url)
    );
    setSearchWorker(worker);

    worker.postMessage({
      action: "initialize",
      data: processedData,
      options: fuseOptions,
    });

    worker.onmessage = (e) => {
      if (e.data === "initialized") {
        setWorkerInitialized(true); // Worker is ready
      }
    };

    return () => {
      worker.terminate(); // Cleanup worker on unmount
    };
  }, [fuseOptions]);

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        if (!query.trim()) {
          setFilteredData([]);
          return;
        }

        if (!workerInitialized) {
          console.error("Search worker is not initialized yet.");
          setLoading(false);
          return;
        }

        setLoading(true);
        searchWorker.postMessage({ action: "search", query });

        searchWorker.onmessage = (e) => {
          const results = e.data.map((result) => result.item);
          setFilteredData(results);
          setLoading(false);
        };
      }, 500),
    [searchWorker, workerInitialized]
  );

  const handleInputChange = (text) => {
    setMedicineName(text);
    debouncedSearch(text);
    setIsListVisible(true); // Show list when typing
  };

  // Add to Cart Section ---------------------------

  const handleAddToCart = (product) => {
    const updatedProducts = [
      ...cartedProducts,
      { ...product, quantity: 1, newUnitPrice: "0" },
    ];
    setCartedProducts(updatedProducts);

    // Send updated cart to the parent via callback
    onCartUpdate(updatedProducts);
  };

  const isAlreadyInCart = (product) => {
    const productKey = generateUniqueKey(product);
    return cartedProducts.some(
      (cartedProduct) => generateUniqueKey(cartedProduct) === productKey
    );
  };

  const generateUniqueKey = (item, index) => {
    return ` ${index}-${item.serialNumber}-${item.brandName}-${item.dosageform}-${item.strength}`;
  };

  // Searched Medicine dynamic Row -------------------------

  const getDosageIcon = (dosageForm) => {
    return dosageIconsMap[dosageForm] || defultDosageIcon;
  };

  const Row = ({ index, style }) => {
    const item = filteredData[index];
    const iconPath = getDosageIcon(item.dosageform);
    return (
      <div
        key={generateUniqueKey(item, index)}
        className="search_result_item"
        style={style}
      >
        <div className="search_result_header_container">
          <div className="stock_status">In Stock</div>
          {!isAlreadyInCart(item) ? (
            <button
              onClick={() => {
                handleAddToCart(item);
              }}
              className="add_btn"
            >
              Add to Cart
            </button>
          ) : (
            <button className="add_btn">Added Successfully</button>
          )}
        </div>
        <div className="search_result_title_container">
          <div className="medicine_dosage_icon">
            <img
              src={
                item.medicineType == "Herbal"
                  ? defultHerbalMedicineIcon
                  : iconPath
              }
              alt="medicine icon"
            />
          </div>
          <p>
            <span className="brandName">{item.brandName}</span>{" "}
            <span className="strength">{item.strength}</span>{" "}
            <span className="dosageform">
              {item.dosageform ? `(${item.dosageform})` : ""}
            </span>
          </p>
        </div>
        <p className="genericName">{item.genericName} </p>
        <p className="manufacturer">{item.manufacturer} </p>
      </div>
    );
  };

  // ------------------  Handle clicks outside

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsListVisible(false); // Close the list if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div ref={containerRef} className="medicineSearchContainer">
        <div className="searchbar">
          <p className="filterBtn">Search</p>
          <input
            type="text"
            placeholder={`Search medicine`}
            className="searchInput"
            onChange={(e) => handleInputChange(e.target.value)}
            value={medicineName}
            onFocus={() => setIsListVisible(true)} // Show list on focus
          />
          <div className="searchIconContainer">
            <IoSearch className="searchIcon" />
          </div>
        </div>

        {/* Filtered List Section */}
        {loading && <p>Loading...</p>}

        {isListVisible && filteredData.length > 0 && (
          <div className="filteredList">
            {/* <h2 className="search_result_header">
                    Showing results matching keyword ❝
                   <strong>{medicineName}</strong>❞
                    </h2> */}
            <List
              height={400} // Adjust the height for your container
              itemCount={filteredData.length}
              itemSize={100} // Adjust the row height
              width={"100%"}
              className="search_results_container"
            >
              {Row}
            </List>
          </div>
        )}
      </div>
    </div>
  );
}
