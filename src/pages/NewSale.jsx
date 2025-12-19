import React, { useState, useMemo, useEffect, useRef } from "react";
import { FixedSizeList as List } from "react-window";
// Medicine Data
import brandMedicineData from "../assets/Medicine Data/Medicine Brand Data/allHarbal&AllopathicBrandName.json";
import genericMedicineData from "../assets/Medicine Data/Medicine Generic Data/allHerbal&AllopathicGenericData.json";
// Medicine Icon Images
import dosageIconsMap from "../assets/Medicine Data/dosageIcons.js";
import defultDosageIcon from "../assets/Medicine Data/Dosage Icon/medicine.png";
import defultHerbalMedicineIcon from "../assets/Medicine Data/Dosage Icon/herbal-meds-2.png";
// Icons
import { IoSearch, IoClose } from "react-icons/io5";
// Server Api Functions
import {
  getLocalInvoices,
  postLocalInvoices,
  updateLocalInvoicesAsSynced,
} from "../services/localInvoiceService.js";

import {
  getAllCustomers,
  getCustomerByPhone,
  postCustomers,
} from "../services/localCustomerService.js";
// Zustand InvoiceStore function
import useInvoiceStore from "../store/useInvoiceStore.js";
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

//////////////////////////////////////////

// Internal Components
import Topbar from "../components/Topbar";
import Navbar from "../components/Navbar";
import SaleTabs from "../components/SaleTabs"; // Adjust path as needed
// Styles
import "../styles/newSale.css";

