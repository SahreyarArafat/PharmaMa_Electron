// require("dotenv").config(); // This loads the .env file
// const { MongoClient } = require("mongodb");

// const local_uri = process.env.LOCAL_MONGO_URI;
// if (!local_uri) {
//   throw new Error("❌ LOCAL_MONGO_URI is not defined in .env file!");
// }
// const client = new MongoClient(local_uri);
// let db;

// const connectDB = async () => {
//   try {
//     await client.connect();
//     db = client.db("pharmama");
//     console.log("✅ Local MongoDB Connected!");
//   } catch (error) {
//     console.error("❌ MongoDB Connection Error:", error);
//     process.exit(1);
//   }
// };

// const getDB = () => {
//   if (!db) throw new Error("❌ Database not connected!");
//   return db;
// };

// module.exports = { connectDB, getDB };

////////////////////////////////////////////////

// require("dotenv").config(); // Load environment variables
// const { MongoClient } = require("mongodb");

// const cloud_uri = process.env.CLOUD_MONGO_URI;
// const local_uri = process.env.LOCAL_MONGO_URI;

// if (!local_uri || !cloud_uri) {
//   throw new Error(
//     "❌ Both CLOUD_MONGO_URI and LOCAL_MONGO_URI must be defined in .env file!"
//   );
// }

// // Clients for both connections
// const localClient = new MongoClient(local_uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const cloudClient = new MongoClient(cloud_uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// let localDB, cloudDB;

// const connectDB = async () => {
//   try {
//     // Connect to Local MongoDB
//     await localClient.connect();
//     localDB = localClient.db("pharmama");
//     console.log("✅ Local MongoDB Connected!");

//     // Connect to Cloud MongoDB
//     await cloudClient.connect();
//     cloudDB = cloudClient.db("pharmama");
//     console.log("✅ Cloud MongoDB Connected!");
//   } catch (error) {
//     console.error("❌ MongoDB Connection Error:", error);
//     process.exit(1);
//   }
// };

// // Get Local or Cloud DB
// const getLocalDB = () => {
//   if (!localDB) throw new Error("❌ Local Database not connected!");
//   return localDB;
// };

// const getCloudDB = () => {
//   if (!cloudDB) throw new Error("❌ Cloud Database not connected!");
//   return cloudDB;
// };

// module.exports = { connectDB, getLocalDB, getCloudDB };

///////////////////////////////////////////////////

// require("dotenv").config(); // Load environment variables
// const { MongoClient } = require("mongodb");

// const cloud_uri = process.env.CLOUD_MONGO_URI;
// if (!cloud_uri) {
//   throw new Error("❌ CLOUD_MONGO_URI is not defined in .env file!");
// }

// const CloudClient = new MongoClient(cloud_uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// let cloud_db;

// const connectCloudDB = async () => {
//   try {
//     await CloudClient.connect();
//     cloud_db = CloudClient.db("pharmama"); // Change if your DB name is different
//     console.log("✅ Cloud MongoDB Connected!");
//   } catch (error) {
//     console.error("❌ MongoDB Connection Error:", error);
//     process.exit(1);
//   }
// };

// const getCloudDB = () => {
//   if (!cloud_db) throw new Error("❌ Database not connected!");
//   return cloud_db;
// };

// ////////////////////////////////

// const local_uri = process.env.LOCAL_MONGO_URI;
// if (!local_uri) {
//   throw new Error("❌ LOCAL_MONGO_URI is not defined in .env file!");
// }
// const localClient = new MongoClient(local_uri);
// let local_db;

// const connectLocalDB = async () => {
//   try {
//     await localClient.connect();
//     local_db = localClient.db("pharmama");
//     console.log("✅ Local MongoDB Connected!");
//   } catch (error) {
//     console.error("❌ MongoDB Connection Error:", error);
//     process.exit(1);
//   }
// };

// const getLocalDB = () => {
//   if (!local_db) throw new Error("❌ Database not connected!");
//   return local_db;
// };

// module.exports = { connectCloudDB, getCloudDB, connectLocalDB, getLocalDB };

///////////////////////////////////////////////////////

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
    await local_db.collection("invoices").createIndex({ synced: 1 });
    console.log("✅ Local MongoDB Connected!");
    // return local_db;
  } catch (error) {
    console.error("❌ MongoDB Connection Error (Local):", error);
  }
};

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
