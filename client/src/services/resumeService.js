import api from "./api";

export const uploadResume = (file, onUploadProgress) => {
  const formData = new FormData();

  formData.append("resume", file);

  return api
    .post("/resumes/upload", formData, {
      onUploadProgress,
    })
    .then((r) => r.data);
};

export const getResumes = () =>
  api.get("/resumes").then((r) => r.data);

export const getResumeById = (id) =>
  api.get(`/resumes/${id}`).then((r) => r.data);

export const deleteResume = (id) =>
  api.delete(`/resumes/${id}`).then((r) => r.data);