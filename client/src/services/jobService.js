import api from "./api";

export const createJob = (payload) => api.post("/jobs", payload).then((r) => r.data);

export const getJobs = () => api.get("/jobs").then((r) => r.data);

export const getJobById = (id) => api.get(`/jobs/${id}`).then((r) => r.data);

export const deleteJob = (id) => api.delete(`/jobs/${id}`).then((r) => r.data);
