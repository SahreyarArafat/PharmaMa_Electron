// import React, { useState, useMemo, useEffect, useRef } from "react";
// import { FixedSizeList as List } from "react-window";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FixedSizeList as List } from "react-window";

import "../../styles/product.css";
import Required from "../required";

const AddNewProductModal = ({
  show,
  isClosing,
  newProduct,
  setNewProduct,
  handleCloseModal,
  handleSubmitNewProductBtn,
  companyFilteredData,
  companyNameSearch,
  dosageFormFilteredData,
  dosageFormSearch,
  genericFilteredData,
  genericNameSearch,
  isDuplicate,
  isFormInvalid,
}) => {
  // New Product Manufacturer Input Handler
  const handleNewProductManufacturerInput = (text) => {
    setNewProduct({ ...newProduct, manufacturer: text });
    companyNameSearch(text);
  };

  const handleAddNewProductManufacturer = (manufacturer) => {
    setNewProduct((prev) => ({
      ...prev,
      manufacturer,
    }));
  };

  // New Product Marketer Input Handler
  const handleNewProductMarketerInput = (text) => {
    setNewProduct({ ...newProduct, marketer: text });
    companyNameSearch(text);
  };

  const handleAddNewProductMarketer = (marketer) => {
    setNewProduct((prev) => ({
      ...prev,
      marketer,
    }));
  };

  // DosageForm Input Handler
  const handleMedicineDoageFormInput = (text) => {
    setNewProduct({ ...newProduct, dosageform: text });
    dosageFormSearch(text);
  };

  const handleAddMedicineDosageForm = (dosageform) => {
    setNewProduct((prev) => ({
      ...prev,
      dosageform,
    }));
  };

  // Generic Name input handler
  const handleMedicineGenericNameSearchInput = (text) => {
    setNewProduct({ ...newProduct, genericName: text });
    genericNameSearch(text);
  };

  const handleAddGenericName = (genericName) => {
    setNewProduct((prev) => ({
      ...prev,
      genericName,
    }));
  };

  if (!show) {
    return null;
  }
  return (
    <div className={`modalOverlay ${isClosing ? "fadeOut" : ""}`}>
      <div className={`modalContent ${isClosing ? "fadeOut" : ""}`}>
        <h2 className="modalTitle">Add New Product</h2>

        <div className="formRow">
          <label>
            Brand Name <Required />
          </label>
          <input
            type="text"
            value={newProduct.brandName}
            placeholder="e.g. Napa Extra"
            onChange={(e) =>
              setNewProduct({ ...newProduct, brandName: e.target.value })
            }
          />
        </div>

        <SearchableListInput
          label="Generic Name"
          placeholder="e.g. Paracetamol + Caffeine"
          value={newProduct.genericName}
          items={genericFilteredData.map((g) => ({
            label: g.genericName,
            ...g,
          }))}
          onChange={(text) => handleMedicineGenericNameSearchInput(text)}
          onSelect={(item) => handleAddGenericName(item.label)}
        />

        <div className="formRow">
          <label>Strength</label>
          <input
            type="text"
            placeholder="e.g. 500mg or 5ml/10mg"
            value={newProduct.strength}
            onChange={(e) =>
              setNewProduct({ ...newProduct, strength: e.target.value })
            }
          />
        </div>

        <SearchableListInput
          label="Dosage Form"
          placeholder="e.g. Tablet, Syrup..."
          isRequired={true}
          value={newProduct.dosageform}
          items={dosageFormFilteredData.map((item) => ({
            label: item.name,
            ...item,
          }))}
          onChange={(text) => handleMedicineDoageFormInput(text)}
          onSelect={(item) => handleAddMedicineDosageForm(item.label)}
        />

        <div className="formRow">
          <label>Pack Size</label>
          <input
            placeholder="e.g. 10 * 10, 200 ml"
            type="text"
            value={newProduct.packSize}
            onChange={(e) =>
              setNewProduct({ ...newProduct, packSize: e.target.value })
            }
          />
        </div>

        <SearchableListInput
          label="Manufacturer"
          placeholder="e.g. Aristopharma Ltd."
          isRequired={newProduct.marketer === "" ? true : false}
          value={newProduct.manufacturer}
          items={companyFilteredData.map((c) => ({
            label: c.companyName,
            ...c,
          }))}
          onChange={(text) => handleNewProductManufacturerInput(text)}
          onSelect={(item) => handleAddNewProductManufacturer(item.label)}
        />

        <SearchableListInput
          label="Marketer"
          placeholder=" e.g. Discount Pharma"
          isRequired={newProduct.manufacturer === "" ? true : false}
          value={newProduct.marketer}
          items={companyFilteredData.map((c) => ({
            label: c.companyName,
            ...c,
          }))}
          onChange={(text) => handleNewProductMarketerInput(text)}
          onSelect={(item) => handleAddNewProductMarketer(item.label)}
        />

        <div className="formRow">
          <label>
            Unit Price <Required />
          </label>
          <input
            type="number"
            value={newProduct.unitPrice}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                unitPrice: e.target.value || "",
              })
            }
            onBlur={(e) =>
              setNewProduct({
                ...newProduct,
                unitPrice: Number(e.target.value) || 0,
              })
            }
          />
        </div>

        {isDuplicate && (
          <div className="warning">
            <span className="warningIcon">⚠️</span>
            <p className="warningText">
              This product already exists in PharmaMa Brand Data.
              <br />
              Please use the existing product.
            </p>
          </div>
        )}

        <div className="modalButtons">
          <button className="btn cancelBtn" onClick={handleCloseModal}>
            Cancel
          </button>

          <button
            className={`btn primaryBtn ${
              isDuplicate || isFormInvalid ? "disabledBtn" : ""
            }`}
            disabled={isDuplicate || isFormInvalid}
            onClick={handleSubmitNewProductBtn}
          >
            {isDuplicate
              ? "Product Already Exists"
              : isFormInvalid
              ? "Fill Required Fields"
              : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

function SearchableListInput({
  label,
  isRequired,
  value,
  items = [],
  onChange,
  onSelect,
  placeholder = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);

  // ----- selection init/reset -----
  useEffect(() => {
    if (isOpen && items.length > 0) setSelectedIndex(0);
    else setSelectedIndex(-1);
  }, [isOpen, items]);

  // ----- keyboard repeat control -----
  const delayTimerRef = useRef(null);
  const repeatTimerRef = useRef(null);
  const stepDirRef = useRef(0);

  const step = (dir) => {
    if (!isOpen || items.length === 0) return;
    setSelectedIndex((prev) => {
      const next = Math.max(0, Math.min(items.length - 1, prev + dir));
      return next === prev ? prev : next;
    });
  };

  const startRepeat = (dir) => {
    clearTimers();
    stepDirRef.current = dir;
    // one immediate step
    step(dir);
    // native-like repeat: small delay then fast interval
    delayTimerRef.current = setTimeout(() => {
      repeatTimerRef.current = setInterval(() => step(stepDirRef.current), 60);
    }, 220);
  };

  const clearTimers = () => {
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
    delayTimerRef.current = null;
    repeatTimerRef.current = null;
  };

  const handleKeyDown = (e) => {
    if (!isOpen || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (e.repeat) return; // we manage repeat ourselves
      startRepeat(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (e.repeat) return;
      startRepeat(-1);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      onSelect(items[selectedIndex]);
      setIsOpen(false);
      clearTimers();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      clearTimers();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") clearTimers();
  };

  // ----- list (scroll only when needed) -----
  const visibleRangeRef = useRef({ start: 0, stop: 0 });
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current || selectedIndex < 0) return;
    const { start, stop } = visibleRangeRef.current;
    if (selectedIndex < start) {
      listRef.current.scrollToItem(selectedIndex, "start");
    } else if (selectedIndex > stop) {
      listRef.current.scrollToItem(selectedIndex, "end");
    }
    // no scroll when already fully visible → no blink
  }, [selectedIndex]);

  // ----- outside click closes -----
  useEffect(() => {
    const onDocClick = (evt) => {
      if (containerRef.current && !containerRef.current.contains(evt.target)) {
        setIsOpen(false);
        clearTimers();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      clearTimers();
    };
  }, []);

  return (
    <div
      className="formRow"
      style={{ position: "relative" }}
      ref={containerRef}
    >
      {label && (
        <label>
          {label} {isRequired && <Required />}
        </label>
      )}
      <input
        type="text"
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      />

      {isOpen && items.length > 0 && (
        <div className="genericDataFilteredList">
          <List
            ref={listRef}
            height={200}
            itemCount={items.length}
            itemSize={50}
            width="100%"
            className="search_results_container"
            onItemsRendered={({ visibleStartIndex, visibleStopIndex }) => {
              visibleRangeRef.current = {
                start: visibleStartIndex,
                stop: visibleStopIndex,
              };
            }}
          >
            {({ index, style }) => {
              const item = items[index];
              const isSelected = index === selectedIndex;
              const isEven = index % 2 === 0;
              return (
                <div
                  style={style}
                  className={`genericName_search_result_item ${
                    isEven ? "even" : "odd"
                  } ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    onSelect(item);
                    setIsOpen(false);
                    clearTimers();
                  }}
                >
                  <p>{item.label}</p>
                </div>
              );
            }}
          </List>
        </div>
      )}
    </div>
  );
}

export default AddNewProductModal;
