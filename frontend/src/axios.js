import axios from "axios";

const BASE_URL = "http://localhost:4000";
// const BASE_URL = "http://98.81.207.64:4000";


// Sign-in API call
export const signIn = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/user_gateway/user/login`, userData);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Get test data by test ID
export const getTestById = async (testId) => {
  try {
    const response = await axios.get(`${BASE_URL}/test_gateway/test/get_by_test_id/${testId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching test data:", error);
    throw error;
  }
};

// Get MCQ by ID
export const getMcqById = async (mcqId) => {
  try {
    const response = await axios.get(`${BASE_URL}/mcq_gateway/mcq/get_mcq/${mcqId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch MCQ:", error);
    throw error;
  }
};

// Submit test result
export const submitTestResult = async (resultData) => {
  try {
    const response = await axios.post(`${BASE_URL}/mcq_gateway/mcq/submit_result`, resultData);
    return response.data;
  } catch (error) {
    console.error("Error submitting test:", error);
    throw error;
  }
};

// Fetch user details by user ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/user_gateway/user/get_user_by_id/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

// Fetch user results by user ID
export const getResultsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/results_gateway/results/get-result-by-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user results:", error);
    throw error;
  }
};

// Fetch module details by module ID
export const getModuleById = async (modId) => {
  try {
    const response = await axios.get(`${BASE_URL}/modules_gateway/modules/get_module_by_id/${modId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching module details:", error);
    throw error;
  }
};

// Fetch Result by User ID
export const fetchResultsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/results_gateway/results/get_results_by_user_id/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching result data:", error);
    throw error;
  }
};

export const checkIfTestTaken = async (userId, testId) => {
  try {
    const response = await axios.get(`${BASE_URL}/results_gateway/results/get_result_by_user_id_test_id`, {
      params: {
        result_user_id: userId,
        result_test_id: testId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error checking test result:', error);
    throw error;
  }
};

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

// FETCH POC BY ID 

export const fetchPocById = async (mod_poc_id) => {
  try {
    const response = await axios.get(`${BASE_URL}/poc_gateway/poc/get_poc_by_poc_id/${mod_poc_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching POC by ID:", error);
    throw error;
  }
};