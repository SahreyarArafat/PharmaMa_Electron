const BASE_URL = `http://localhost:5000`;

export const getLocalPharmaMaBrandData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/PharmaMa_brand_data/local`);

    if (!response.ok) {
      // Only log unexpected server errors
      console.error("Unexpected error from server", response.status);
      return response.json();
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching all local search products:", error);
    return [];
  }
};

export const postLocalPharmaMaNewBrandData = async (newProduct) => {
  try {
    const response = await fetch(`${BASE_URL}/api/PharmaMa_brand_data/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    return await response.json();
  } catch (error) {
    console.error("Error posting local products:", error);
    throw error;
  }
};

export const updateLocalPharmaMaBrandDataUnitPrices = async (products) => {
  const res = await fetch(
    `${BASE_URL}/api/PharmaMa_brand_data/local/update_unit_prices`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ products }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update brand prices");
  }

  return res.json();
};

//////////////////////////////
// getLocalMedicinesGenericData
export const getLocalPharmaMaGenericData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/PharmaMa_generic_data/local`);

    if (!response.ok) {
      // Only log unexpected server errors
      console.error("Unexpected error from server", response.status);
      return response.json();
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching all local medicine generic data:", error);
    return [];
  }
};

// postLocalMedicinesGenericData
export const postLocalPharmaMaNewGenericData = async (NewGenericData) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/PharmaMa_generic_data/local`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(NewGenericData),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error posting local New Generic Data:", error);
    throw error;
  }
};

// getLocalMedicineDosageForms

export const getLocalPharmaMaDosageFormData = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/PharmaMa_dosage_form_data/local`
    );

    if (!response.ok) {
      // Only log unexpected server errors
      console.error("Unexpected error from server", response.status);
      return response.json();
    }

    return await response.json();
  } catch (error) {
    console.error(
      "Error fetching all local medicine dosage forms data:",
      error
    );
    return [];
  }
};

// postLocalNewDosageForm
export const postLocalPharmaMaNewDosageForm = async (NewDosageForm) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/PharmaMa_dosage_form_data/local`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(NewDosageForm),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error posting local New Dosage Form:", error);
    throw error;
  }
};

// getLocalCompaniesData

export const getLocalPharmaMaCompaniesData = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/PharmaMa_companies_data/local`
    );

    if (!response.ok) {
      // Only log unexpected server errors
      console.error("Unexpected error from server", response.status);
      return response.json();
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching all local companies data:", error);
    return [];
  }
};

// postLocalCompaniesData
export const postLocalPharmaMaNewCompanyData = async (newCompany) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/PharmaMa_companies_data/local`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompany),
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error posting local New Company Data:", error);
    throw error;
  }
};
