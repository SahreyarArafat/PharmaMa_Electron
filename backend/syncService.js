// const getInvoices = async () => {
//   try {
//     const response = await fetch(
//       "http://localhost:5000/api/invoices/local?synced=false"
//     );
//     if (!response.ok) {
//       throw new Error("Failed to fetch invoices");
//     }
//     const invoices = await response.json();
//     console.log("Fetched Invoices:", invoices);
//     return invoices;
//   } catch (error) {
//     console.error("Error fetching invoices:", error);
//     return [];
//   }
// };

// const postInvoicesToCloud = async (unsyncedInvoices) => {
//   try {
//     const response = await fetch("http://localhost:5000/api/invoices/cloud", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(unsyncedInvoices),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to post invoices to cloud");
//     }

//     const result = await response.json();
//     console.log("Posted invoices to cloud:", result);
//     return result;
//   } catch (error) {
//     console.error("Error posting invoices to cloud:", error);
//     throw error;
//   }
// };

// const updateLocalInvoicesAsSynced = async (invoiceIds) => {
//   try {
//     const response = await fetch(
//       "http://localhost:5000/api/invoices/local/update",
//       {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ invoiceIds }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to update local invoices as synced");
//     }

//     const result = await response.json();
//     console.log("Updated local invoices as synced:", result);
//     return result;
//   } catch (error) {
//     console.error("Error updating local invoices:", error);
//     throw error;
//   }
// };

// const syncInvoices = async () => {
//   try {
//     // 1. Fetch local invoices
//     const invoices = await getInvoices();

//     // 2. Filter unsynced invoices
//     const unsyncedInvoices = invoices.filter(
//       (invoice) => invoice.synced === false
//     );

//     if (unsyncedInvoices.length === 0) {
//       console.log("✅ No unsynced invoices to sync.");
//       return;
//     }

//     console.log("Unsynced invoices:", unsyncedInvoices);

//     // 3. Post unsynced invoices to the cloud
//     const cloudResult = await postInvoicesToCloud(unsyncedInvoices);

//     // 4. Update local invoices as synced
//     const invoiceIds = unsyncedInvoices.map((invoice) => invoice._id);
//     const updateResult = await updateLocalInvoicesAsSynced(invoiceIds);

//     return { cloudResult, updateResult };
//   } catch (error) {
//     console.error("Error syncing invoices:", error);
//   }
// };

// module.exports = { syncInvoices };
// ------------------

const fetch = require("node-fetch");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5000";

const getInvoices = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/invoices/local?synced=false`);
    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.statusText}`);
    }

    const invoices = await response.json();
    console.log(`✅ Fetched ${invoices.length} unsynced invoices`);
    return invoices;
  } catch (error) {
    console.error("❌ Error fetching unsynced invoices:", error.message);
    return [];
  }
};

const postInvoicesToCloud = async (unsyncedInvoices) => {
  try {
    const response = await fetch(`${BASE_URL}/api/invoices/cloud`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unsyncedInvoices),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to post invoices to cloud: ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log(
      `✅ Successfully posted ${unsyncedInvoices.length} invoices to cloud`
    );
    return result;
  } catch (error) {
    console.error("❌ Error posting invoices to cloud:", error.message);
    throw error;
  }
};

const updateLocalInvoicesAsSynced = async (invoiceIds) => {
  try {
    const response = await fetch(`${BASE_URL}/api/invoices/local/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceIds }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update local invoices as synced: ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log(
      `✅ Successfully updated local invoices as synced: ${invoiceIds.length}`
    );
    return result;
  } catch (error) {
    console.error("❌ Error updating local invoices:", error.message);
    throw error;
  }
};

const syncInvoices = async () => {
  try {
    const unsyncedInvoices = await getInvoices();

    if (!unsyncedInvoices.length) {
      console.log("✅ No unsynced invoices to sync.");
      return;
    }

    const cloudResult = await postInvoicesToCloud(unsyncedInvoices);

    const invoiceIds = unsyncedInvoices.map((invoice) => invoice._id);
    const updateResult = await updateLocalInvoicesAsSynced(invoiceIds);

    console.log("🚀 Invoice sync completed.");
    return { cloudResult, updateResult };
  } catch (error) {
    console.error("🔥 Sync process failed:", error.message);
  }
};

module.exports = { syncInvoices };
