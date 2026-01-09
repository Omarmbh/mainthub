import api from './client';

export const requestsApi = {
    // Get all requests with optional filters
    getAll: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.category) params.append('category', filters.category);
        const query = params.toString();
        return api.get(`/requests${query ? `?${query}` : ''}`);
    },

    // Get dashboard stats
    getStats: () => api.get('/requests/stats'),

    // Get single request with quotes and audit logs
    getById: (id) => api.get(`/requests/${id}`),

    // Create new request
    create: (data) => api.post('/requests', data),

    // Update request
    update: (id, data) => api.patch(`/requests/${id}`, data),

    // Acknowledge request
    acknowledge: (id) => api.post(`/requests/${id}/acknowledge`),

    // Check AMC coverage
    checkAmc: (id) => api.post(`/requests/${id}/check-amc`),

    // Start work
    startWork: (id) => api.post(`/requests/${id}/start-work`),

    // Complete work
    completeWork: (id, notes) => api.post(`/requests/${id}/complete-work`, { notes }),

    // Verify work
    verify: (id, notes) => api.post(`/requests/${id}/verify`, { notes }),

    // Process payment
    processPayment: (id, docs) => api.post(`/requests/${id}/process-payment`, docs),

    // Get audit trail
    getAudit: (id) => api.get(`/requests/${id}/audit`),

    // Quote operations
    getQuotes: (requestId) => api.get(`/requests/${requestId}/quotes`),
    addQuote: (requestId, quote) => api.post(`/requests/${requestId}/quotes`, quote),
    selectQuote: (requestId, quoteId) => api.post(`/requests/${requestId}/quotes/${quoteId}/select`),

    // Approval operations
    approve: (id, comments) => api.post(`/requests/${id}/approve`, { comments }),
    reject: (id, comments) => api.post(`/requests/${id}/reject`, { comments }),
    requestDiscount: (id, targetAmount, comments) =>
        api.post(`/requests/${id}/request-discount`, { target_amount: targetAmount, comments })
};

export default requestsApi;
