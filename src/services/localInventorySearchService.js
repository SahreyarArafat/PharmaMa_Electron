const BASE_URL = `http://localhost:5000`;

export const postLocalInventoryProductsData = async (newProducts) => {
  try {
    const response = await fetch(`${BASE_URL}/api/inventory_products/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProducts),
    });
    return await response.json();
  } catch (error) {
    console.error("Error posting local products:", error);
    throw error;
  }
};
