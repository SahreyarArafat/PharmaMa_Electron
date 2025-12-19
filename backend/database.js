require("dotenv").config(); // Load environment variables
const { MongoClient } = require("mongodb");

// Cloud MongoDB URI
const cloud_uri = process.env.CLOUD_MONGO_URI;
// Local MongoDB URI
const local_uri = process.env.LOCAL_MONGO_URI;

if (!cloud_uri || !local_uri) {
  throw new Error("❌ MongoDB URIs are not defined in .env file!");
}

const cloud_client = new MongoClient(cloud_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const local_client = new MongoClient(local_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let cloud_db, local_db;

const connectCloudDB = async () => {
  try {
    await cloud_client.connect();
    cloud_db = cloud_client.db("pharmama"); // Your cloud database
    console.log("✅ Cloud MongoDB Connected!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error (Cloud):", error);
  }
};

const connectLocalDB = async () => {
  try {
    await local_client.connect();
    local_db = local_client.db("pharmama"); // Your local database

    // Existing index for invoices sync
    await local_db.collection("invoices").createIndex({ synced: 1 });

    // NEW: Unique index for inventory_products
    await local_db.collection("inventory_products").createIndex(
      {
        brandAndStrength: 1,
        dosageform: 1,
      },
      { unique: true }
    );

    console.log("✅ Local MongoDB Connected & Indexes Ensured!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error (Local):", error);
  }
};

// const connectLocalDB = async () => {
//   try {
//     await local_client.connect();
//     local_db = local_client.db("pharmama"); // Your local database
//     await local_db.collection("invoices").createIndex({ synced: 1 });
//     console.log("✅ Local MongoDB Connected!");
//     // return local_db;
//   } catch (error) {
//     console.error("❌ MongoDB Connection Error (Local):", error);
//   }
// };

// Get the Cloud DB instance
const getCloudDB = () => {
  if (!cloud_db) throw new Error("❌ Cloud Database not connected!");
  return cloud_db;
};

// Get the Local DB instance
const getLocalDB = () => {
  if (!local_db) throw new Error("❌ Local Database not connected!");
  return local_db;
};

module.exports = { connectCloudDB, connectLocalDB, getCloudDB, getLocalDB };