export default function NewSale() {
  // SearchBar states
  const [medicineName, setMedicineName] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchWorker, setSearchWorker] = useState(null); // Store worker instance
  const [workerInitialized, setWorkerInitialized] = useState(false);
  const [isListVisible, setIsListVisible] = useState(false); // Track list visibility
  const containerRef = useRef(null); // Reference to the container
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [wasAutoFilled, setWasAutoFilled] = useState(false);
  // // Customer Details states
  // const [customerDetails, setCustomerDetails] = useState({
  //   customerPhoneNumber: "",
  //   customerName: "",
  //   customerEmail: "",
  // });

  // // Cart chart states
  // const [cartedProducts, setCartedProducts] = useState([]);

  // // Complete Sale details
  // const [saleDetails, setSaleDetails] = useState({
  //   invoiceNumber: "",
  //   invoiceDate: "",
  //   invoiceTime: "",
  //   subTotal_MRP: 0,
  //   totalDiscount: 0,
  //   payableAmount: 0,
  //   customerPhoneNumber: "",
  //   customerName: "",
  //   customerEmail: "",
  //   billingDetails: {
  //     soldFrom: "Counter-1",
  //     billIn: "Cash",
  //     receivedAmount: "",
  //     returnAmount: "",
  //   },
  //   productDetails: [], // Add this property to store product details
  //   synced: false,
  // });

  // Zustand InvoiceStore states

  const createNewSale = useInvoiceStore((state) => state.createNewSale);
  const activeSaleId = useInvoiceStore((state) => state.activeSaleId);
  const saleList = useInvoiceStore((state) => state.saleList);
  const updateSale = useInvoiceStore((state) => state.updateSale);
  const removeSale = useInvoiceStore((state) => state.removeSale);

  const activeSale = saleList.find(
    (sale) => sale.invoiceNumber === activeSaleId
  );

  // SearchBar functionalities

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
    // console.log("Initializing Worker...");

    if (!processedData || processedData.length === 0) {
      console.error("Processed data is missing or empty.");
      return;
    }

    const worker = new Worker(
      new URL("../workers/searchWorker.js", import.meta.url)
    );
    setSearchWorker(worker);

    // console.log("Worker Created");

    // console.log("Processed Data:", processedData);
    // console.log("Fuse Options:", fuseOptions);

    if (!processedData || processedData.length === 0 || !fuseOptions) {
      console.error(
        "Processed data or options are missing. Worker cannot initialize."
      );
      return;
    }

    worker.postMessage({
      action: "initialize",
      data: processedData,
      options: fuseOptions,
    });

    // console.log(worker);

    worker.onmessage = (e) => {
      // console.log("Worker Message Received:", e.data);
      if (e.data === "initialized") {
        // console.log("Worker Successfully Initialized!");
        setWorkerInitialized(true);
      }
    };

    return () => {
      // console.log("Terminating Worker...");
      worker.terminate();
    };
  }, [fuseOptions, processedData]);

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
          {!isProductCarted(item) ? (
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

  // Cart related functionalities---------------------------

  const handleAddToCart = (product) => {
    const defultUnitPrice = product.unitPrice;
    const clean = defultUnitPrice
      .replace(/\n/g, " ")
      .replace(/৳/g, "")
      .replace(/,/g, ""); // Remove commas from numbers
    const match = clean.match(/(\d+\.\d{2})/);
    const cleanDefaultUnitPrice = match ? parseFloat(match[1]) : 0;
    // console.log(match ? parseFloat(match[1]) : null);

    const updatedProducts = [
      ...(activeSale.productDetails || []),
      {
        ...product,
        quantity: 1,
        newUnitPrice: cleanDefaultUnitPrice,
        discount: 10,
      },
    ];

    updateSale(activeSaleId, {
      productDetails: updatedProducts,
    });
  };

  const isProductCarted = (product) => {
    const productKey = generateUniqueKey(product);
    return (activeSale.productDetails || []).some(
      (cartedProduct) => generateUniqueKey(cartedProduct) === productKey
    );
  };

  const removeCartedProduct = (product) => {
    const productKey = generateUniqueKey(product);
    const updatedProducts = (activeSale.productDetails || []).filter(
      (cartedProduct) => generateUniqueKey(cartedProduct) !== productKey
    );

    updateSale(activeSaleId, {
      productDetails: updatedProducts,
    });
  };

  const handleProductQuantity = (product, value, index) => {
    const productKey = generateUniqueKey(product, index);
    const updatedProducts = (activeSale.productDetails || []).map(
      (cartedProduct, idx) =>
        generateUniqueKey(cartedProduct, idx) === productKey
          ? { ...cartedProduct, quantity: value === "" ? "" : parseInt(value) }
          : cartedProduct
    );

    updateSale(activeSaleId, {
      productDetails: updatedProducts,
    });
  };

  const handleProductUnitPrice = (product, value, index) => {
    const productKey = generateUniqueKey(product, index);
    const updatedProducts = (activeSale.productDetails || []).map(
      (cartedProduct, idx) =>
        generateUniqueKey(cartedProduct, idx) === productKey
          ? {
              ...cartedProduct,
              newUnitPrice: value === "" ? "" : parseFloat(value),
            }
          : cartedProduct
    );

    updateSale(activeSaleId, {
      productDetails: updatedProducts,
    });
  };

  const handleProductDiscount = (product, value, index) => {
    const productKey = generateUniqueKey(product, index);

    const updatedProducts = (activeSale.productDetails || []).map(
      (cartedProduct, idx) =>
        generateUniqueKey(cartedProduct, idx) === productKey
          ? { ...cartedProduct, discount: parseFloat(value) }
          : cartedProduct
    );

    updateSale(activeSaleId, {
      productDetails: updatedProducts,
    });
  };

  const totalMRP = () => {
    const total = activeSale.productDetails.reduce((acc, product) => {
      const unitPrice = parseFloat(product.newUnitPrice) || 0;
      const quantity = parseInt(product.quantity) || 0;
      return acc + unitPrice * quantity;
    }, 0);

    return total.toFixed(2);
  };

  const totalDiscountedPrice = () => {
    const total = activeSale.productDetails.reduce((acc, product) => {
      const unitPrice = parseFloat(product.newUnitPrice) || 0;
      const quantity = parseInt(product.quantity) || 0;
      const discount = parseFloat(product.discount) || 0;

      const discountedPrice = quantity * unitPrice * (1 - discount / 100);
      return acc + discountedPrice;
    }, 0);

    return total.toFixed(2);
  };

  const generateUniqueKey = (item, index) => {
    return ` ${index}-${item.serialNumber}-${item.brandName}-${item.dosageform}-${item.strength}`;
  };

  // ----------------Customer Info Section

  useEffect(() => {
    if (!activeSale || !activeSale.productDetails) return;

    const subTotal = totalMRP(activeSale.productDetails);
    const discounted = totalDiscountedPrice(activeSale.productDetails);

    updateSale(activeSaleId, {
      subTotal_MRP: subTotal,
      totalDiscount: (subTotal - discounted).toFixed(2),
      payableAmount: discounted,
    });
  }, [activeSale?.productDetails?.length]);

  // Server Api Functions

  const getInvoice = async () => {
    const invoices = await getLocalInvoices();
    console.log(invoices);
  };

  const postInvoice = async () => {
    const { activeSaleId, saleList } = useInvoiceStore.getState();
    const activeSale = saleList.find(
      (sale) => sale.invoiceNumber === activeSaleId
    );

    if (!activeSale) {
      console.error("No active sale to post.");
      return;
    }
    try {
      const result = await postLocalInvoices([activeSale]);
      console.log("✅ Invoice posted:", result);
    } catch (error) {
      console.error("❌ Failed to post invoice:", error);
    }
  };

  const getCustomersHandler = async () => {
    try {
      const customers = await getAllCustomers();
      console.log("Loaded customers", customers);
    } catch (error) {
      console.error("Failed to load customers:", error);
    }
  };

  const postCustomersHandler = async () => {
    const { activeSaleId, saleList, updateSale } = useInvoiceStore.getState();
    const activeSale = saleList.find(
      (sale) => sale.invoiceNumber === activeSaleId
    );

    if (!activeSale) {
      console.error("❌ No active sale found.");
      return;
    }

    try {
      if (!isExistingCustomer) {
        const { customerName, customerEmail, customerPhoneNumber } = activeSale;

        if (customerName.trim() !== "" && customerEmail.trim() !== "") {
          const newCustomer = {
            customerPhoneNumber,
            customerName,
            customerEmail,
          };

          const result = await postCustomers([newCustomer]);
          setIsExistingCustomer(true);
          console.log("✅ New Customer Added!", result);
        } else {
          console.log("⚠️ Fill name and email before adding new customer.");
        }
      } else {
        console.log("⚠️ Existing customer detected. No need to add.");
      }
    } catch (error) {
      console.error("❌ Failed to add new customer:", error);
    }
  };

  useEffect(() => {
    const { activeSaleId, saleList, updateSale } = useInvoiceStore.getState();
    const activeSale = saleList.find(
      (sale) => sale.invoiceNumber === activeSaleId
    );
    if (!activeSale) return;

    const phone = activeSale.customerPhoneNumber;

    const fetchCustomer = async () => {
      if (phone?.length === 11) {
        try {
          const existingCustomer = await getCustomerByPhone(phone);

          if (existingCustomer) {
            console.log("Existing customer found:", existingCustomer);
            setIsExistingCustomer(true);

            updateSale(activeSaleId, {
              customerName: existingCustomer.customerName,
              customerEmail: existingCustomer.customerEmail,
              newCustomer: false,
            });

            setWasAutoFilled(true);
          } else {
            console.log("🆕 New customer detected.");
            console.log(activeSale.customerName);

            setIsExistingCustomer(false);

            if (!activeSale.newCustomer) {
              updateSale(activeSaleId, {
                customerName: "",
                customerEmail: "",
                newCustomer: true,
              });
              setWasAutoFilled(false);
            }
          }
        } catch (err) {
          console.error("❌ Error handling customer fetch/add:", err);
        }
      }
    };

    fetchCustomer();
  }, [
    useInvoiceStore(
      (state) =>
        state.saleList.find((sale) => sale.invoiceNumber === state.activeSaleId)
          ?.customerPhoneNumber
    ),
  ]);

  const handleCompleteSaleBtn = async () => {
    if (!activeSaleId) {
      console.warn("⚠️ No active sale to complete.");
      return;
    }

    try {
      // 1. Add customer if new
      if (!isExistingCustomer) {
        await postCustomersHandler();
      }

      // 2. Post the invoice
      await postInvoice();

      // 3. Remove the completed sale
      removeSale(activeSaleId);

      console.log("✅ Sale completed and cleared from tab.");
    } catch (error) {
      console.error("❌ Failed to complete sale:", error);
    }
  };

  // --------------------Billing Details

  const handleBillingDetailChange = (field, value) => {
    const currentBillingDetails = activeSale.billingDetails || {};

    const updatedBillingDetails = {
      ...currentBillingDetails,
      [field]: value,
    };

    if (field === "receivedAmount") {
      const payable = totalDiscountedPrice();
      const received = parseFloat(value) || 0;
      const returnAmount = received - payable >= 0 ? received - payable : 0;
      updatedBillingDetails.returnAmount = returnAmount.toFixed(2);
    }

    updateSale(activeSaleId, {
      billingDetails: updatedBillingDetails,
    });
  };

  return (
    <div>
      <Topbar />

      <div className="navbarAndContentMaincontainer">
        <Navbar />

        <div className="contentContainer">
          <div className="newSaleContainer">
            <SaleTabs />
            <h1 className="pageHeader">New Sale</h1>
            {/* ////////////////////////////////////////// */}
            <div ref={containerRef} className="medicineSearchContainer">
              {/* <p className="sectionHeader">Search Products</p> */}
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
                <button
                  className="searchIconContainer"
                  onClick={() => {
                    // For Dev purpose to clear the Zustand States
                    useInvoiceStore.persist.clearStorage();
                    useInvoiceStore.setState({}, true);
                  }}
                >
                  <IoSearch className="searchIcon" />
                </button>
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
            {/* ///////////////////////////////////////// */}
            {/* <Searchbar onCartUpdate={handleCartUpdate} /> */}
            {/* Cart Section */}
            {/* {cartedProducts.length > 0 && ( */}
            {/* {(saleDetails.productDetails?.length ?? 0) > 0 && ( */}
            {(activeSale?.productDetails?.length ?? 0) > 0 && (
              <div className="">
                <div className="cartedProductContainer">
                  <p className="sectionHeader">Carted Products</p>
                  <div className="cartedProductBG">
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Discount</th>
                          <th>Total</th>
                          {/* <th>Action</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {/* {saleDetails.productDetails.map((product, index) => ( */}
                        {activeSale.productDetails.map((product, index) => (
                          <tr key={generateUniqueKey(product, index)}>
                            <td className="productInfo">
                              <span className="dosageform">
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
                              <p className="manufacturer">
                                {product.manufacturer}
                              </p>
                            </td>

                            {/* Quantity Input */}
                            <td className="quantityContainer">
                              <input
                                className="quantityInput"
                                type="number"
                                name="Quantity"
                                value={product.quantity}
                                onChange={(e) =>
                                  handleProductQuantity(
                                    product,
                                    e.target.value,
                                    index
                                  )
                                }
                                onBlur={(e) =>
                                  handleProductQuantity(
                                    product,
                                    e.target.value || "1",
                                    index
                                  )
                                }
                              />
                            </td>

                            {/* Unit Price Input */}
                            <td className="unitPriceContainer">
                              <input
                                className="unitPriceInput"
                                type="number"
                                name="Unit Price"
                                value={product.newUnitPrice}
                                onChange={(e) =>
                                  handleProductUnitPrice(
                                    product,
                                    e.target.value,
                                    index
                                  )
                                }
                                // onBlur={(e) =>
                                //   handleProductUnitPrice(
                                //     product,
                                //     e.target.value || product.unitPrice,
                                //     index
                                //   )
                                // }
                              />
                            </td>

                            {/* Discount Dropdown */}
                            <td className="discountContainer">
                              <select
                                className="discountSelect"
                                value={product.discount}
                                onChange={(e) =>
                                  handleProductDiscount(
                                    product,
                                    e.target.value,
                                    index
                                  )
                                }
                              >
                                <option value="0">0%</option>
                                <option value="2">2%</option>
                                <option value="3">3%</option>
                                <option value="4">4%</option>
                                <option value="5">5%</option>
                                <option value="6">6%</option>
                                <option value="7">7%</option>
                                <option value="8">8%</option>
                                <option value="9">9%</option>
                                <option value="10">10%</option>
                                <option value="11">11%</option>
                                <option value="12">12%</option>
                                <option value="13">13%</option>
                                <option value="14">14%</option>
                                <option value="15">15%</option>
                                <option value="20">20%</option>
                                <option value="30">30%</option>
                                <option value="50">50%</option>
                                <option value="100">100%</option>
                              </select>
                            </td>

                            {/* Total Calculation */}
                            <td className="totalPrice_RemoveContainer">
                              {/* Remove Button */}
                              <button
                                className="removeBtn"
                                onClick={() => removeCartedProduct(product)}
                              >
                                <IoClose className="removeIcon" />
                              </button>
                              <span className="totalPrice">
                                {" "}
                                ৳
                                {(
                                  product.quantity *
                                    product.newUnitPrice *
                                    (1 - product.discount / 100) || 0
                                ).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/*  */}

                <div className="customer_payment_billing_container">
                  <div className="customerInfoSection">
                    <p className="sectionHeader">Customer Details</p>
                    <div className="customerInfoBG">
                      <div className="customerNumberContainer">
                        <label htmlFor="Customer Number">Phone Number</label>
                        <input
                          type="number"
                          value={activeSale?.customerPhoneNumber || ""}
                          onChange={(e) =>
                            updateSale(activeSaleId, {
                              customerPhoneNumber: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="customerNameContainer">
                        <label htmlFor="Customer Name">Customer Name</label>
                        <input
                          type="text"
                          value={activeSale?.customerName || ""}
                          onChange={(e) =>
                            !isExistingCustomer &&
                            updateSale(activeSaleId, {
                              customerName: e.target.value,
                            })
                          }
                          readOnly={isExistingCustomer}
                          style={{
                            backgroundColor: isExistingCustomer
                              ? "#f5f5f5"
                              : "white",
                            cursor: isExistingCustomer ? "not-allowed" : "text",
                          }}
                        />
                      </div>

                      <div className="customerNameContainer">
                        <label htmlFor="Customer Email">Customer Email</label>
                        <input
                          type="email"
                          value={activeSale?.customerEmail || ""}
                          onChange={(e) =>
                            !isExistingCustomer &&
                            updateSale(activeSaleId, {
                              customerEmail: e.target.value,
                            })
                          }
                          readOnly={isExistingCustomer}
                          style={{
                            backgroundColor: isExistingCustomer
                              ? "#f5f5f5"
                              : "white",
                            cursor: isExistingCustomer ? "not-allowed" : "text",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/*  */}

                  <div className="payablePriceDetailContainer">
                    <p className="sectionHeader">Payment Details</p>
                    <div className="payablePriceDetailBG">
                      <div className="paymentAmount">
                        <div className="amountDetail">
                          <span> Subtotal (MRP):</span>
                        </div>
                        <div className="amount">
                          <span>৳{totalMRP()}</span>
                        </div>
                      </div>

                      <div className="paymentAmount">
                        <div className="amountDetail">
                          <span>Total discount:</span>
                        </div>
                        <div className="amount">
                          <span>
                            ৳
                            {(totalMRP() - totalDiscountedPrice() || 0).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="paymentAmount">
                        <div className="amountDetail">
                          <span>Due Amount:</span>
                        </div>
                        <div className="amount">
                          <span>
                            ৳
                            {(totalMRP() - totalDiscountedPrice() || 0).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="paymentAmount">
                        <div className="amountDetail">
                          <span>Paid Amount:</span>
                        </div>
                        <div className="amount">
                          <span>
                            ৳
                            {(totalMRP() - totalDiscountedPrice() || 0).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="paymentAmount">
                        <div className="amountDetail">
                          <span>Return Amount:</span>
                        </div>
                        <div className="amount">
                          <span>
                            ৳
                            {(totalMRP() - totalDiscountedPrice() || 0).toFixed(
                              2
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="paymentAmount totalPayableAmount">
                        <div className="amountDetail">
                          <span>Total Payable Amount:</span>
                        </div>
                        <div className="amount">
                          <span>৳{totalDiscountedPrice()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/*  */}

                  <div className="billingInfoSection">
                    <p className="sectionHeader">Billing Details</p>
                    <div className="billingInfoBG">
                      <div className="counterSelectContainer">
                        <label htmlFor="Sold from">Sold from</label>
                        <select
                          className="counterSelect"
                          value={
                            activeSale?.billingDetails?.soldFrom || "Counter-1"
                          }
                          onChange={(e) =>
                            handleBillingDetailChange(
                              "soldFrom",
                              e.target.value
                            )
                          }
                        >
                          <option value="Counter-1">Counter-1</option>
                          <option value="Counter-2">Counter-2</option>
                          <option value="Counter-3">Counter-3</option>
                          <option value="Counter-4">Counter-4</option>
                        </select>
                      </div>

                      <div className="billSelectContainer">
                        <label htmlFor="Bill by">Bill in</label>
                        <select
                          className="billMathodSelect"
                          value={activeSale?.billingDetails?.billIn || "Cash"}
                          onChange={(e) =>
                            handleBillingDetailChange("billIn", e.target.value)
                          }
                        >
                          <option value="Cash">Cash</option>
                          <option value="Bkash">Bkash</option>
                          <option value="Nagad">Nagad</option>
                          <option value="Card">Card</option>
                        </select>
                      </div>

                      <div className="cashDetailContainer">
                        <div className="receivedCashAmountContainer">
                          <label htmlFor="received amount">
                            Received Amount
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={
                              activeSale?.billingDetails?.receivedAmount || ""
                            }
                            onChange={(e) =>
                              handleBillingDetailChange(
                                "receivedAmount",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="returnCashAmountContainer">
                          <label htmlFor="return amount">Return Amount</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={
                              activeSale?.billingDetails?.returnAmount || ""
                            }
                            onChange={(e) =>
                              handleBillingDetailChange(
                                "returnAmount",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Submit Btn*/}

                <div className="submitSaleContainer">
                  <button
                    onClick={() => {
                      // console.log("Sale Details:", saleDetails);
                      // Add API call or further logic here
                      handleCompleteSaleBtn();
                      // console.log("Sale Details:", saleDetails);
                    }}
                  >
                    Complete Sale
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
