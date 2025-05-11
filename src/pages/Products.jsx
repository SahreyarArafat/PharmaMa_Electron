import React, { useState } from "react";

import Topbar from "../components/Topbar";
import Navbar from "../components/Navbar";

import "../styles/product.css";

const Products = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [totalAmount, setTotalAmount] = useState(0);

  // Mock data for customers and products
  const customers = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
  ];

  const products = [
    { id: 1, name: "Paracetamol", price: 20, stock: 100 },
    { id: 2, name: "Ibuprofen", price: 30, stock: 50 },
  ];

  // Functions to handle adding products to cart
  const handleAddToCart = (product, quantity) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    calculateTotal();
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
    calculateTotal();
  };

  const calculateTotal = () => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalAmount(total);
  };

  // Functions to handle customer selection
  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <div>
      <Topbar />
      <div className="navbarAndContentMaincontainer">
        <Navbar />
        <div className="contentContainer">
          {/* <h1>Products Management</h1>
          <p>Track and manage sales.</p> */}
          {/* Add forms and tables to handle sales */}
          <div className="newSaleContainer">
            <h1>New Sale</h1>

            {/* Customer Section */}
            <div className="customerSection">
              <h2>Customer Information</h2>
              <input
                type="text"
                placeholder="Search customer..."
                value={searchCustomer}
                // onChange={(e) => setSearchCustomer(e.target.value)}
              />
              <div className="customerList">
                {customers
                  .filter((customer) =>
                    customer.name
                      .toLowerCase()
                      .includes(searchCustomer.toLowerCase())
                  )
                  .map((customer) => (
                    <div
                      key={customer.id}
                      className={`customerItem ${
                        selectedCustomer?.id === customer.id ? "selected" : ""
                      }`}
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      {customer.name}
                    </div>
                  ))}
              </div>
            </div>

            {/* Product Section */}
            <div className="productSection">
              <h2>Product Search</h2>
              <input
                type="text"
                placeholder="Search product..."
                value={productSearch}
                // onChange={(e) => setProductSearch(e.target.value)}
              />
              <div className="productList">
                {products
                  .filter((product) =>
                    product.name
                      .toLowerCase()
                      .includes(productSearch.toLowerCase())
                  )
                  .map((product) => (
                    <div key={product.id} className="productItem">
                      <span>{product.name}</span>
                      <span>₹{product.price}</span>
                      <span>Stock: {product.stock}</span>
                      <button
                        onClick={
                          () => handleAddToCart(product, 1) // Default quantity is 1
                        }
                        disabled={product.stock === 0}
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Cart Section */}
            <div className="cartSection">
              <h2>Cart</h2>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td>₹{item.quantity * item.price}</td>
                      <td>
                        <button onClick={() => handleRemoveFromCart(item.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3>Total: ₹{totalAmount}</h3>
            </div>

            {/* Payment Section */}
            <div className="paymentSection">
              <h2>Payment</h2>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
              <button onClick={() => alert("Sale Completed!")}>
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
