import api from "./api";

export const getAnalyses = async () => {
const response = await api.get("/analysis");
return response.data;
};

export const getAnalysisById = async (id) => {
const response = await api.get(`/analysis/${id}`);
return response.data;
};
