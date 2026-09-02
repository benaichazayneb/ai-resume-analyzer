import api from "./api";

export const createAnalysis = (payload) => api.post("/analysis", payload).then((r) => r.data);

export const getAnalyses = () => api.get("/analysis").then((r) => r.data);

export const getAnalysisById = (id) => api.get(`/analysis/${id}`).then((r) => r.data);

export const deleteAnalysis = (id) => api.delete(`/analysis/${id}`).then((r) => r.data);
