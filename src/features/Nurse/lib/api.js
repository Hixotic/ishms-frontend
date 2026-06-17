// ─── CONFIG ───────────────────────────────────────────────────────────────────

export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  'https://ishms-api-2026-gedyf5g5bgbfb2dt.italynorth-01.azurewebsites.net';

const STORAGE_KEY = 'ishms-auth';

// ─── TOKEN MANAGEMENT ─────────────────────────────────────────────────────────

/**
 * Read the Bearer token from localStorage.
 * Stored shape mirrors the API response:
 * {
 *   isAuthenticated: true,
 *   token: "eyJ...",
 *   tokenExpiration: "2026-...",
 *   email: "...",
 *   fullName: "...",
 *   roles: ["nurse"]
 * }
 * Also handles legacy shape: { token, user: { token } }
 */
export const getStoredToken = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || parsed?.user?.token || null;
  } catch {
    return null;
  }
};

/**
 * Persist the full API auth response to localStorage after login/register.
 * @param {object} authData — the full response body from /api/Auth/login
 */
export const saveAuthToken = (authData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
  } catch (e) {
    console.warn('[api] Could not write to localStorage:', e);
  }
};

/** Remove auth data from localStorage (logout). */
export const clearAuthToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

/**
 * Read the stored user info, normalised regardless of storage shape.
 * @returns {{ email, fullName, role, roles, tokenExpiration } | null}
 */
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Flat shape (real API response)
    if (parsed?.email) {
      return {
        email: parsed.email,
        fullName: parsed.fullName,
        roles: parsed.roles ?? [],
        role: parsed.roles?.[0] ?? null,
        tokenExpiration: parsed.tokenExpiration ?? null,
      };
    }

    // Legacy shape: { token, user: { email, fullName, role } }
    if (parsed?.user) {
      return {
        ...parsed.user,
        roles: parsed.user.roles ?? (parsed.user.role ? [parsed.user.role] : []),
        role: parsed.user.role ?? parsed.user.roles?.[0] ?? null,
      };
    }

    return null;
  } catch {
    return null;
  }
};

// Convenience aliases kept for backward compatibility
export const getAuthToken = getStoredToken;
export const setAuthToken = (token) => {
  if (token) saveAuthToken({ token });
  else clearAuthToken();
};

// ─── CORE REQUEST ─────────────────────────────────────────────────────────────

/**
 * Central fetch wrapper. Automatically attaches Authorization: Bearer <token>.
 *
 * @param {{
 *   method?: 'GET'|'POST'|'PUT'|'DELETE'|'PATCH',
 *   url: string,
 *   data?: object,
 *   params?: object,
 *   headers?: object,
 * }} options
 * @returns {Promise<{ status: number, data: any }>}
 * @throws On non-2xx responses (error.status and error.data are attached)
 */
export const apiRequest = async ({
  method = 'GET',
  url,
  data,
  params,
  headers = {},
}) => {
  const fullUrl = buildUrl(url, params);
  const token = getStoredToken();

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const fetchOptions = {
    method: method.toUpperCase(),
    headers: requestHeaders,
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  };

  const response = await fetch(fullUrl, fetchOptions);

  // Parse body
  let responseData;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    responseData = text || null;
  }

  if (response.status === 401) {
    console.warn('[api] 401 Unauthorized — clearing stored token');
    clearAuthToken();
  }

  if (!response.ok) {
    const error = new Error(
      responseData?.message || responseData?.title || `HTTP ${response.status}`
    );
    error.status = response.status;
    error.data = responseData;
    throw error;
  }

  return { status: response.status, data: responseData };
};

// ─── URL HELPERS ──────────────────────────────────────────────────────────────

const buildUrl = (url, params) => {
  if (/^https?:\/\//i.test(url)) {
    const u = new URL(url);
    if (params) appendParams(u.searchParams, params);
    return u.toString();
  }
  const u = new URL(url, API_BASE_URL);
  if (params) appendParams(u.searchParams, params);
  return u.toString();
};

