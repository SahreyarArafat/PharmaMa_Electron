import React, { useEffect } from "react";
import useProductStore from "../store/useProductStore";
import { IoClose } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import "./saleTabs.css";

export default function ProductTabs() {
  const addProduct = useProductStore((state) => state.addProduct);
  const setActiveProduct = useProductStore((state) => state.setActiveProduct);
  const activeProductId = useProductStore((state) => state.activeProductId);
  const productList = useProductStore((state) => state.productList);
  const deleteProduct = useProductStore((state) => state.deleteProduct);

  const handleAddProduct = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000); // helps uniqueness
    const uniqueId = `PROD-${timestamp}-${random}`;

    // const newProduct = {
    //   id: uniqueId,
    //   medicinePackImage: "",
    //   brandName: "",
    //   dosageform: "",
    //   genericName: "",
    //   strength: "",
    //   manufacturer: "",
    //   marketer: "",
    //   unitPrice: 0,
    //   stock: 0,
    //   batches: [{ batchNo: "B123", quantity: 100, expiry: "2025-06-01" },
    // { batchNo: "B456", quantity: 130, expiry: "2026-01-15" }],
    // };

    const newProduct = {
      id: uniqueId,
      // billingDetails: {
      //   soldFrom: "Counter-1",
      //   billIn: "Cash",
      //   receivedAmount: "",
      //   returnAmount: "",
      // },
      productDetails: [],
    };

    addProduct(newProduct);
  };

  useEffect(() => {
    if (productList.length === 0) {
      handleAddProduct();
    }
  }, [productList]);

  return (
    <div className="sale-tabs-container">
      {productList.map((product) => (
        <div
          key={product.id}
          onClick={() => setActiveProduct(product.id)}
          className={`sale-tab ${
            product.id === activeProductId ? "active" : ""
          }`}
        >
          <span className="sale-tab-text">
            {product.name ? product.name : product.id}
          </span>

          <div
            className="closeIconContainer"
            onClick={(e) => {
              e.stopPropagation();
              deleteProduct(product.id);
              // console.log(
              //   `${product.id} has been removed successfully!`
              // );
            }}
          >
            {" "}
            <IoClose size={14} className="close-icon" />
          </div>
        </div>
      ))}

      {/* ➕ New Tab Button */}
      <div
        onClick={handleAddProduct}
        className="new-tab-button"
        title="New Product"
      >
        <IoMdAdd />
      </div>
    </div>
  );
}
