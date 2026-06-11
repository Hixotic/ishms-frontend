global.localStorage = {
  getItem: (key) => {
    if (key === 'ishms-auth') {
      return JSON.stringify({
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJyZWNAdGVzdC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiTWFyaWFtIG1vaGFtbWVkIiwianRpIjoiM2E0YTI1OTYtYTVkNC00ZWE1LWE5MmYtZGJlZGQ3NWRlOWQ2IiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiUmVjZXB0aW9uaXN0IiwiZXhwIjoxNzc4Nzk4Mjg5LCJpc3MiOiJJU0hNUy5BUEkiLCJhdWQiOiJJU0hNUy5DbGllbnQifQ.uWMPMlcfnwwno0qBjqc1ARlM3WljuNsO4oiAU2Fr3QI',
        isAuthenticated: true,
        email: 'rec@test.com',
        fullName: 'Mariam mohammed',
        roles: ['Receptionist'],
        tokenExpiration: '2026-12-31T23:58:09.000Z'
      });
    }
    return null;
  },
  setItem: () => {},
  removeItem: () => {}
};

import { apiRequest } from './src/api/apiHandler.js';

const endpoints = [
  { method: 'GET', url: '/api/Admission' },
  { method: 'GET', url: '/api/Insurance/check' },
  { method: 'GET', url: '/api/Report/daily/2026-05-08' },
  { method: 'GET', url: '/api/Report/bed-occupancy' },
  { method: 'GET', url: '/api/Patient/discharge-ready' },
  { method: 'POST', url: '/api/Patient/discharge/initiate', data: { patientId: 1, dischargeNotes: 'test', followUpInstructions: 'test' } },
  { method: 'POST', url: '/api/Bed/assign', data: { patientId: 1, departmentId: 1 } },
  { method: 'PUT', url: '/api/Bed/1/status', data: { status: 'occupied' } },
  { method: 'GET', url: '/api/Bed' }
];

const run = async () => {
  for (const endpoint of endpoints) {
    try {
      const res = await apiRequest({ method: endpoint.method, url: endpoint.url, data: endpoint.data });
      console.log(`${endpoint.method} ${endpoint.url} =>`, res.status, JSON.stringify(res.data).slice(0, 200));
    } catch (error) {
      console.error(`${endpoint.method} ${endpoint.url} =>`, error.status, error.data || error.message);
    }
  }
};

run();