const BASE_URL = `http://localhost:5000/api/invoices/local`;

export const getLocalInvoices = async (onlyUnsynced = false) => {
  try {
    const url = onlyUnsynced ? `${BASE_URL}?synced=false` : BASE_URL;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch local invoices");
    return await response.json();
  } catch (error) {
    console.error("Error fetching local invoices:", error);
    return [];
  }
};

export const postLocalInvoices = async (invoices) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoices),
    });
    return await response.json();
  } catch (error) {
    console.error("Error posting local invoices:", error);
    throw error;
  }
};

export const updateLocalInvoicesAsSynced = async (invoiceIds) => {
  try {
    const response = await fetch(`${BASE_URL}/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceIds }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating local invoices:", error);
    throw error;
  }
};
