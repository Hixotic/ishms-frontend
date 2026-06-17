// ─── CONFIG ───────────────────────────────────────────────────────────────────
// this is my code use it as reference 
export let API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  'https://ishms-api-2026-gedyf5g5bgbfb2dt.italynorth-01.azurewebsites.net/';

let apiMode = 'live';

export const setApiMode = (mode) => {
  apiMode = mode === 'mock' ? 'mock' : 'live';
};

export const initializeAuthToken = () => {
  // No-op bootstrap helper: auth token is resolved on every apiRequest call.
  getStoredToken();
};

const STORAGE_KEY = 'ishms-auth';

// ─── TOKEN MANAGEMENT ─────────────────────────────────────────────────────────

/**
 * Read the Bearer token from localStorage.
 * Stored shape mirrors the API response directly:
 * {
 *   isAuthenticated: true,
 *   token: "eyJ...",
 *   tokenExpiration: "2026-...",
 *   email: "...",
 *   fullName: "...",
 *   roles: ["receptionist"]
 * }
 * Also handles legacy shape: { token, user: { token } }
 * Returns the raw token string, or null.
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
 * Pass the raw API response data object — it will be stored as-is.
 * @param {object} authData — the full response body from /api/Auth/login or /api/Auth/register
 */
export const saveAuthToken = (authData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
  } catch (e) {
    console.warn('[apiHandler] Could not write to localStorage:', e);
  }
};

/**
 * Remove auth data from localStorage (logout).
 */
export const clearAuthToken = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

