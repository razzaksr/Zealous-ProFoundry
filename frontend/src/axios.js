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

export const fetchTestsToday = async (pocId) => {
  try {
    const response = await axios.get(`${BASE_URL}/poc_gateway/poc/tests_today/${pocId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching today's tests:", error);
    return { tests_today: [] }; // Changed key to match new endpoint
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

// Fetch course progress (aggregate scores) by POC ID and User ID
export const fetchAggregateScores = async (pocId, userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/results_gateway/results/aggregate_scores/${pocId}/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching course progress:", error);
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

// FETCH ALL POC

export const fetchAllPocs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/poc_gateway/poc/read_all_poc`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch POCs');
  }
};

// FETCH ALL USER 
export const fetchAllUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/user_gateway/user/read_all_users`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
};

// FETCH ALL MODULES
export const fetchAllModules = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/modules_gateway/modules/get_all_module`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch modules');
  }
};

// FETCH ALL ORGANISATIONS
export const fetchAllOrganizations = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/organization_gateway/organization/get_all_org`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch organizations');
  }
};

// FETCH ALL EXPERTS
export const fetchAllExperts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/expert_gateway/expert/read_all_experts`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch experts');
  }
};

// FETCH ALL MCQ
export const fetchAllMcqs = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/mcq_gateway/mcq/get_all_mcqs`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch MCQs');
  }
};

// FETCH ALL TESTS
export const fetchAllTests = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/test_gateway/test/all`);
    return response;
  } catch (error) {
    throw new Error('Failed to fetch tests');
  }
};

// FETCH CODE BY CODE ID 
export const fetchCodeById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/coding_gateway/coding/get_code_by_id/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.msg || "Failed to fetch code");
    }
    return response.data.data;
  } catch (error) {
    throw new Error(`Error fetching code: ${error.message}`);
  }
};

export const fetchTestCaseById = async (testcase_id) => {
  try {
    const response = await axios.get(`${BASE_URL}/testcase_gateway/testcase/get_testCase_id/${testcase_id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching test case: ${error.message}`);
  }
};

export const compileCode = async (payload) => {
  try {
    const response = await axios.post(`${BASE_URL}/coding_gateway/coding/compiler`, payload);
    return response.data;
  } catch (error) {
    throw new Error(`Error compiling code: ${error.message}`);
  }
};

export const generateCertificate = async (mod_poc_id, newUserId) => {
  try {
    const response = await axios.post(`${BASE_URL}/poc_gateway/poc/add-certificate`, {
      mod_poc_id,
      newUserId,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export const getCertificate = async (mod_poc_id, userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/poc_gateway/poc/get-certificate/${mod_poc_id}/${userId}`
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Fetch or generate certificate ID
export const fetchOrGenerateCertificateId = async (pocId, userId) => {
  try {
    // Try to fetch existing certificate ID
    const response = await axios.get(`${BASE_URL}/poc_gateway/poc/get-certificate/${pocId}/${userId}`);
    return response.data.certificateId;
  } catch (error) {
    if (error.response?.status === 404) {
      // Certificate not found, generate a new one
      const response = await axios.post(`${BASE_URL}/poc_gateway/poc/add-certificate`, {
        mod_poc_id: pocId,
        newUserId: userId,
      });
      return response.data.certificateId;
    }
    console.error(`Error fetching/generating certificate ID for poc ${pocId}, user ${userId}:`, error);
    throw error.response?.data || error.message;
  }
};