const appendParams = (searchParams, params) => {
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  }
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/Auth/login
 * Saves the token + user to localStorage automatically on success.
 * @param {{ email: string, password: string }} credentials
 */
export const authApi = {
  login: async (credentials) => {
    const res = await apiRequest({ method: 'POST', url: '/api/Auth/login', data: credentials });
    if (res.data?.token) saveAuthToken(res.data);
    return res;
  },
  register: async (userData) => {
    const res = await apiRequest({ method: 'POST', url: '/api/Auth/register', data: userData });
    if (res.data?.token) saveAuthToken(res.data);
    return res;
  },
  logout: () => clearAuthToken(),
  getToken: getStoredToken,
  getUser: getStoredUser,
};

// ─── PATIENTS ─────────────────────────────────────────────────────────────────

export const patientApi = {
  /** GET /api/Patient */
  getAllPatients: (params) =>
    apiRequest({ method: 'GET', url: '/api/Patient', params }),

  /** GET /api/Patient/:id */
  getPatientById: (id) =>
    apiRequest({ method: 'GET', url: `/api/Patient/${id}` }),

  /** GET /api/Patient/department/:departmentId */
  getPatientsByDepartment: (departmentId) =>
    apiRequest({ method: 'GET', url: `/api/Patient/department/${departmentId}` }),

  /**
   * POST /api/Patient
   * @param {{ fullName, age, dateOfBirth, departmentId, bedId }} body
   * Note: dateOfBirth must be ISO 8601, e.g. "1990-05-15T00:00:00Z"
   */
  createPatient: (body) =>
    apiRequest({ method: 'POST', url: '/api/Patient', data: body }),

  /** DELETE /api/Patient/:id */
  deletePatient: (id) =>
    apiRequest({ method: 'DELETE', url: `/api/Patient/${id}` }),

  /**
   * PUT /api/Patient/:id/nurse
   * @param {{ patientId, background, previousMedications }} body
   */
  updatePatientNurse: (id, body) =>
    apiRequest({ method: 'PUT', url: `/api/Patient/${id}/nurse`, data: body }),

  /**
   * PUT /api/Patient/:id/doctor
   * @param {{ patientId, currentTreatment }} body
   */
  updatePatientDoctor: (id, body) =>
    apiRequest({ method: 'PUT', url: `/api/Patient/${id}/doctor`, data: body }),

  /** POST /api/Patient/discharge/:patientId */
  dischargePatient: (patientId) =>
    apiRequest({ method: 'POST', url: `/api/Patient/discharge/${patientId}` }),

  /** GET /api/Patient/:id/medication/check */
  checkMedication: (id) =>
    apiRequest({ method: 'GET', url: `/api/Patient/${id}/medication/check` }),

  /** GET /api/Patient/:id/isbar */
  getIsbar: (id) =>
    apiRequest({ method: 'GET', url: `/api/Patient/${id}/isbar` }),
};

// ─── VITAL SIGNS ──────────────────────────────────────────────────────────────

export const vitalSignsApi = {
  /**
   * POST /api/Patient/vital
   * @param {{
   *   patientId, heartRate, oxygenLevel, temperature,
   *   systolicPressure, diastolicPressure, respirationRate
   * }} body
   */
  addVitalSigns: (body) =>
    apiRequest({ method: 'POST', url: '/api/Patient/vital', data: body }),

  /**
   * PUT /api/Patient/vital/:id
   * @param {number} id — vital sign record ID
   * @param {{
   *   heartRate, oxygenLevel, temperature,
   *   systolicPressure, diastolicPressure, respirationRate
   * }} body
   */
  updateVitalSigns: (id, body) =>
    apiRequest({ method: 'PUT', url: `/api/Patient/vital/${id}`, data: body }),

  /** GET /api/VitalSigns/latest/:patientId */
  getLatestVitals: (patientId) =>
    apiRequest({ method: 'GET', url: `/api/VitalSigns/latest/${patientId}` }),
};

