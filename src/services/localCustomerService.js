const BASE_URL = "http://localhost:5000";

export const getAllCustomers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/customers/local`);
    if (!response.ok) {
      throw new Error("Failed to fetch customers");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};

export const getCustomerByPhone = async (phone) => {
  try {
    const res = await fetch(`${BASE_URL}/api/customers/local/phone/${phone}`);

    if (res.status === 404) {
      // Expected case — no customer found
      console.log("Customer doesn't exist on this:", phone);
      return null; // Customer doesn't exist
    }

    if (!res.ok) {
      // Only log unexpected server errors
      console.error("Unexpected error from server", res.status);
      return null;
    }

    return await res.json(); // existing customer object
  } catch (err) {
    console.error("Network error while fetching customer by phone:", err);
    return null;
  }
};

export const postCustomers = async (customers) => {
  try {
    const response = await fetch(`${BASE_URL}/api/customers/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customers),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error posting customers:", error);
    throw error;
  }
};
