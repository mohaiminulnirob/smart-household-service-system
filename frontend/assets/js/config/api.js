export const API_BASE_URL = '/api';

export const ENDPOINTS = {
  AUTH: {
    REGISTER_USER: '/auth/register/user',
    REGISTER_WORKER: '/auth/register/worker',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USER: {
  GET_PROFILE: (id) => `/users/profile/${id}`,
  UPDATE_PROFILE: (id) => `/users/profile/update/${id}`,
  },
  ADMIN: {
    PENDING_WORKERS: '/admin/workers/pending',
    APPROVE_WORKER: (id) => `/admin/workers/${id}/approve`,
    REJECT_WORKER: (id) => `/admin/workers/${id}/reject`,
    WORK_REQUESTS: '/admin/work-requests',
    GET_PROFILE: '/admin/profile',
    UPDATE_PROFILE: '/admin/profile/update',
  },
  WORKERS: {
    GET_PROFILE: (id) => `/workers/profile/${id}`,
    UPDATE_PROFILE: (id) => `/workers/profile/update/${id}`,
    UPDATE_STATUS: (id) => `/workers/${id}/status`,
    UPDATE_LOCATION: (id) => `/workers/${id}/location`,
    GET_REQUESTS: (id) => `/workers/${id}/requests`,
    GET_RATINGS: (id) => `/workers/${id}/ratings`,
    GET_NEARBY: '/workers/nearby',
  },
  REQUESTS: {
    CREATE: '/requests',
    USER_REQUESTS: (id) => `/requests/user/${id}`,
    WORKER_REQUESTS: (id) => `/requests/worker/${id}`,
    COMPLETE: (id) => `/requests/${id}/complete`,
    ACCEPT: (id) => `/requests/${id}/accept`,
    REJECT: (id) => `/requests/${id}/reject`,
    CANCEL: (id) => `/requests/${id}/cancel`,
  },
  RATINGS: {
    ADD: '/ratings',
    GET_WORKER_RATINGS: (id) => `/ratings/worker/${id}`,
  },
};
