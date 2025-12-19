import React, { useEffect } from "react";
import useInvoiceStore from "../store/useInvoiceStore";
import { IoClose } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import "./saleTabs.css";

export default function SaleTabs() {
  const createNewSale = useInvoiceStore((state) => state.createNewSale);
  const setActiveSale = useInvoiceStore((state) => state.setActiveSale);
  const activeSaleId = useInvoiceStore((state) => state.activeSaleId);
  const saleList = useInvoiceStore((state) => state.saleList);
  const removeSale = useInvoiceStore((state) => state.removeSale);

  const handleCreateNewSale = () => {
    const now = new Date();
    const invoiceNumber = `INV-${now.getTime()}`;
    const invoiceDate = now.toLocaleDateString();
    const invoiceTime = now.toLocaleTimeString();

    createNewSale({
      invoiceNumber,
      invoiceDate,
      invoiceTime,
      subTotal_MRP: 0,
      totalDiscount: 0,
      payableAmount: 0,
      customerPhoneNumber: "",
      customerEmail: "",
      customerName: "",
      billingDetails: {
        soldFrom: "Counter-1",
        billIn: "Cash",
        receivedAmount: "",
        returnAmount: "",
      },
      productDetails: [],
      newCustomer: true,
      synced: false,
    });
  };

  useEffect(() => {
    if (saleList.length === 0) {
      handleCreateNewSale();
    }
  }, [saleList]);

  return (
    <div className="sale-tabs-container">
      {saleList.map((sale) => (
        <div
          key={sale.invoiceNumber}
          onClick={() => setActiveSale(sale.invoiceNumber)}
          className={`sale-tab ${
            sale.invoiceNumber === activeSaleId ? "active" : ""
          }`}
        >
          <span className="sale-tab-text">
            {sale.customerName ? sale.customerName : sale.invoiceNumber}
          </span>

          <div
            className="closeIconContainer"
            onClick={(e) => {
              e.stopPropagation();
              removeSale(sale.invoiceNumber);
              // console.log(
              //   `${sale.invoiceNumber} has been removed successfully!`
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
        onClick={handleCreateNewSale}
        className="new-tab-button"
        title="New Sale"
      >
        <IoMdAdd />
      </div>
    </div>
  );
}
