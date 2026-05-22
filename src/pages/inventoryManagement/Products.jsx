import React, { useState, useMemo, useEffect, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import { nanoid } from "nanoid";

// Medicine Icon Images
import dosageIconsMap from "../../assets/Medicine Data/dosageIcons.js";
import defultDosageIcon from "../../assets/Medicine Data/Dosage Icon/medicine.png";
import defultHerbalMedicineIcon from "../../assets/Medicine Data/Dosage Icon/herbal-meds-2.png";
// Icons
import { IoSearch, IoClose } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
// Server Api Functions
import {
  postLocalPharmaMaNewGenericData,
  postLocalPharmaMaNewDosageForm,
  postLocalPharmaMaNewCompanyData,
  postLocalPharmaMaNewBrandData,
  updateLocalPharmaMaBrandData,
} from "../../services/localPharmaMaDataSearchService.js";

import { postLocalInventoryProductsData } from "../../services/localInventorySearchService.js";

// Zustand InvoiceStore function
// import useProductStore from "../../store/useProductStore.js";
import useStockEntryStore from "../../store/useStockEntryStore.js";
// Brand data search worker
import usePharmaMaBrandDataSearchWorker from "../../hooks/usePharmaMaBrandDataSearchWorker.js";
// Generic data search worker
import usePharmaMaGenericDataSearchWorker from "../../hooks/usePharmaMaGenericDataSearchWorker.js";
// Medicine DosageForm search worker
import usePharmaMaDosageFormDataSearchWorker from "../../hooks/usePharmaMaDosageFormDataSearchWorker.js";
// Medicine Company Data search worker
import usePharmaMaCompanyDataSearchWorker from "../../hooks/usePharmaMaCompanyDataSearchWorker.js";

//////////////////////////////////////////

// Internal Components
import Topbar from "../../components/Topbar";
import Navbar from "../../components/Navbar";
import ProductTabs from "../../components/StockEntryTabs.jsx"; // Adjust path as needed
import AddNewProductModal from "../../components/modals/AddNewProductModal.jsx";
import ReloadSearchDataWorkerButton from "../../components/buttons/ReloadSearchDataWorkerButton.jsx";
// Styles

import "../../styles/product.css";

const Products = () => {
  // SearchBar states

  const [medicineName, setMedicineName] = useState("");
  const [isListVisible, setIsListVisible] = useState(false); // Track list visibility
  const containerRef = useRef(null); // Reference to the container

  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  const {
    allBrandData,
    brandDataSearch,
    filteredBrandData,
    brandDataLoading,
    reloadBrandData,
  } = usePharmaMaBrandDataSearchWorker();
  const {
    allCompanyData,
    companyDataLoading,
    companyFilteredData,
    companyNameSearch,
    reloadCompanyDataWorker,
  } = usePharmaMaCompanyDataSearchWorker();
  const {
    allDosageForm,
    dosageFormLoading,
    dosageFormFilteredData,
    dosageFormSearch,
    reloadDosageFormWorker,
  } = usePharmaMaDosageFormDataSearchWorker();
  // Generic data search state
  const {
    allGenericData,
    genericDataLoading,
    genericFilteredData,
    genericNameSearch,
    reloadGenericDataWorker,
  } = usePharmaMaGenericDataSearchWorker();
  const [newProduct, setNewProduct] = useState({
    variantId: nanoid(),
    medicineType: "",
    medicinePackImage: "",
    brandName: "",
    dosageform: "",
    genericName: "",
    strength: "",
    manufacturer: "",
    packSize: "",
    marketer: "",
    unitPrice: "",
    createdAt: "",
  });

  // Zustand InvoiceStore states
  // const addProduct = useProductStore((state) => state.addProduct);
  // const productList = useProductStore((state) => state.productList);
  // const updateProduct = useProductStore((state) => state.updateProduct);
  // const deleteProduct = useProductStore((state) => state.deleteProduct);
  // const activeProductId = useProductStore((state) => state.activeProductId);

  // const activeSale = productList.find(
  //   (product) => product.id === activeProductId
  // );

  // Zustand Stock Entry Store states
  // const addPurchaseItem = useStockEntryStore((state) => state.addPurchaseItem);
  // const purchaseItems = useStockEntryStore((state) => state.purchaseItems);
  // const updatePurchaseItem = useStockEntryStore(
  // (state) => state.updatePurchaseItem
  // );
  // const removePurchaseItem = useStockEntryStore(
  // (state) => state.removePurchaseItem
  // );

  // Zustand Stock Entry Store states (FINAL & CLEAN)

  const addPurchaseItem = useStockEntryStore((state) => state.addPurchaseItem);
  const purchaseItems = useStockEntryStore((state) => state.purchaseItems);
  const updatePurchaseItem = useStockEntryStore(
    (state) => state.updatePurchaseItem,
  );
  const removePurchaseItem = useStockEntryStore(
    (state) => state.removePurchaseItem,
  );
  const clearPurchase = useStockEntryStore((state) => state.clearPurchase);

  const currentTime = new Date().toISOString();

  // ///////////////////////////////////////////////
  const activeVariantId = useStockEntryStore((state) => state.activeVariantId);

  const activePurchaseItem = purchaseItems.find(
    (item) => item.variantId === activeVariantId,
  );

  ///////////////////////////////

  const handleProductSearchInput = (text) => {
    setMedicineName(text);
    brandDataSearch(text);
    setIsListVisible(true); // Show list when typing
  };

  // Searched Medicine dynamic Row -------------------------

  const isProductInCart = (variantId) => {
    return purchaseItems.some((c) => c.variantId === variantId);
  };

  const getDosageIcon = (dosageForm) => {
    return dosageIconsMap[dosageForm] || defultDosageIcon;
  };

  const Row = ({ index, style }) => {
    const item = filteredBrandData[index];
    const iconPath = getDosageIcon(item.dosageform);

    const alreadyInCart = isProductInCart(item.variantId);

    return (
      <div key={item.variantId} className="search_result_item" style={style}>
        <div className="search_result_header_container">
          <button
            className={`add_btn ${alreadyInCart ? "disabledBtn" : ""}`}
            disabled={alreadyInCart}
            aria-disabled={alreadyInCart}
            onClick={() => {
              if (!alreadyInCart) {
                handleAddToCart(item);
              }
            }}
          >
            {alreadyInCart ? "Already in Cart" : "Add to Cart"}
          </button>
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
        <p className="packSize">
          Pack Size: <span>{item.packSize}</span>
        </p>
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
        setIsListVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cart related functionalities---------------------------

  // const cleanProduct = (product) => {
  //   const { page_url, serialNumber, ...rest } = product;
  //   return rest;
  // };

  // const handleAddToCart = (product) => {
  //   // ✅ Clean unnecessary keys
  //   product = cleanProduct(product);

  //   let formatedPrice;

  //   if (typeof product.unitPrice === "string") {
  //     const clean = product.unitPrice
  //       .toString()
  //       .replace(/\n/g, " ")
  //       .replace(/৳/g, "")
  //       .replace(/,/g, "");

  //     const match = clean.match(/(\d+\.\d{2})/);
  //     formatedPrice = match ? parseFloat(match[1]) : parseFloat(clean) || 0;
  //   } else if (typeof product.unitPrice === "number") {
  //     formatedPrice = product.unitPrice;
  //   } else {
  //     formatedPrice = 0;
  //   }

  //   const productKey = generateUniqueKey(product); // Ex: brandName + strength

  //   // const existingProductIndex = (activeSale.productDetails || []).findIndex(
  //   //   (p) => generateUniqueKey(p) === productKey
  //   // );
  //   const existingProductIndex = (
  //     activePurchaseItem.productDetails || []
  //   ).findIndex((p) => generateUniqueKey(p) === productKey);

  //   let updatedProducts;

  //   if (existingProductIndex !== -1) {
  //     // ✅ Product exists → add a new empty batch
  //     //  updatedProducts = (activeSale.productDetails || []).map((p, idx) => {
  //     updatedProducts = (activePurchaseItem.productDetails || []).map(
  //       (p, idx) => {
  //         if (idx === existingProductIndex) {
  //           const newBatches = [
  //             ...(p.batches || []),
  //             {
  //               batchNo: "",
  //               quantity: 1,
  //               expiry: "",
  //               location: "",
  //               newUnitPrice: formatedPrice,
  //             },
  //           ];

  //           // Sum total quantity
  //           const totalStock = newBatches.reduce(
  //             (acc, batch) => acc + Number(batch.quantity || 0),
  //             0
  //           );

  //           return {
  //             ...p,
  //             unitPrice: formatedPrice,
  //             batches: newBatches,
  //             stock: totalStock,
  //           };
  //         }
  //         return p;
  //       }
  //     );
  //   } else {
  //     // ✅ New product → create with initial batch
  //     const initialBatches = [
  //       {
  //         batchNo: "",
  //         quantity: 1,
  //         expiry: "",
  //         location: "",
  //         newUnitPrice: formatedPrice,
  //       },
  //     ];

  //     updatedProducts = [
  //       // ...(activeSale.productDetails || []),
  //       ...(activePurchaseItem.productDetails || []),
  //       {
  //         ...product,
  //         packSize: product.packSize ?? "",
  //         unitPrice: formatedPrice,
  //         batches: initialBatches,
  //         stock: 1, // since there's only 1 quantity in the initial batch
  //       },
  //     ];
  //   }

  //   // updateProduct(activeProductId, {
  //   //   productDetails: updatedProducts,
  //   // });
  //   updatePurchaseItem(activeVariantId, {
  //     productDetails: updatedProducts,
  //   });
  // };

  const handleAddToCart = (product) => {
    // 1️⃣ Remove scraper-only fields
    // const product = cleanProduct(rawProduct);

    // 2️⃣ Normalize unit price

    let formatedPrice;

    if (typeof product.unitPrice === "string") {
      const clean = product.unitPrice
        .toString()
        .replace(/\n/g, " ")
        .replace(/৳/g, "")
        .replace(/,/g, "");

      const match = clean.match(/(\d+\.\d{2})/);
      formatedPrice = match ? parseFloat(match[1]) : parseFloat(clean) || 0;
    } else if (typeof product.unitPrice === "number") {
      formatedPrice = product.unitPrice;
    } else {
      formatedPrice = 0;
    }

    // console.log(product);

    // 3️⃣ Build purchase item (NO batches here)
    const purchaseItem = {
      variantId: product.variantId, // 🔐 REQUIRED
      brandName: product.brandName,
      genericName: product.genericName,
      dosageform: product.dosageform,
      strength: product.strength,
      manufacturer: product.manufacturer,
      marketer: product.marketer,
      medicinePackImage: product.medicinePackImage,
      packSize: product.packSize ?? "", // editable later
      unitPrice: formatedPrice, // editable later
      stock: 1, // default
      // batches will be added/edited later per row
      batches: [
        {
          batchNo: "",
          quantity: 1,
          expiry: "", // YYYY-MM
          location: "",
          newUnitPrice: formatedPrice,
        },
      ],
    };

    // 4️⃣ Add to purchase store (store handles duplicates)
    addPurchaseItem(purchaseItem);
  };

  // const removeBatch = (productIndex, batchIndex) => {
  //   // const updatedProducts = [...activeSale.productDetails];
  //   const updatedProducts = [...activePurchaseItem.productDetails];

  //   updatedProducts[productIndex].batches.splice(batchIndex, 1);

  //   // If no batches left, you may also remove the whole product:
  //   if (updatedProducts[productIndex].batches.length === 0) {
  //     updatedProducts.splice(productIndex, 1);
  //   }

  //   // updateProduct(activeProductId, {
  //   //   productDetails: updatedProducts,
  //   // });
  //   updatePurchaseItem(activeVariantId, {
  //     productDetails: updatedProducts,
  //   });
  // };

  const isProductCarted = (product) => {
    const productKey = generateUniqueKey(product);
    // return (activeSale.productDetails || []).some(
    return (activePurchaseItem.productDetails || []).some(
      (cartedProduct) => generateUniqueKey(cartedProduct) === productKey,
    );
  };

  const removeCartedProduct = (product) => {
    const productKey = generateUniqueKey(product);
    // const updatedProducts = (activeSale.productDetails || []).filter(
    const updatedProducts = (activePurchaseItem.productDetails || []).filter(
      (cartedProduct) => generateUniqueKey(cartedProduct) !== productKey,
    );

    // updateProduct(activeProductId, {
    //   productDetails: updatedProducts,
    // });
    updatePurchaseItem(activeVariantId, {
      productDetails: updatedProducts,
    });
  };

  const handlePackSizeChange = (variantId, value) => {
    // const updatedProducts = activeSale.productDetails.map((p) =>
    const product = purchaseItems.find((p) => p.variantId === variantId);
    if (!product) return;

    // const updatedProducts = activePurchaseItem.productDetails.map((p) =>
    //   p.variantId === variantId ? { ...p, packSize: value } : p
    // );

    // updateProduct(activeProductId, {
    //   productDetails: updatedProducts,
    // });

    updatePurchaseItem(variantId, {
      packSize: value,
    });
  };

  const handleProductQuantity = (product, value, productIndex, batchIndex) => {
    const productKey = generateUniqueKey(product, productIndex);

    // const updatedProducts = (activeSale.productDetails || []).map((p, idx) => {
    const updatedProducts = (activePurchaseItem.productDetails || []).map(
      (p, idx) => {
        if (generateUniqueKey(p, idx) !== productKey) return p;

        const updatedBatches = [...(p.batches || [])];

        if (updatedBatches[batchIndex]) {
          updatedBatches[batchIndex] = {
            ...updatedBatches[batchIndex],
            quantity: value === "" ? "" : parseInt(value),
          };
        }

        // ✅ Recalculate total stock from updated batches
        const totalStock = updatedBatches.reduce(
          (sum, batch) => sum + Number(batch.quantity || 0),
          0,
        );

        return {
          ...p,
          batches: updatedBatches,
          stock: totalStock, // ✅ Update stock here
        };
      },
    );

    // updateProduct(activeProductId, {
    //   productDetails: updatedProducts,
    // });

    updatePurchaseItem(activeVariantId, {
      productDetails: updatedProducts,
    });
  };

  const handleBatchExpiryChange = (
    product,
    newExpiryDate,
    productIndex,
    batchIndex,
  ) => {
    const productKey = generateUniqueKey(product, productIndex);

    // const updatedProducts = (activeSale.productDetails || []).map((p, idx) => {
    const updatedProducts = (activePurchaseItem.productDetails || []).map(
      (p, idx) => {
        if (generateUniqueKey(p, idx) === productKey) {
          const updatedBatches = [...(p.batches || [])];

          // Make sure batch exists before updating
          if (updatedBatches[batchIndex]) {
            updatedBatches[batchIndex] = {
              ...updatedBatches[batchIndex],
              expiry: newExpiryDate,
            };
          }

          return {
            ...p,
            batches: updatedBatches,
          };
        }

        return p;
      },
    );

    // updateProduct(activeProductId, {
    //   productDetails: updatedProducts,
    // });

    updatePurchaseItem(activeVariantId, {
      productDetails: updatedProducts,
    });
  };

  const handleBatchNoChange = (
    product,
    newBatchNo,
    productIndex,
    batchIndex,
  ) => {
    const productKey = generateUniqueKey(product, productIndex);

    // const updatedProducts = (activeSale.productDetails || []).map((p, idx) => {
    const updatedProducts = (activePurchaseItem.productDetails || []).map(
      (p, idx) => {
        if (generateUniqueKey(p, idx) === productKey) {
          const updatedBatches = [...(p.batches || [])];

          // Ensure the batch exists
          if (updatedBatches[batchIndex]) {
            const formatedBatchNo = newBatchNo.toUpperCase();
            updatedBatches[batchIndex] = {
              ...updatedBatches[batchIndex],
              batchNo: formatedBatchNo,
            };
          }

          return {
            ...p,
            batches: updatedBatches,
          };
        }

        return p;
      },
    );

    // updateProduct(activeProductId, {
    //   productDetails: updatedProducts,
    // });
    updatePurchaseItem(activeVariantId, {
      productDetails: updatedProducts,
    });
  };

  const handleProductLocation = (product, value, productIndex, batchIndex) => {
    const productKey = generateUniqueKey(product, productIndex);

    const formatedLocation = value.toUpperCase();
    // const updatedProducts = (activeSale.productDetails || []).map((p, idx) => {
    const updatedProducts = (activePurchaseItem.productDetails || []).map(
      (p, idx) => {
        if (generateUniqueKey(p, idx) !== productKey) return p;

        const updatedBatches = [...(p.batches || [])];

        if (updatedBatches[batchIndex]) {
          updatedBatches[batchIndex] = {
            ...updatedBatches[batchIndex],
            location: formatedLocation,
          };
        }

        return {
          ...p,
          batches: updatedBatches,
        };
      },
    );

    // updateProduct(activeProductId, {
    //   productDetails: updatedProducts,
    // });
    updatePurchaseItem(activeVariantId, {
      productDetails: updatedProducts,
    });
  };

  const handleProductUnitPrice = (
    product,
    newUnitPrice,
    productIndex,
    batchIndex,
  ) => {
    const productKey = generateUniqueKey(product, productIndex);

    // const updatedProducts = (activeSale.productDetails || []).map((p, idx) => {
    const updatedProducts = (activePurchaseItem.productDetails || []).map(
      (p, idx) => {
        if (generateUniqueKey(p, idx) === productKey) {
          const updatedBatches = [...(p.batches || [])];

          // Ensure the batch exists
          if (updatedBatches[batchIndex]) {
            updatedBatches[batchIndex] = {
              ...updatedBatches[batchIndex],
              newUnitPrice: newUnitPrice === "" ? "" : parseFloat(newUnitPrice),
            };
          }

          return {
            ...p,
            unitPrice: newUnitPrice === "" ? "" : parseFloat(newUnitPrice),
            batches: updatedBatches,
          };
        }

        return p;
      },
    );

    // updateProduct(activeProductId, {
    //   productDetails: updatedProducts,
    // });
    updatePurchaseItem(activeVariantId, {
      productDetails: updatedProducts,
    });
  };

  const handleProductDiscount = (product, value, index) => {
    const productKey = generateUniqueKey(product, index);

    // const updatedProducts = (activeSale.productDetails || []).map(
    const updatedProducts = (activePurchaseItem.productDetails || []).map(
      (cartedProduct, idx) =>
        generateUniqueKey(cartedProduct, idx) === productKey
          ? { ...cartedProduct, discount: parseFloat(value) }
          : cartedProduct,
    );

    // updateProduct(activeProductId, {
    //   productDetails: updatedProducts,
    // });
    updatePurchaseItem(activeVariantId, {
      productDetails: updatedProducts,
    });
  };

  const totalMRP = () => {
    // const total = activeSale.productDetails.reduce((acc, product) => {
    const total = activePurchaseItem.productDetails.reduce((acc, product) => {
      const unitPrice = parseFloat(product.newUnitPrice) || 0;
      const quantity = parseInt(product.quantity) || 0;
      return acc + unitPrice * quantity;
    }, 0);

    return total.toFixed(2);
  };

  const totalDiscountedPrice = () => {
    // const total = activeSale.productDetails.reduce((acc, product) => {
    const total = activePurchaseItem.productDetails.reduce((acc, product) => {
      const unitPrice = parseFloat(product.newUnitPrice) || 0;
      const quantity = parseInt(product.quantity) || 0;
      const discount = parseFloat(product.discount) || 0;

      const discountedPrice = quantity * unitPrice * (1 - discount / 100);
      return acc + discountedPrice;
    }, 0);

    return total.toFixed(2);
  };

  const generateUniqueKey = (item, index) => {
    return ` ${item.brandName}-${item.strength}-${item.dosageform}`;
  };

  const buildBrandMasterSyncPayload = (products) =>
    products.map((product) => ({
      variantId: product.variantId,
      unitPrice: product.unitPrice, // already committed from batches
      packSize: product.packSize ?? "",
    }));

  const syncBrandMasterFromPurchase = async (products) => {
    if (!products?.length) return;

    const payload = buildBrandMasterSyncPayload(products);
    console.log(payload);
    await updateLocalPharmaMaBrandData(payload);
  };

  const finalizeStockEntry = async () => {
    const { purchaseItems } = useStockEntryStore.getState();

    if (!purchaseItems.length) {
      console.warn("⚠️ No purchase items to submit.");
      return;
    }
    console.log(purchaseItems);

    try {
      // 1️⃣ Inventory save (CRITICAL)

      await postLocalInventoryProductsData(purchaseItems);

      console.log("✅ Inventory saved successfully");

      // 2️⃣ Brand master sync (NON-CRITICAL)
      try {
        await syncBrandMasterFromPurchase(purchaseItems);

        console.log("✅ brand data synced successfully");
      } catch (brandErr) {
        console.error("⚠️ Brand sync failed:", brandErr);
      }
    } catch (inventoryErr) {
      console.error("❌ Inventory save failed:", inventoryErr);
    }

    // 3️⃣ Clear purchase session
    clearPurchase();
  };

  // const postAddedProductList = async () => {
  //   // const { activeProductId, productList } = useProductStore.getState();
  //   const { activeVariantId, purchaseItems } = useStockEntryStore.getState();
  //   // const activeProductList = productList.find(
  //   const activeProductList = purchaseItems.find(
  //     // (products) => products.id === activeProductId
  //     (product) => product.variantId === activeVariantId
  //   );
  //   console.log(activeProductList.productDetails);

  //   if (!activeProductList) {
  //     console.error("No active products list to post.");
  //     return;
  //   }

  //   try {
  //     // const result = await postLocalInventoryProductsData(
  //     //   activeProductList.productDetails
  //     // );
  //     // console.log("✅ Products list posted:", result);

  //     // 1️⃣ Post inventory products
  //     await postLocalInventoryProductsData(activeProductList.productDetails);

  //     // 2️⃣ Update brand prices
  //     await updateLocalPharmaMaBrandData(
  //       buildBrandUpdatePayload(activeProductList.productDetails)
  //     );

  //     console.log("✅ Inventory + PharmaMa brand prices updated");
  //   } catch (error) {
  //     console.error("❌ Failed to post products list:", error);
  //   }
  // };

  const handleSubmitProductsBtn = async () => {
    // if (!activeProductId) {
    if (!activeVariantId) {
      console.warn("⚠️ No active products list to complete.");
      return;
    }

    try {
      // 2. Post the invoice
      await postAddedProductList();

      // 3. Remove the completed sale
      // deleteProduct(activeProductId);
      removePurchaseItem(activeVariantId);

      console.log("✅ products posted and cleared from tab.");
    } catch (error) {
      console.error("❌ Failed to post the products:", error);
    }
  };

  /////////////////////////////////

  const reloadAllWorkers = async () => {
    try {
      await Promise.all([
        reloadBrandData(),
        reloadCompanyDataWorker(),
        reloadDosageFormWorker(),
        reloadGenericDataWorker(),
      ]);
    } catch (err) {
      console.error("One or more workers failed to reload", err);
    }
  };

  const REQUIRED_FIELDS = ["brandName", "dosageform", "unitPrice"];

  const hasEmptyRequiredFields = (product) => {
    const baseInvalid = REQUIRED_FIELDS.some(
      (field) => !product[field]?.toString().trim(),
    );

    const price = Number(product.unitPrice);
    if (Number.isNaN(price) || price <= 0) return true;

    // Manufacturer OR Marketer must be present
    const companyInvalid =
      !product.manufacturer?.trim() && !product.marketer?.trim();

    return baseInvalid || companyInvalid;
  };

  const isFormInvalid = hasEmptyRequiredFields(newProduct);

  const normalize = (v = "") =>
    v.toString().toLowerCase().replace(/\s+/g, "").trim();

  const isBrandProductExists = (newProduct, allBrandData) => {
    return allBrandData.some(
      (p) =>
        normalize(p.brandName) === normalize(newProduct.brandName) &&
        normalize(p.strength) === normalize(newProduct.strength) &&
        normalize(p.dosageform) === normalize(newProduct.dosageform) &&
        normalize(p.packSize) === normalize(newProduct.packSize) &&
        normalize(p.manufacturer) === normalize(newProduct.manufacturer),
    );
  };

  // 🚫 Prevent duplicate brand product
  const isDuplicate = useMemo(
    () => isBrandProductExists(newProduct, allBrandData),
    [newProduct, allBrandData],
  );

  // console.log(isDuplicate);

  const handleNewProductSubmitBtn = async () => {
    // ✅ Normalize values before comparison
    const genericName = newProduct.genericName?.trim().toLowerCase() || "";
    const dosageform = newProduct.dosageform?.trim().toLowerCase() || "";
    const manufacturer = newProduct.manufacturer?.trim().toLowerCase() || "";
    try {
      // 🚫 1. Required field validation
      if (hasEmptyRequiredFields(newProduct)) {
        alert(
          "⚠️ Please fill in all required fields before adding the product.",
        );
        return;
      }

      // 🚫 2. Duplicate check
      if (isDuplicate) {
        alert(
          "⚠️ This product already exists in PharmaMa Brand Data.\nPlease use the existing product.",
        );
        return;
      }

      // ✅ Check if already exist
      const genericExists = allGenericData.find(
        (item) => item?.genericName?.toLowerCase() === genericName,
      );

      const dosageFormExists = allDosageForm.find(
        (item) => item?.name?.toLowerCase() === dosageform,
      );

      const manufacturerExists = allCompanyData.find(
        (item) => item?.companyName?.toLowerCase() === manufacturer,
      );

      // ✅ If not exist, post new
      if (!genericExists && genericName) {
        await postLocalPharmaMaNewGenericData({ genericName });
        console.log("✅ New generic added:", genericName);
        reloadGenericDataWorker();
      }

      if (!dosageFormExists && dosageform) {
        await postLocalPharmaMaNewDosageForm({ name: dosageform });
        console.log("✅ New dosage form added:", dosageform);
        reloadDosageFormWorker();
      }

      if (!manufacturerExists && manufacturer) {
        await postLocalPharmaMaNewCompanyData({ companyName: manufacturer });
        console.log("✅ New manufacturer added:", manufacturer);
        reloadCompanyDataWorker();
      }

      //  To get the exact time I need to update the newProduct just before post!
      const productToSave = {
        ...newProduct,
        createdAt: currentTime,
      };

      // ✅ Finally, add product
      const result = await postLocalPharmaMaNewBrandData(productToSave);

      console.log("✅ New product added successfully:", result);

      setShowNewProductModal(false);

      setNewProduct({
        variantId: nanoid(),
        medicineType: "",
        medicinePackImage: "",
        brandName: "",
        dosageform: "",
        genericName: "",
        packSize: "",
        strength: "",
        manufacturer: "",
        marketer: "",
        unitPrice: "",
        createdAt: "",
      });

      reloadBrandData();
    } catch (err) {
      console.error("❌ Add product failed:", err);
    }
  };

  const handleCloseModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowNewProductModal(false);
      setIsModalClosing(false);
    }, 200); // matches CSS animation time
  };

  ///////////////////////////////////////////

  const updateBatchField = (variantId, batchIndex, field, value) => {
    const product = purchaseItems.find((p) => p.variantId === variantId);
    if (!product) return;

    const updatedBatches = product.batches.map((batch, idx) =>
      idx === batchIndex ? { ...batch, [field]: value } : batch,
    );

    // ⚠️ Stock should only count valid numbers
    const totalStock = updatedBatches.reduce(
      (sum, b) => sum + (Number(b.quantity) || 0),
      0,
    );

    updatePurchaseItem(variantId, {
      batches: updatedBatches,
      stock: totalStock,
    });
  };

  const addBatch = (variantId) => {
    const product = purchaseItems.find((p) => p.variantId === variantId);
    if (!product) return;

    const updatedBatches = [
      ...(product.batches || []),
      {
        batchNo: "",
        quantity: 1,
        expiry: "",
        location: "",
        newUnitPrice: product.unitPrice ?? 0,
      },
    ];

    const totalStock = updatedBatches.reduce(
      (sum, b) => sum + Number(b.quantity || 0),
      0,
    );

    updatePurchaseItem(variantId, {
      batches: updatedBatches,
      stock: totalStock,
    });
  };

  const removeBatch = (variantId, batchIndex) => {
    const product = purchaseItems.find((p) => p.variantId === variantId);
    if (!product) return;

    const updatedBatches = product.batches.filter(
      (_, idx) => idx !== batchIndex,
    );

    const totalStock = updatedBatches.reduce(
      (sum, b) => sum + Number(b.quantity || 0),
      0,
    );

    updatePurchaseItem(variantId, {
      batches: updatedBatches,
      stock: totalStock,
    });
  };

  const removeProduct = (variantId) => {
    removePurchaseItem(variantId); // Zustand handles existence check
  };

  const commitLatestUnitPrice = (variantId) => {
    const product = purchaseItems.find((p) => p.variantId === variantId);
    if (!product || !product.batches?.length) return;

    const latestBatch = product.batches[product.batches.length - 1];
    const latestPrice = Number(latestBatch.newUnitPrice);

    if (!latestPrice || latestPrice <= 0) return;

    updatePurchaseItem(variantId, {
      unitPrice: latestPrice,
    });
  };

  return (
    <div>
      <Topbar />

      <div className="navbarAndContentMaincontainer">
        <Navbar />

        <div className="contentContainer">
          <div className="newSaleContainer">
            {/* <ProductTabs /> */}
            {/* <ReloadSearchDataWorkerButton onReload={reloadAllWorkers} /> */}
            <h1 className="pageHeader">Add Products</h1>
            {/* ////////////////////////////////////////// */}
            <div ref={containerRef} className="medicineSearchContainer">
              {/* <p className="sectionHeader">Search Products</p> */}
              <div className="searchbar">
                <p className="filterBtn">Search</p>
                <input
                  type="text"
                  placeholder={`Search medicine`}
                  className="searchInput"
                  onChange={(e) => handleProductSearchInput(e.target.value)}
                  value={medicineName}
                  onFocus={() => setIsListVisible(true)} // Show list on focus
                />
                <button
                  className="searchIconContainer"
                  onClick={() => {
                    // For Dev purpose to clear the Zustand States
                    // useProductStore.persist.clearStorage();
                    // useProductStore.setState({}, true);
                    useStockEntryStore.persist.clearStorage();
                    useStockEntryStore.setState({}, true);
                  }}
                >
                  <IoSearch className="searchIcon" />
                </button>
              </div>

              <div className="addNewProductBtnContainer">
                <button
                  className="addNewProductBtn"
                  onClick={() => setShowNewProductModal(true)}
                >
                  <FaPlus className="addNewProductIcon" />
                  <span className="addNewProductBtnText">New Product</span>
                </button>
              </div>

              {/* Filtered List Section */}
              {brandDataLoading && <div>Loading...</div>}

              {isListVisible && filteredBrandData.length > 0 && (
                <div className="filteredList">
                  {/* <h2 className="search_result_header">
                                 Showing results matching keyword ❝
                                <strong>{medicineName}</strong>❞
                                 </h2> */}
                  <List
                    height={400} // Adjust the height for your container
                    itemCount={filteredBrandData.length}
                    itemSize={100} // Adjust the row height
                    width={"100%"}
                    className="search_results_container"
                  >
                    {Row}
                  </List>
                </div>
              )}
            </div>
            {/* ///////////////////////////////////////// */}
            {/* Cart Section */}
            {/* {(activeSale?.productDetails?.length ?? 0) > 0 && ( */}
            {(purchaseItems.length ?? 0) > 0 && (
              <div className="">
                <div className="cartedProductContainer">
                  <p className="sectionHeader">Purchased Products</p>
                  <div className="cartedProductBG">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Expiry Date</th>
                          <th>Batch No</th>
                          <th>Location</th>
                          <th>Unit-MRP</th>
                          {/* <th>Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {/* {activeSale.productDetails.map( */}
                        {purchaseItems.map((product, productIndex) =>
                          product.batches.map((batch, batchIndex) => (
                            <tr key={`${product.variantId}-${batchIndex}`}>
                              {/* Product Info – Only show for the first batch row */}
                              <td className="productInfo">
                                {batchIndex === 0 && (
                                  <>
                                    <span className="productIndex">
                                      {productIndex + 1}
                                    </span>
                                    <span
                                      style={{
                                        marginLeft:
                                          productIndex > 8 ? "20px" : "8px",
                                      }}
                                      className="dosageform"
                                    >
                                      {product.dosageform}
                                    </span>
                                    <span className="brandName">
                                      {product.brandName}
                                    </span>
                                    <span className="strength">
                                      {product.strength}
                                    </span>
                                    <p className="genericName">
                                      {product.genericName}
                                    </p>
                                    <p
                                      className="manufacturer"
                                      title={product.manufacturer}
                                    >
                                      {product.manufacturer}
                                    </p>
                                    <p className="packSizeContainer">
                                      <span className="packSizeKey">
                                        Pack Size :
                                      </span>

                                      <input
                                        type="text"
                                        value={product.packSize}
                                        onChange={(e) =>
                                          handlePackSizeChange(
                                            product.variantId,
                                            e.target.value,
                                          )
                                        }
                                        className="packSizeInput"
                                      />
                                    </p>
                                  </>
                                )}
                              </td>

                              {/* Quantity Input */}
                              <td className="quantityContainer">
                                <input
                                  className="quantityInput"
                                  type="number"
                                  inputMode="numeric"
                                  value={batch.quantity}
                                  onChange={(e) =>
                                    updateBatchField(
                                      product.variantId,
                                      batchIndex,
                                      "quantity",
                                      e.target.value === ""
                                        ? ""
                                        : e.target.value,
                                    )
                                  }
                                  onBlur={(e) =>
                                    updateBatchField(
                                      product.variantId,
                                      batchIndex,
                                      "quantity",
                                      Number(e.target.value) || 1,
                                    )
                                  }
                                />
                              </td>

                              {/* Expiry Input */}
                              <td className="expiryDateContainer">
                                <input
                                  className="expiryDateInput"
                                  type="month"
                                  name="Expiry Date"
                                  value={batch.expiry}
                                  // onChange={(e) =>
                                  //   handleBatchExpiryChange(
                                  //     product,
                                  //     e.target.value,
                                  //     productIndex,
                                  //     batchIndex
                                  //   )
                                  // }
                                  onChange={(e) =>
                                    updateBatchField(
                                      product.variantId,
                                      batchIndex,
                                      "expiry",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              {/* Batch No Input */}
                              <td className="batchNoContainer">
                                {batchIndex === 0 && (
                                  <button
                                    className="addBatchBtn"
                                    onClick={() => addBatch(product.variantId)}
                                  >
                                    + Add Batch
                                  </button>
                                )}

                                <input
                                  className="batchNoInput"
                                  type="text"
                                  name="Batch No"
                                  value={batch.batchNo}
                                  // onChange={(e) =>
                                  //   handleBatchNoChange(
                                  //     product,
                                  //     e.target.value,
                                  //     productIndex,
                                  //     batchIndex
                                  //   )
                                  // }
                                  onChange={(e) =>
                                    updateBatchField(
                                      product.variantId,
                                      batchIndex,
                                      "batchNo",
                                      e.target.value.toUpperCase(),
                                    )
                                  }
                                />
                              </td>

                              {/* Location Input */}
                              <td className="locationContainer">
                                <input
                                  className="locationInput"
                                  type="text"
                                  name="Location"
                                  value={batch.location}
                                  // onChange={(e) =>
                                  //   handleProductLocation(
                                  //     product,
                                  //     e.target.value,
                                  //     productIndex,
                                  //     batchIndex
                                  //   )
                                  // }
                                  onChange={(e) =>
                                    updateBatchField(
                                      product.variantId,
                                      batchIndex,
                                      "location",
                                      e.target.value.toUpperCase(),
                                    )
                                  }
                                />
                              </td>

                              {/* Unit MRP & Remove */}
                              <td className="unitPrice_RemoveBtnContainer">
                                {/* {batchIndex === 0 && ( */}
                                <button
                                  className="removeBtn"
                                  onClick={() =>
                                    batchIndex === 0
                                      ? removeProduct(product.variantId)
                                      : removeBatch(
                                          product.variantId,
                                          batchIndex,
                                        )
                                  }
                                >
                                  <IoClose className="removeIcon" />
                                </button>

                                <input
                                  className="unitPriceInput"
                                  type="number"
                                  inputMode="decimal"
                                  value={batch.newUnitPrice}
                                  onChange={(e) =>
                                    updateBatchField(
                                      product.variantId,
                                      batchIndex,
                                      "newUnitPrice",
                                      e.target.value === ""
                                        ? ""
                                        : e.target.value,
                                    )
                                  }
                                  onBlur={(e) => {
                                    updateBatchField(
                                      product.variantId,
                                      batchIndex,
                                      "newUnitPrice",
                                      Number(e.target.value) || 0,
                                    );
                                    commitLatestUnitPrice(product.variantId);
                                  }}
                                />
                              </td>
                            </tr>
                          )),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="submitSaleContainer">
                  <button
                    onClick={() => {
                      // console.log("Sale Details:", saleDetails);
                      // Add API call or further logic here
                      finalizeStockEntry();
                      // console.log("Sale Details:", saleDetails);
                    }}
                  >
                    Submit Products
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add New Product Modal */}
      <AddNewProductModal
        show={showNewProductModal}
        isClosing={isModalClosing}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleCloseModal={handleCloseModal}
        handleSubmitNewProductBtn={handleNewProductSubmitBtn}
        companyFilteredData={companyFilteredData}
        companyNameSearch={companyNameSearch}
        dosageFormFilteredData={dosageFormFilteredData}
        dosageFormSearch={dosageFormSearch}
        genericFilteredData={genericFilteredData}
        genericNameSearch={genericNameSearch}
        isDuplicate={isDuplicate}
        isFormInvalid={isFormInvalid}
      />
    </div>
  );
};

export default Products;
