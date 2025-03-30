import axios from "axios";

const BASE_URL = "http://localhost:4000";

export const fetchModuleAndPoc = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/poc_gateway/poc/mod_and_poc/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module data:", error);
    throw error;
  }
};

export const fetchExpertName = async (modId) => {
  try {
    const response = await axios.get(`${BASE_URL}/expert_gateway/expert/get_expert_name/${modId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching expert name:", error);
    throw error;
  }
};

export const fetchModuleName = async (modId) => {
  try {
    const response = await axios.get(`${BASE_URL}/modules_gateway/modules/get_module_name_by_id/${modId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module name:", error);
    throw error;
  }
};

export const fetchOrgName = async (modId) => {
  try {
    const response = await axios.get(`${BASE_URL}/organization_gateway/organization/get_org_name_by_id/${modId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching organisation name:", error);
    throw error;
  }
};