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
  // Cart chart states
  const [cartedProducts, setCartedProducts] = useState([]);
  // Complete Sale details
  const [saleDetails, setSaleDetails] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    invoiceTime: "",
    subTotal_MRP: 0,
    totalDiscount: 0,
    payableAmount: 0,
    customerPhoneNumber: "",
    customerEmail: "",
    customerName: "",
    billingDetails: {
      soldFrom: "Counter-1",
      billIn: "Cash",
      servedBy: "",
    },
    paymentDetails: {
      cash: 0,
      bank: 0,
      due: 0,
    },
    productDetails: [], // Add this property to store product details
    synced: false,
  });
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);

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
    const updatedProducts = [
      ...cartedProducts,
      { ...product, quantity: 1, newUnitPrice: 0, discount: 10 },
    ];
    setCartedProducts(updatedProducts);
  };

  const isProductCarted = (product) => {
    const productKey = generateUniqueKey(product);
    return cartedProducts.some(
      (cartedProduct) => generateUniqueKey(cartedProduct) === productKey
    );
  };

  const removeCartedProduct = (product) => {
    const productKey = generateUniqueKey(product);
    const newCartedProducts = cartedProducts.filter(
      (cartedProduct) => generateUniqueKey(cartedProduct) !== productKey
    );
    setCartedProducts(newCartedProducts);
  };

  const handleProductQuantity = (product, value, index) => {
    const productKey = generateUniqueKey(product, index);
    const updatedProducts = cartedProducts.map((cartedProduct, idx) =>
      generateUniqueKey(cartedProduct, idx) === productKey
        ? { ...cartedProduct, quantity: value === "" ? "" : parseInt(value) }
        : cartedProduct
    );

    setCartedProducts(updatedProducts);
  };

  const handleProductUnitPrice = (product, value, index) => {
    const productKey = generateUniqueKey(product, index);
    const updatedProducts = cartedProducts.map((cartedProduct, idx) =>
      generateUniqueKey(cartedProduct, idx) === productKey
        ? { ...cartedProduct, newUnitPrice: parseFloat(value) }
        : cartedProduct
    );

    setCartedProducts(updatedProducts);
  };

  const handleProductDiscount = (product, value, index) => {
    const productKey = generateUniqueKey(product, index);

    const updatedProducts = cartedProducts.map((cartedProduct, idx) =>
      generateUniqueKey(cartedProduct, idx) === productKey
        ? { ...cartedProduct, discount: parseFloat(value) }
        : cartedProduct
    );

    setCartedProducts(updatedProducts);
  };

  const totalPrice = () => {
    return cartedProducts
      .reduce((total, product) => {
        const totalPrice = product.quantity * product.newUnitPrice;
        return total + totalPrice || 0;
      }, 0)
      .toFixed(2);
  };

  const calculateGrandTotal = () => {
    return cartedProducts
      .reduce((total, product) => {
        const discountedPrice =
          product.quantity *
          product.newUnitPrice *
          (1 - product.discount / 100);
        return total + discountedPrice || 0;
      }, 0)
      .toFixed(2);
  };

  const generateUniqueKey = (item, index) => {
    return ` ${index}-${item.serialNumber}-${item.brandName}-${item.dosageform}-${item.strength}`;
  };

  // ----------------Customer Info Section

  useEffect(() => {
    setSaleDetails((prev) => ({
      ...prev,
      productDetails: cartedProducts.map((product) => ({
        brandName: product.brandName,
        genericName: product.genericName,
        dosageform: product.dosageform,
        strength: product.strength,
        quantity: product.quantity,
        unitPrice: product.newUnitPrice,
        discount: product.discount,
        totalPrice: (
          product.quantity *
          product.newUnitPrice *
          (1 - product.discount / 100)
        ).toFixed(2),
      })),
      subTotal_MRP: totalPrice(),
      totalDiscount: (totalPrice() - calculateGrandTotal()).toFixed(2),
      payableAmount: calculateGrandTotal(),
    }));
  }, [cartedProducts]);

  useEffect(() => {
    const now = new Date();
    const invoiceNumber = `INV-${now.getTime()}`; // Unique invoice number
    const invoiceDate = now.toLocaleDateString();
    const invoiceTime = now.toLocaleTimeString();

    setSaleDetails((prev) => ({
      ...prev,
      invoiceNumber,
      invoiceDate,
      invoiceTime,
    }));
  }, []);

  // Server Api Functions

  const getInvoice = async () => {
    const invoices = await getLocalInvoices();
    console.log(invoices);
  };

  const postInvoice = async () => {
    const result = await postLocalInvoices([saleDetails]);
    console.log(result);
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
    try {
      const newCustomer = {
        customerPhoneNumber: saleDetails.customerPhoneNumber,
        customerName: saleDetails.customerName,
        customerEmail: saleDetails.customerEmail,
      };

      if (saleDetails.customerName !== "" && saleDetails.customerEmail !== "") {
        const result = await postCustomers([newCustomer]);

        console.log("New Customer Added!", result);
      } else {
        console.log("Fill the customer name and email.");
      }
    } catch (error) {
      console.error("Failed to Add new customer:", error);
    }
  };

  useEffect(() => {
    const fetchCustomer = async () => {
      const phone = saleDetails.customerPhoneNumber;
      if (phone.length === 11) {
        try {
          const existingCustomer = await getCustomerByPhone(phone);

          if (existingCustomer) {
            console.log("Existing customer found:", existingCustomer);
            setIsExistingCustomer(true);
            setSaleDetails((prev) => ({
              ...prev,
              customerName: existingCustomer.customerName,
              customerEmail: existingCustomer.customerEmail,
            }));
          } else {
            console.log("New customer.");
            postCustomersHandler();
            setIsExistingCustomer(false);
          }
        } catch (err) {
          console.error("Something went wrong:", err);
        }
      }
    };

    fetchCustomer();
  }, [saleDetails.customerPhoneNumber]);

  // --------------------Billing Details

  const handleCounterSelection = (value) => {
    setSaleDetails((prev) => ({
      ...prev,
      billingDetails: {
        soldFrom: value,
      },
    }));
  };

  return (
    <div>
      <Topbar />
      <div className="navbarAndContentMaincontainer">
        <Navbar />

        <div className="contentContainer">
          <div className="newSaleContainer">
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
            {/* ///////////////////////////////////////// */}
            {/* <Searchbar onCartUpdate={handleCartUpdate} /> */}
            {/* Cart Section */}
            {cartedProducts.length > 0 && (
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
                        {cartedProducts.map((product, index) => (
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
                                onBlur={(e) =>
                                  handleProductUnitPrice(
                                    product,
                                    e.target.value || product.unitPrice,
                                    index
                                  )
                                }
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
                          onChange={(e) =>
                            setSaleDetails((prev) => ({
                              ...prev,
                              customerPhoneNumber: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="customerNameContainer">
                        <label htmlFor="Customer Name">Customer Name</label>
                        <input
                          type="text"
                          value={saleDetails.customerName || ""}
                          onChange={(e) =>
                            !isExistingCustomer &&
                            setSaleDetails((prev) => ({
                              ...prev,
                              customerName: e.target.value,
                            }))
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
                          value={saleDetails.customerEmail || ""}
                          onChange={(e) =>
                            !isExistingCustomer &&
                            setSaleDetails((prev) => ({
                              ...prev,
                              customerEmail: e.target.value,
                            }))
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
                          <span>৳{totalPrice()}</span>
                        </div>
                      </div>

                      <div className="paymentAmount">
                        <div className="amountDetail">
                          <span>Total discount:</span>
                        </div>
                        <div className="amount">
                          <span>
                            ৳
                            {(
                              totalPrice() - calculateGrandTotal() || 0
                            ).toFixed(2)}
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
                            {(
                              totalPrice() - calculateGrandTotal() || 0
                            ).toFixed(2)}
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
                            {(
                              totalPrice() - calculateGrandTotal() || 0
                            ).toFixed(2)}
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
                            {(
                              totalPrice() - calculateGrandTotal() || 0
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="paymentAmount totalPayableAmount">
                        <div className="amountDetail">
                          <span>Total Payable Amount:</span>
                        </div>
                        <div className="amount">
                          <span>৳{calculateGrandTotal()}</span>
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
                          value={saleDetails.billingDetails.soldFrom}
                          onChange={(e) => {
                            handleCounterSelection(e.target.value);
                          }}
                        >
                          <option value="Counter-1">Counter-1</option>
                          <option value="Counter-2">Counter-2</option>
                          <option value="Counter-3">Counter-3</option>
                          <option value="Counter-4">Counter-4</option>
                        </select>
                      </div>

                      <div className="billSelectContainer">
                        <label htmlFor="Bill by">Bill in</label>
                        <select className="billMathodSelect">
                          <option value="Cash">Cash</option>
                          <option value="Bkash">Bkash</option>
                          <option value="Nagad">Nagad</option>
                          <option value="Card">Card</option>
                        </select>
                      </div>

                      <div className="serveDetailContainer">
                        <label htmlFor="Served By">Served By</label>
                        <input type="text" />
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
                      postInvoice();
                    }}
                  >
                    Complete Sale
                  </button>
                </div>
              </div>
            )}
            {/* <div>
              <button onClick={postInvoice}>Post Invoices</button>
            </div>
            <div>
              <button onClick={postCustomersHandler}>Post Customer</button>
            </div>
            <div>
              <button onClick={getInvoice}>Get Invoices</button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