// ─── MEDICAL REPORTS ──────────────────────────────────────────────────────────

export const medicalReportApi = {
  /**
   * POST /api/MedicalReport
   * Note: doctorId is inferred server-side from the Bearer token.
   * @param {{ patientId, diagnosis, treatmentPlan, reportType: 1|2 }} body
   */
  addReport: (body) =>
    apiRequest({ method: 'POST', url: '/api/MedicalReport', data: body }),

  /** GET /api/MedicalReport/patient/:patientId */
  getPatientReports: (patientId) =>
    apiRequest({ method: 'GET', url: `/api/MedicalReport/patient/${patientId}` }),

  /** GET /api/MedicalReport/my-reports */
  getMyReports: () =>
    apiRequest({ method: 'GET', url: '/api/MedicalReport/my-reports' }),

  /** GET /api/MedicalReport/doctor/:doctorId */
  getReportsByDoctor: (doctorId) =>
    apiRequest({ method: 'GET', url: `/api/MedicalReport/doctor/${doctorId}` }),
};

// ─── ALERTS ───────────────────────────────────────────────────────────────────

export const alertApi = {
  /** GET /api/Alert/role/:role */
  getAlertsByRole: (role = 'Nurse') =>
    apiRequest({ method: 'GET', url: `/api/Alert/role/${role}` }),

  /** GET /api/Alert/user/:userId */
  getAlertsByUser: (userId) =>
    apiRequest({ method: 'GET', url: `/api/Alert/user/${userId}` }),

  /** POST /api/Alert/read/:alertId */
  markAsRead: (alertId) =>
    apiRequest({ method: 'POST', url: `/api/Alert/read/${alertId}` }),
};

// ─── MEDICATIONS ──────────────────────────────────────────────────────────────

export const medicationApi = {
  /** GET /api/Medication/patient/:patientId */
  getPatientMedications: (patientId) =>
    apiRequest({ method: 'GET', url: `/api/Medication/patient/${patientId}` }),

  /** POST /api/Medication/administer */
  administerMedication: (body) =>
    apiRequest({ method: 'POST', url: '/api/Medication/administer', data: body }),
};

// ─── ISBAR ────────────────────────────────────────────────────────────────────

export const isbarApi = {
  /** GET /api/Patient/:patientId/isbar */
  getIsbarReport: (patientId) =>
    apiRequest({ method: 'GET', url: `/api/Patient/${patientId}/isbar` }),

  /** POST /api/Patient/isbar */
  generateIsbar: (isbarData) =>
    apiRequest({ method: 'POST', url: '/api/Patient/isbar', data: isbarData }),
};

// ─── BEDS ─────────────────────────────────────────────────────────────────────

export const bedApi = {
  /** GET /api/Bed/available */
  getAvailableBeds: () =>
    apiRequest({ method: 'GET', url: '/api/Bed/available' }),

  /** GET /api/Bed/occupied */
  getOccupiedBeds: () =>
    apiRequest({ method: 'GET', url: '/api/Bed/occupied' }),

  /** GET /api/Bed/available/:departmentId */
  getAvailableBedsByDepartment: (departmentId) =>
    apiRequest({ method: 'GET', url: `/api/Bed/available/${departmentId}` }),

  /**
   * Check if a specific room is available in a department.
   * @param {{ departmentId: number, roomNumber: string }} params
   */
  checkBedAvailability: async ({ departmentId, roomNumber }) => {
    try {
      const response = await apiRequest({
        method: 'GET',
        url: `/api/Bed/available/${departmentId}`,
      });
      const beds = response.data || [];
      const availableBed = beds.find((bed) => bed.roomNumber === roomNumber);
      return {
        available: !!availableBed,
        bed: availableBed || null,
        message: availableBed
          ? `Bed ${availableBed.bedId} in ${roomNumber} is available`
          : `No available bed in ${roomNumber}`,
      };
    } catch (error) {
      return { available: false, bed: null, message: `Error: ${error.message}` };
    }
  },

  /**
   * POST /api/Bed/assign
   * @param {{ patientId: number, departmentId: number }} body
   */
  assignBed: (body) =>
    apiRequest({ method: 'POST', url: '/api/Bed/assign', data: body }),
};

