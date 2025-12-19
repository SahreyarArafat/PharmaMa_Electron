require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const {
  connectCloudDB,
  getCloudDB,
  connectLocalDB,
  getLocalDB,
} = require("./database");

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON payloads

const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}`;

// Connect to both local and cloud MongoDB before starting the server
connectCloudDB(); // Connect to cloud database
connectLocalDB(); // Connect to local database

// Medicines Routes (Cloud DB)

app.get("/api/medicines", async (req, res) => {
  try {
    const cloud_db = getCloudDB();
    const medicines = await cloud_db.collection("medicines").find().toArray();
    res.json(medicines);
  } catch (error) {
    console.error("Error fetching medicines:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/medicines", async (req, res) => {
  try {
    const cloud_db = getCloudDB();
    const medicines = req.body;

    if (!Array.isArray(medicines)) {
      return res.status(400).json({ message: "Data must be an array" });
    }

    const result = await cloud_db.collection("medicines").insertMany(medicines);
    res.status(201).json({ message: "Medicines added successfully", result });
  } catch (error) {
    console.error("Error posting medicines:", error);
    res.status(500).json({ error: "Failed to add medicines" });
  }
});

// Invoices Routes (Cloud DB)

app.get("/api/invoices/cloud", async (req, res) => {
  try {
    const cloud_db = getCloudDB();
    const invoices = await cloud_db.collection("invoices").find().toArray();
    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/ap i/invoices/cloud", async (req, res) => {
  try {
    const cloud_db = getCloudDB();
    const invoices = req.body;

    if (!Array.isArray(invoices)) {
      return res.status(400).json({ message: "Data must be an array" });
    }

    const result = await cloud_db.collection("invoices").insertMany(invoices);
    res.status(201).json({ message: "Invoices added successfully", result });
  } catch (error) {
    console.error("Error posting invoices:", error);
    res.status(500).json({ error: "Failed to add invoices" });
  }
});

// Invoices Routes (Local DB)

app.get("/api/invoices/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const { synced } = req.query;

    // Build dynamic query
    let query = {};
    if (synced === "false") {
      query.synced = false;
    } else if (synced === "true") {
      query.synced = true;
    }

    const invoices = await local_db
      .collection("invoices")
      .find(query)
      .toArray();

    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/invoices/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const invoices = req.body;

    if (!Array.isArray(invoices)) {
      return res.status(400).json({ message: "Data must be an array" });
    }

    const result = await local_db.collection("invoices").insertMany(invoices);
    res.status(201).json({ message: "Invoices added successfully", result });
  } catch (error) {
    console.error("Error posting invoices:", error);
    res.status(500).json({ error: "Failed to add invoices" });
  }
});

// PATCH /api/invoices/local/update - Mark selected invoices as synced in local DB
app.patch("/api/invoices/local/update", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const { invoiceIds } = req.body;

    if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return res
        .status(400)
        .json({ message: "invoiceIds must be a non-empty array" });
    }

    const objectIds = invoiceIds.map((id) => new ObjectId(id));

    const result = await local_db
      .collection("invoices")
      .updateMany({ _id: { $in: objectIds } }, { $set: { synced: true } });

    res.json({ message: "Invoices updated successfully", result });
  } catch (error) {
    console.error("Error updating local invoices:", error);
    res.status(500).json({ error: "Failed to update invoices" });
  }
});

// Post inventory Products

// Post Products
app.post("/api/inventory_products/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const products = req.body;

    const result = await local_db
      .collection("inventory_products")
      .insertMany(products);
    res.status(201).json({ message: "Products added successfully", result });
  } catch (error) {
    console.error("❌ Insert error:", error);

    // ⚠️ Duplicate KEY error?
    if (error.code === 11000) {
      const duplicatedProduct = error.writeErrors?.[0]?.err?.op; // Full product object
      const duplicatedKey = error.keyValue; // e.g. { brandName: "Napa", strength: "500 mg", dosageForm: "Tablet" }

      return res.status(409).json({
        message: "Duplicate product found",
        duplicatedKey,
        duplicatedProduct,
      });
    }

    res.status(500).json({ error: "Failed to add products" });
  }
});

// Post a single product
app.post("/api/PharmaMa_brand_data/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const product = req.body;

    // if (!product || typeof product !== "object") {
    //   return res.status(400).json({ message: "Invalid product data" });
    // }

    const result = await local_db
      .collection("PharmaMa_brand_data")
      .insertOne(product);
    res.status(201).json({ message: "Product added successfully", result });
  } catch (error) {
    console.error("Error posting product:", error);
    res.status(500).json({ error: "Failed to add product" });
  }
});

// GET all products
app.get("/api/PharmaMa_brand_data/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const products = await local_db
      .collection("PharmaMa_brand_data")
      .find()
      .toArray();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET Medicine Generic Data
app.get("/api/PharmaMa_generic_data/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const PharmaMa_generic_data = await local_db
      .collection("PharmaMa_generic_data")
      .find()
      .toArray();
    res.json(PharmaMa_generic_data);
  } catch (error) {
    console.error("Error fetching Medicine Generic Dta:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Post Medicine Generic Data
app.post("/api/PharmaMa_generic_data/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const NewGenericData = req.body;

    const result = await local_db
      .collection("PharmaMa_generic_data")
      .insertOne(NewGenericData);
    res
      .status(201)
      .json({ message: "New Generic Data added successfully", result });
  } catch (error) {
    console.error("Error posting NewGenericData:", error);
    res.status(500).json({ error: "Failed to add NewGenericData" });
  }
});

// GET Medicine Dosage Forms

app.get("/api/PharmaMa_dosage_form_data/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const PharmaMa_dosage_form_data = await local_db
      .collection("PharmaMa_dosage_form_data")
      .find()
      .toArray();
    res.json(PharmaMa_dosage_form_data);
  } catch (error) {
    console.error("Error fetching Medicine Dosage Forms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Post Medicine Dosage Form
app.post("/api/PharmaMa_dosage_form_data/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const NewDosageForm = req.body;

    const result = await local_db
      .collection("PharmaMa_dosage_form_data")
      .insertOne(NewDosageForm);
    res
      .status(201)
      .json({ message: "New Dosage Form added successfully", result });
  } catch (error) {
    console.error("Error posting New Dosage Form:", error);
    res.status(500).json({ error: "Failed to add NewDosageForm" });
  }
});

// GET Companies Data

app.get("/api/PharmaMa_companies_data/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const PharmaMa_companies_data = await local_db
      .collection("PharmaMa_companies_data")
      .find()
      .toArray();
    res.json(PharmaMa_companies_data);
  } catch (error) {
    console.error("Error fetching Companies Data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Post Company Data
app.post("/api/PharmaMa_companies_data/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const NewCompanyData = req.body;

    const result = await local_db
      .collection("PharmaMa_companies_data")
      .insertOne(NewCompanyData);
    res
      .status(201)
      .json({ message: "NewCompanyData added successfully", result });
  } catch (error) {
    console.error("Error posting NewCompanyData:", error);
    res.status(500).json({ error: "Failed to add NewCompanyData" });
  }
});

// GET all customers
app.get("/api/customers/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const customers = await local_db.collection("customers").find().toArray();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST new customer(s)
app.post("/api/customers/local", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const customers = req.body;

    if (!Array.isArray(customers)) {
      return res.status(400).json({ message: "Data must be an array" });
    }

    const result = await local_db.collection("customers").insertMany(customers);
    res.status(201).json({ message: "Customers added successfully", result });
  } catch (error) {
    console.error("Error adding customers:", error);
    res.status(500).json({ error: "Failed to add customers" });
  }
});

// Optional: GET a customer by ID
// server.js
app.get("/api/customers/local/phone/:phone", async (req, res) => {
  try {
    const local_db = getLocalDB();
    const phone = req.params.phone;

    const customer = await local_db
      .collection("customers")
      .findOne({ customerPhoneNumber: phone });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer by phone:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at ${BASE_URL}`);
});
