import api from "./api";

// Candidate: postuler avec son CV
export const createApplication = (jobId, resumeId) =>
  api
    .post("/applications", { jobId, resumeId })
    .then((r) => r.data);

// Candidate: consulter ses candidatures
export const getMyApplications = () =>
  api.get("/applications/my").then((r) => r.data);

// Consulter une candidature autorisée
export const getApplicationById = (id) =>
  api.get(`/applications/${id}`).then((r) => r.data);

// Recruiter: consulter les candidatures d'une offre
export const getApplicationsByJob = (jobId) =>
  api
    .get(`/applications/job/${jobId}`)
    .then((r) => r.data);

// Recruiter: lancer le matching
export const runMatchingForJob = (jobId) =>
  api
    .post(`/applications/job/${jobId}/matching`)
    .then((r) => r.data);

// Recruiter: retenir ou refuser un candidat
export const updateApplicationStatus = (
  applicationId,
  status
) =>
  api
    .patch(`/applications/${applicationId}/status`, {
      status,
    })
    .then((r) => r.data);

// Recruiter: envoyer l'invitation
export const sendInterviewInvitation = (applicationId) =>
  api
    .post(
      `/applications/${applicationId}/interview-invitation`
    )
    .then((r) => r.data);