// ─── DEPARTMENTS ──────────────────────────────────────────────────────────────

export const departmentApi = {
  /** GET /api/Department */
  getDepartments: () =>
    apiRequest({ method: 'GET', url: '/api/Department' }),
};

// ─── TASKS ────────────────────────────────────────────────────────────────────

export const taskApi = {
  /** GET /api/Task/role/:role */
  getTasksByRole: (role) =>
    apiRequest({ method: 'GET', url: `/api/Task/role/${role}` }),

  /** GET /api/Task/user/:userId */
  getTasksByUser: (userId) =>
    apiRequest({ method: 'GET', url: `/api/Task/user/${userId}` }),

  /** GET /api/Task/patient/:patientId */
  getTasksByPatient: (patientId) =>
    apiRequest({ method: 'GET', url: `/api/Task/patient/${patientId}` }),

  /** POST /api/Task/complete/:taskId */
  completeTask: (taskId) =>
    apiRequest({ method: 'POST', url: `/api/Task/complete/${taskId}` }),
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

export const analyticsApi = {
  /** GET /api/Analytics — top-level summary */
  getAnalytics: () =>
    apiRequest({ method: 'GET', url: '/api/Analytics' }),

  // Executive
  getDepartmentLoad: () =>
    apiRequest({ method: 'GET', url: '/api/Analytics/executive/department-load' }),

  /** @param {{ days?: number }} params */
  getAlertTrend: (params) =>
    apiRequest({ method: 'GET', url: '/api/Analytics/executive/alert-trend', params }),

  getSlaCompliance: () =>
    apiRequest({ method: 'GET', url: '/api/Analytics/executive/sla-compliance' }),

  // Clinical
  /** @param {{ department?: string, riskBand?: string }} params */
  getRiskBoard: (params) =>
    apiRequest({ method: 'GET', url: '/api/Analytics/clinical/risk-board', params }),

  /** @param {number} patientId  @param {{ hours?: number }} params */
  getVitalTrend: (patientId, params) =>
    apiRequest({ method: 'GET', url: `/api/Analytics/clinical/vital-trend/${patientId}`, params }),

  /** @param {{ limit?: number }} params */
  getAlertFeed: (params) =>
    apiRequest({ method: 'GET', url: '/api/Analytics/clinical/alert-feed', params }),

  getEscalations: () =>
    apiRequest({ method: 'GET', url: '/api/Analytics/clinical/escalations' }),

  // Operations
  /** @param {{ department?: string }} params */
  getBedMap: (params) =>
    apiRequest({ method: 'GET', url: '/api/Analytics/operations/bed-map', params }),

  getPeakHours: () =>
    apiRequest({ method: 'GET', url: '/api/Analytics/operations/peak-hours' }),

  getBedShortageRisk: () =>
    apiRequest({ method: 'GET', url: '/api/Analytics/operations/bed-shortage-risk' }),
};

// ─── TEST / ROLE GUARDS (dev use) ─────────────────────────────────────────────

export const testApi = {
  adminOnly: () => apiRequest({ method: 'GET', url: '/api/Test/admin-only' }),
  doctorOnly: () => apiRequest({ method: 'GET', url: '/api/Test/doctor-only' }),
  nurseOnly: () => apiRequest({ method: 'GET', url: '/api/Test/nurse-only' }),
  multiRoles: () => apiRequest({ method: 'GET', url: '/api/Test/multi-roles' }),
};

export default apiRequest;