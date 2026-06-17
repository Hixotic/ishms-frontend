import axios from 'axios';

// 1. Define the API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ishms-api-2026-gedyf5g5bgbfb2dt.italynorth-01.azurewebsites.net/';
const LOGIN_ENDPOINT = `${API_BASE_URL}/Auth/login`;

// Local server API for persistent vitals storage (shared across all users)
const LOCAL_API_BASE_URL = import.meta.env.VITE_LOCAL_API_URL || '/api';

/**
 * Handles user login and updates localStorage with the authentication status.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 */
async function loginUser(email, password) {
  // Prepare the payload according to your schema
  const loginData = {
    email: email,
    password: password
  };

  try {
    // 2. Make the API Call
    const response = await fetch(LOGIN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(loginData)
    }); 

    // 3. Handle the Response
    if (!response.ok) {
      // If the server responded with an error status (e.g., 401 Unauthorized, 400 Bad Request)
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Login failed with status: ${response.status}`);
    }

    const data = await response.json();

    // 4. Save Status to LocalStorage
    // We store an isLoggedIn flag, the token (if returned), and the timestamp
    localStorage.setItem('isLoggedIn', 'true');
    
    if (data.token) {
      localStorage.setItem('authToken', data.token); 
    }
    
    // Optional: Save user details if your API returns them
    if (data.user) {
      localStorage.setItem('userData', JSON.stringify(data.user));
    }

    console.log('Login successful! Status saved to localStorage.');
    return { success: true, data };

  } catch (error) {
    console.error('Login Error:', error.message);
    
    // Make sure to clean up or set status to false if login fails
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('authToken');
    
    return { success: false, error: error.message };
  }
}

// --- Example Usage ---
loginUser('nurse@ishms.net', 'Test@123');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000, // 8 seconds timeout to prevent long hangs
});

/**
 * Retrieves the stored authentication token from localStorage.
 * @returns {string|null} The token string if found, otherwise null.
 */
export const getAuthToken = () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token || token.trim() === '') return null;
    return token;
  } catch (error) {
    console.error('Error retrieving auth token from localStorage:', error);
    return null;
  }
};

// Helper to set or remove the auth token in localStorage and axios defaults
export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('isLoggedIn', 'true');
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('authToken');
      localStorage.setItem('isLoggedIn', 'false');
      delete api.defaults.headers.common['Authorization'];
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API error:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
      });
    } else {
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to get local patient data (background, etc.)
const getLocalPatientData = async (patientId) => {
  try {
    const response = await axios.get(`${LOCAL_API_BASE_URL}/patients/${patientId}`);
    return response.data || null;
  } catch (e) {
    console.warn('Local server patient read failed, falling back to localStorage');
    try {
      const sessionPatients = JSON.parse(localStorage.getItem('session_patients') || '{}');
      return sessionPatients[patientId] || null;
    } catch (e2) { return null; }
  }
};

// Helper function to get local vitals data
const getLocalVitalsData = async (patientId) => {
  try {
    const response = await axios.get(`${LOCAL_API_BASE_URL}/vitals/${patientId}`);
    return response.data || null;
  } catch (e) {
    console.warn('Local server vitals read failed, falling back to localStorage');
    try {
      const localData = JSON.parse(localStorage.getItem('session_vitals') || '{}');
      return localData[patientId] || null;
    } catch (e2) { return null; }
  }
};

export const patientApi = {
  getAllPatients: async () => {
    const response = await api.get('/Patient');
    const patients = response.data || [];
    const localVitalsByPatientId = await getAllLocalVitals();

    return patients.map((patientData) => {
      const localVitals = localVitalsByPatientId?.[patientData.id] || null;
      if (localVitals) {
        const mergedVitals = { ...(patientData.lastVitals || patientData.vitals || {}), ...localVitals };
        return {
          ...patientData,
          lastVitals: mergedVitals,
          vitals: mergedVitals,
          vitalSigns: [mergedVitals, ...(patientData.vitalSigns || [])],
        };
      }
      return patientData;
    });
  },
  getPatientById: async (id) => {
    try {
      const response = await api.get(`/Patient/${id}`);
      let patientData = response.data;
      
      // Merge with local patient data (background from vitals entry)
      const localPatientData = await getLocalPatientData(id);
      if (localPatientData) {
        patientData = { ...patientData, ...localPatientData };
      }
      
      // Merge with local vitals data
      const localVitals = await getLocalVitalsData(id);
      if (localVitals) {
        const mergedVitals = { ...(patientData.lastVitals || patientData.vitals || {}), ...localVitals };
        patientData.lastVitals = mergedVitals;
        patientData.vitals = mergedVitals;
        patientData.vitalSigns = [mergedVitals, ...(patientData.vitalSigns || [])];
      }
      
      // Merge with session localStorage data as fallback
      const sessionPatients = JSON.parse(localStorage.getItem('session_patients') || '{}');
      if (sessionPatients[id]) {
        patientData = { ...patientData, ...sessionPatients[id] };
      }
      
      return patientData;
    } catch (error) {
      console.warn(`Error fetching patient ${id}, checking local storage:`, error);
      
      // Try to get from local sources if API fails
      const localPatientData = await getLocalPatientData(id);
      const localVitals = await getLocalVitalsData(id);
      const sessionPatients = JSON.parse(localStorage.getItem('session_patients') || '{}');
      
      let fallbackData = { id, ...sessionPatients[id] };
      if (localPatientData) fallbackData = { ...fallbackData, ...localPatientData };
      if (localVitals) {
        fallbackData.lastVitals = localVitals;
        fallbackData.vitals = localVitals;
        fallbackData.vitalSigns = [localVitals];
      }
      
      if (Object.keys(fallbackData).length > 1) {
        return fallbackData;
      }
      throw error;
    }
  },
  getPatientsByDepartment: async (departmentId) => {
    const response = await api.get(`/Patient/department/${departmentId}`);
    return response.data;
  },
};

export const alertApi = {
  getAlertsByRole: async (role = 'Nurse') => {
    const response = await api.get(`/Alert/role/${role}`);
    return response.data;
  },
  getAlertsByUser: async (userId) => {
    const response = await api.get(`/Alert/user/${userId}`);
    return response.data;
  },
  markAsRead: async (alertId) => {
    const response = await api.post(`/Alert/read/${alertId}`);
    return response.data;
  },
};

// Local server API helper for persistent vitals storage (shared across all users)
const saveLocalVitals = async (patientId, vitals) => {
  // 1. Save to local server (persistent across all users)
  try {
    await axios.post(`${LOCAL_API_BASE_URL}/vitals`, { patientId, ...vitals });
    console.log(`Vitals saved to local server for patient ${patientId}`);
  } catch (e) {
    console.warn('Local server save failed, falling back to localStorage', e);
    // Fallback to localStorage
    try {
      const localData = JSON.parse(localStorage.getItem('session_vitals') || '{}');
      localData[patientId] = vitals;
      localStorage.setItem('session_vitals', JSON.stringify(localData));
    } catch (e2) { console.error('Local storage error', e2); }
  }
};

const getLocalVitals = async (patientId) => {
  // 1. Try local server first (persistent across all users)
  try {
    const response = await axios.get(`${LOCAL_API_BASE_URL}/vitals/${patientId}`);
    if (response.data) {
      return response.data;
    }
  } catch (e) {
    console.warn('Local server read failed, falling back to localStorage');
  }
  // 2. Fallback to localStorage
  try {
    const localData = JSON.parse(localStorage.getItem('session_vitals') || '{}');
    return localData[patientId] || null;
  } catch (e) { return null; }
};

const getAllLocalVitals = async () => {
  // Get all vitals from local server
  try {
    const response = await axios.get(`${LOCAL_API_BASE_URL}/vitals`);
    return response.data;
  } catch (e) {
    console.warn('Local server read all failed, falling back to localStorage');
    try {
      return JSON.parse(localStorage.getItem('session_vitals') || '{}');
    } catch (e2) { return {}; }
  }
};

export const vitalSignsApi = {
  getLatestVitals: async (patientId) => {
    // Check local server first for persistent updates
    const local = await getLocalVitals(patientId);
    
    try {
      const response = await api.get(`/VitalSigns/latest/${patientId}`);
      const apiData = response.data;
      
      // If we have local data, check if it's newer or should override
      if (local && apiData) {
        // Simple merge: if local exists, it might be the very latest update from this session
        return { ...apiData, ...local };
      }
      return apiData || local;
    } catch (err) {
      console.warn('Vitals API failed, using local session data');
      return local;
    }
  },
  getAllVitals: async () => {
    // Get all vitals from local server (for dashboard)
    return await getAllLocalVitals();
  },
  addVitalSigns: async (vitalData) => {
    // Save to local server immediately for persistent storage
    await saveLocalVitals(vitalData.patientId, vitalData);
    
    // Also update the patient's background in local server for ISBAR and Care Report
    if (vitalData.background && vitalData.patientId) {
      try {
        await axios.post(`${LOCAL_API_BASE_URL}/patients/${vitalData.patientId}`, {
          background: vitalData.background
        });
      } catch (e) {
        console.warn('Local server patient save failed, falling back to localStorage');
      }
      try {
        const sessionPatients = JSON.parse(localStorage.getItem('session_patients') || '{}');
        sessionPatients[vitalData.patientId] = {
          ...(sessionPatients[vitalData.patientId] || {}),
          background: vitalData.background
        };
        localStorage.setItem('session_patients', JSON.stringify(sessionPatients));
      } catch (e) { console.error('Error saving session patient background', e); }
    }
    
    try {
      const response = await api.post('/VitalSigns', vitalData);
      return response.data;
    } catch (err) {
      console.warn('API addVitalSigns failed, but saved to local server');
      return { success: true, local: true };
    }
  },
};

export const medicalReportApi = {
  getPatientReports: async (patientId) => {
    try {
      const response = await api.get(`/MedicalReport/patient/${patientId}`);
      const apiReports = Array.isArray(response.data) ? response.data : [];
      
      // Merge with local session reports
      const localData = JSON.parse(localStorage.getItem('session_reports') || '{}');
      const localReports = localData[patientId] || [];
      
      return [...localReports, ...apiReports];
    } catch (err) {
      console.warn('MedicalReport API failed, using local session reports');
      const localData = JSON.parse(localStorage.getItem('session_reports') || '{}');
      return localData[patientId] || [];
    }
  },
  addReport: async (reportData) => {
    try {
      const response = await api.post('/MedicalReport', reportData);
      
      // Save to local session cache for immediate UI update
      const localData = JSON.parse(localStorage.getItem('session_reports') || '{}');
      if (!localData[reportData.patientId]) localData[reportData.patientId] = [];
      localData[reportData.patientId].unshift({
        ...reportData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('session_reports', JSON.stringify(localData));
      
      return response.data;
    } catch (err) {
      console.warn('API addReport failed, saving locally for session');
      const localData = JSON.parse(localStorage.getItem('session_reports') || '{}');
      if (!localData[reportData.patientId]) localData[reportData.patientId] = [];
      localData[reportData.patientId].unshift({
        ...reportData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        local: true
      });
      localStorage.setItem('session_reports', JSON.stringify(localData));
      return { success: true, local: true };
    }
  }
};

export const medicationApi = {
  getPatientMedications: async (patientId) => {
    try {
      const response = await api.get(`/Medication/patient/${patientId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn(`Error fetching medications for patient ${patientId}:`, error);
      return [];
    }
  },
  administerMedication: async (administrationData) => {
    const response = await api.post('/Medication/administer', administrationData);
    return response.data;
  },
};

export const isbarApi = {
  getIsbarReport: async (patientId) => {
    try {
      const response = await api.get(`/Patient/${patientId}/isbar`);
      return response.data;
    } catch (err) {
      console.warn('Azure ISBAR API failed, might need manual generation');
      throw err;
    }
  },
  generateIsbar: async (isbarData) => {
    // Attempting to use the new Azure backend if a POST endpoint exists, 
    // otherwise falling back to the specialized AI service
    try {
      const response = await api.post('/Patient/isbar', isbarData);
      return response.data;
    } catch (err) {
      console.warn('Azure POST ISBAR failed, falling back to AI service');
      const response = await axios.post(
        'https://ishms-api.istabrq.shop/api/v1/drug/isbar',
        isbarData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    }
  },
};

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/Auth/login', credentials);
    if (response.data.token) setAuthToken(response.data.token);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/Auth/register', userData);
    return response.data;
  },
  logout: () => setAuthToken(null),
  setToken: (token) => setAuthToken(token),
  getToken: () => getAuthToken(),
};

export default api;