/**
 * Read the stored user info.
 * Returns a normalised object regardless of which shape was stored.
 * @returns {{ email, fullName, role, roles, tokenExpiration } | null}
 */
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Flat shape (real API): { email, fullName, roles, token, tokenExpiration }
    if (parsed?.email) {
      return {
        email: parsed.email,
        fullName: parsed.fullName,
        roles: parsed.roles ?? [],
        // Convenience: first role as a string, e.g. "receptionist"
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

// ─── CORE REQUEST ─────────────────────────────────────────────────────────────

/**
 * Central fetch wrapper.
 * Automatically attaches Authorization: Bearer <token> if a token exists.
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
  // Build full URL
  const fullUrl = buildUrl(url, params);

  // Build headers — always inject Bearer token if available
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

  console.debug(`[API] ${method.toUpperCase()} ${fullUrl}`, {
    hasToken: !!token,
    ...(data ? { body: data } : {}),
  });

  const response = await fetch(fullUrl, fetchOptions);

  // Parse body (JSON or empty)
  let responseData;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    const text = await response.text();
    responseData = text || null;
  }

  // Handle auth errors
  if (response.status === 401) {
    console.warn('[apiHandler] 401 Unauthorized — clearing stored token');
    clearAuthToken();
  }

  // Throw on error status so callers can catch
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
  // Absolute URL — use as-is
  if (/^https?:\/\//i.test(url)) {
    const u = new URL(url);
    if (params) appendParams(u.searchParams, params);
    return u.toString();
  }

  // Relative path — prepend base URL
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
 * On success, saves the token + user to localStorage automatically.
 *
 * Response shape:
 * {
 *   isAuthenticated: true,
 *   message: "...",
 *   token: "eyJ...",
 *   tokenExpiration: "2026-...",
 *   email: "...",
 *   fullName: "...",
 *   roles: ["doctor"] | ["receptionist"] | ...
 * }
 *
 * @param {{ email: string, password: string }} body
 */
export const authLogin = async (body) => {
  const res = await apiRequest({ method: 'POST', url: '/api/Auth/login', data: body });
  if (res.data?.token) {
    saveAuthToken(res.data);
  }
  return res;
};

/**
 * POST /api/Auth/register
 * On success, saves the token + user to localStorage automatically.
 *
 * Response shape:
 * {
 *   isAuthenticated: true,
 *   message: "Account created Successfuly",
 *   token: "eyJ...",
 *   tokenExpiration: "2026-...",
 *   email: "...",
 *   fullName: "...",
 *   roles: ["receptionist"]
 * }
 *
 * @param {{ fullName: string, email: string, password: string, role: string }} body
 * Note: role must be one of "receptionist" | "doctor" | "nurse" | "admin"
 */
export const authRegister = async (body) => {
  const res = await apiRequest({ method: 'POST', url: '/api/Auth/register', data: body });
  if (res.data?.token) {
    saveAuthToken(res.data);
  }
  return res;
};

/** Clear localStorage and effectively log out */
export const authLogout = () => {
  clearAuthToken();
};

// ─── PATIENTS ─────────────────────────────────────────────────────────────────

/** GET /api/Patient */
export const getPatients = (params) =>
  apiRequest({ method: 'GET', url: '/api/Patient', params });

/** GET /api/Patient/:id */
export const getPatientById = (id) =>
  apiRequest({ method: 'GET', url: `/api/Patient/${id}` });

/**
 * POST /api/Patient
 * @param {{ fullName: string, age: number, dateOfBirth: string, departmentId: number, bedId: number }} body
 * Note: dateOfBirth must be an ISO 8601 date-time string, e.g. "1990-05-15T00:00:00Z"
 */
export const createPatient = (body) =>
  apiRequest({ method: 'POST', url: '/api/Patient', data: body });

/** DELETE /api/Patient/:id */
export const deletePatient = (id) =>
  apiRequest({ method: 'DELETE', url: `/api/Patient/${id}` });

/**
 * PUT /api/Patient/:id/nurse
 * @param {number} id
 * @param {{ patientId: number, background: string, previousMedications: string }} body
 */
export const updatePatientNurse = (id, body) =>
  apiRequest({ method: 'PUT', url: `/api/Patient/${id}/nurse`, data: body });

/**
 * PUT /api/Patient/:id/doctor
 * @param {number} id
 * @param {{ patientId: number, currentTreatment: string }} body
 */
export const updatePatientDoctor = (id, body) =>
  apiRequest({ method: 'PUT', url: `/api/Patient/${id}/doctor`, data: body });

/**
 * POST /api/Patient/vital
 * Creates a new vital signs record.
 * @param {{
 *   patientId: number,
 *   heartRate: number,      // 30–200
 *   oxygenLevel: number,    // 50–100 (integer)
 *   temperature: number,    // float
 *   systolicPressure: number,
 *   diastolicPressure: number,
 *   respirationRate: number
 * }} body
 */
export const createVital = (body) =>
  apiRequest({ method: 'POST', url: '/api/Patient/vital', data: body });

/**
 * PUT /api/Patient/vital/:id
 * Updates an existing vital signs record.
 * @param {number} id — vital sign record ID
 * @param {{
 *   heartRate: number,
 *   oxygenLevel: number,    // float
 *   temperature: number,    // float
 *   systolicPressure: number,
 *   diastolicPressure: number,
 *   respirationRate: number
 * }} body
 */
export const updateVital = (id, body) =>
  apiRequest({ method: 'PUT', url: `/api/Patient/vital/${id}`, data: body });

/** POST /api/Patient/discharge/:patientId */
export const dischargePatient = (patientId) =>
  apiRequest({ method: 'POST', url: `/api/Patient/discharge/${patientId}` });

/**
 * GET /api/Patient/:id/medication/check
 * Checks medication status / interactions for a patient.
 * @param {number} id
 */
export const checkPatientMedication = (id) =>
  apiRequest({ method: 'GET', url: `/api/Patient/${id}/medication/check` });

/**
 * GET /api/Patient/:id/isbar
 * Returns the ISBAR (Identify, Situation, Background, Assessment, Recommendation)
 * handover summary for a patient.
 * @param {number} id
 */
export const getPatientIsbar = (id) =>
  apiRequest({ method: 'GET', url: `/api/Patient/${id}/isbar` });

// ─── MEDICAL REPORTS ──────────────────────────────────────────────────────────

/**
 * POST /api/MedicalReport
 * Note: doctorId is inferred server-side from the Bearer token — do NOT send it.
 * @param {{
 *   patientId: number,
 *   diagnosis: string,
 *   treatmentPlan: string,
 *   reportType: 1 | 2
 * }} body
 */
export const createMedicalReport = (body) =>
  apiRequest({ method: 'POST', url: '/api/MedicalReport', data: body });

/** GET /api/MedicalReport/patient/:patientId */
export const getMedicalReportsByPatient = (patientId) =>
  apiRequest({ method: 'GET', url: `/api/MedicalReport/patient/${patientId}` });

/**
 * GET /api/MedicalReport/my-reports
 * Returns reports authored by the currently authenticated doctor (token-based).
 */
export const getMyMedicalReports = () =>
  apiRequest({ method: 'GET', url: '/api/MedicalReport/my-reports' });

/** GET /api/MedicalReport/doctor/:doctorId */
export const getMedicalReportsByDoctor = (doctorId) =>
  apiRequest({ method: 'GET', url: `/api/MedicalReport/doctor/${doctorId}` });

// ─── ALERTS ───────────────────────────────────────────────────────────────────

/** GET /api/Alert/role/:role */
export const getAlertsByRole = (role) =>
  apiRequest({ method: 'GET', url: `/api/Alert/role/${role}` });

/** GET /api/Alert/user/:userId */
export const getAlertsByUser = (userId) =>
  apiRequest({ method: 'GET', url: `/api/Alert/user/${userId}` });

/** POST /api/Alert/read/:alertId */
export const markAlertRead = (alertId) =>
  apiRequest({ method: 'POST', url: `/api/Alert/read/${alertId}` });

// ─── BEDS ─────────────────────────────────────────────────────────────────────

/** GET /api/Bed/available */
export const getAvailableBeds = () =>
  apiRequest({ method: 'GET', url: '/api/Bed/available' });

/** GET /api/Bed/occupied */
export const getOccupiedBeds = () =>
  apiRequest({ method: 'GET', url: '/api/Bed/occupied' });

/** GET /api/Bed/available/:departmentId */
export const getAvailableBedsByDepartment = (departmentId) =>
  apiRequest({ method: 'GET', url: `/api/Bed/available/${departmentId}` });

/**
 * Check if a specific bed/room is available in a department.
 * @param {{ departmentId: number, roomNumber: string }} params
 * @returns {Promise<{ available: boolean, bed: object | null, message: string }>}
 */
export const checkBedAvailability = async ({ departmentId, roomNumber }) => {
  try {
    const response = await getAvailableBedsByDepartment(departmentId);
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
    return {
      available: false,
      bed: null,
      message: `Error checking bed availability: ${error.message}`,
    };
  }
};

/**
 * POST /api/Bed/assign
 * @param {{ patientId: number, departmentId: number }} body
 */
export const assignBed = (body) =>
  apiRequest({ method: 'POST', url: '/api/Bed/assign', data: body });

// ─── DEPARTMENTS ──────────────────────────────────────────────────────────────

/** GET /api/Department */
export const getDepartments = () =>
  apiRequest({ method: 'GET', url: '/api/Department' });

// ─── TASKS ────────────────────────────────────────────────────────────────────

/** GET /api/Task/role/:role */
export const getTasksByRole = (role) =>
  apiRequest({ method: 'GET', url: `/api/Task/role/${role}` });

/** GET /api/Task/user/:userId */
export const getTasksByUser = (userId) =>
  apiRequest({ method: 'GET', url: `/api/Task/user/${userId}` });

/** GET /api/Task/patient/:patientId */
export const getTasksByPatient = (patientId) =>
  apiRequest({ method: 'GET', url: `/api/Task/patient/${patientId}` });

/** POST /api/Task/complete/:taskId */
export const completeTask = (taskId) =>
  apiRequest({ method: 'POST', url: `/api/Task/complete/${taskId}` });

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

/**
 * GET /api/Analytics
 * Returns the top-level analytics summary / overview dashboard data.
 */
export const getAnalytics = () =>
  apiRequest({ method: 'GET', url: '/api/Analytics' });

// ── Executive ─────────────────────────────────────────────────────────────────

/**
 * GET /api/Analytics/executive/department-load
 * Returns per-department patient load metrics for executive dashboards.
 */
export const getExecutiveDepartmentLoad = () =>
  apiRequest({ method: 'GET', url: '/api/Analytics/executive/department-load' });

/**
 * GET /api/Analytics/executive/alert-trend
 * Returns alert volume trend over recent days.
 * @param {{ days?: number }} params — default 7
 */
export const getExecutiveAlertTrend = (params) =>
  apiRequest({ method: 'GET', url: '/api/Analytics/executive/alert-trend', params });

/**
 * GET /api/Analytics/executive/sla-compliance
 * Returns SLA compliance metrics for executive reporting.
 */
export const getExecutiveSlaCompliance = () =>
  apiRequest({ method: 'GET', url: '/api/Analytics/executive/sla-compliance' });

// ── Clinical ──────────────────────────────────────────────────────────────────

/**
 * GET /api/Analytics/clinical/risk-board
 * Returns a risk-banded patient board for clinical staff.
 * @param {{ department?: string, riskBand?: string }} params
 */
export const getClinicalRiskBoard = (params) =>
  apiRequest({ method: 'GET', url: '/api/Analytics/clinical/risk-board', params });

/**
 * GET /api/Analytics/clinical/vital-trend/:patientId
 * Returns vital sign trend data for a single patient.
 * @param {number} patientId
 * @param {{ hours?: number }} params — default 24
 */
export const getClinicalVitalTrend = (patientId, params) =>
  apiRequest({
    method: 'GET',
    url: `/api/Analytics/clinical/vital-trend/${patientId}`,
    params,
  });

/**
 * GET /api/Analytics/clinical/alert-feed
 * Returns a live alert feed for clinical dashboards.
 * @param {{ limit?: number }} params — default 20
 */
export const getClinicalAlertFeed = (params) =>
  apiRequest({ method: 'GET', url: '/api/Analytics/clinical/alert-feed', params });

/**
 * GET /api/Analytics/clinical/escalations
 * Returns a list of currently escalated cases requiring attention.
 */
export const getClinicalEscalations = () =>
  apiRequest({ method: 'GET', url: '/api/Analytics/clinical/escalations' });

// ── Operations ────────────────────────────────────────────────────────────────

/**
 * GET /api/Analytics/operations/bed-map
 * Returns a bed occupancy map, optionally filtered by department.
 * @param {{ department?: string }} params
 */
export const getOperationsBedMap = (params) =>
  apiRequest({ method: 'GET', url: '/api/Analytics/operations/bed-map', params });

/**
 * GET /api/Analytics/operations/peak-hours
 * Returns peak-hour admission/activity data for operations planning.
 */
export const getOperationsPeakHours = () =>
  apiRequest({ method: 'GET', url: '/api/Analytics/operations/peak-hours' });

/**
 * GET /api/Analytics/operations/bed-shortage-risk
 * Returns a forecast / risk assessment for upcoming bed shortages.
 */
export const getOperationsBedShortageRisk = () =>
  apiRequest({ method: 'GET', url: '/api/Analytics/operations/bed-shortage-risk' });

// ─── TEST / ROLE GUARDS (dev use) ─────────────────────────────────────────────

/** GET /api/Test/admin-only — verifies admin role auth */
export const testAdminOnly = () =>
  apiRequest({ method: 'GET', url: '/api/Test/admin-only' });

/** GET /api/Test/doctor-only — verifies doctor role auth */
export const testDoctorOnly = () =>
  apiRequest({ method: 'GET', url: '/api/Test/doctor-only' });

/** GET /api/Test/nurse-only — verifies nurse role auth */
export const testNurseOnly = () =>
  apiRequest({ method: 'GET', url: '/api/Test/nurse-only' });

/** GET /api/Test/multi-roles — verifies multi-role auth */
export const testMultiRoles = () =>
  apiRequest({ method: 'GET', url: '/api/Test/multi-roles' });