
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function Interview() {
  const { token } = useParams();

  const [application, setApplication] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const [status, setStatus] = useState("");
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Vérifier l'invitation
  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/interviews/${token}`
        );

        setApplication(response.data.application);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Impossible de vérifier l'invitation."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyInvitation();
    } else {
      setError("Token manquant.");
      setLoading(false);
    }
  }, [token]);

  // Démarrer ou reprendre l'entretien
  const startInterview = async () => {
    try {
      setStarting(true);
      setError("");

      const response = await api.post(
        `/interviews/${token}/start`
      );

      setStatus(response.data.status);
      setCurrentQuestion(response.data.currentQuestion);
      setAnswer(response.data.currentQuestion?.answer || "");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de démarrer l'entretien."
      );
    } finally {
      setStarting(false);
    }
  };

  // Envoyer la réponse et passer à la suivante
  const submitAnswer = async () => {
    if (!answer.trim()) {
      setError("Veuillez saisir une réponse avant de continuer.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.post(
        `/interviews/${token}/answer`,
        { answer }
      );

      setStatus(response.data.status);
      setCurrentQuestion(response.data.currentQuestion);
      setAnswer(response.data.currentQuestion?.answer || "");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible d'enregistrer votre réponse."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        Vérification de l'invitation...
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-xl border border-red-200 bg-white p-8">
          <h1 className="mb-3 text-2xl font-bold">
            Invitation invalide
          </h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const isCompleted =
    status === "COMPLETED" ||
    application?.status === "INTERVIEW_COMPLETED";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold">
          Entretien IA
        </h1>

        <h2 className="mb-2 text-xl font-semibold">
          {application?.job?.title || "Entretien de recrutement"}
        </h2>

        <p className="mb-6 whitespace-pre-line text-gray-600">
          {application?.job?.description || ""}
        </p>

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!currentQuestion && !isCompleted && (
          <>
            <p className="mb-6 text-gray-700">
              Votre invitation a été vérifiée. Cliquez ci-dessous
              pour démarrer ou reprendre votre entretien.
            </p>

            <button
              type="button"
              onClick={startInterview}
              disabled={starting}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {starting
                ? "Préparation..."
                : "Commencer l'entretien"}
            </button>
          </>
        )}

        {currentQuestion && !isCompleted && (
          <div className="mt-8">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-600">
                Question {currentQuestion.index + 1} sur{" "}
                {currentQuestion.total}
              </span>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
                {currentQuestion.type || "Question"}
              </span>
            </div>

            <div className="mb-6 rounded-xl bg-gray-50 p-5">
              <h2 className="text-xl font-semibold">
                {currentQuestion.question}
              </h2>

              {currentQuestion.skill && (
                <p className="mt-3 text-sm text-gray-500">
                  Compétence : {currentQuestion.skill}
                </p>
              )}
            </div>

            <label
              htmlFor="answer"
              className="mb-2 block font-medium text-gray-700"
            >
              Votre réponse
            </label>

            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={7}
              maxLength={10000}
              placeholder="Écrivez votre réponse ici..."
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 p-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            />

            <div className="mt-2 text-right text-sm text-gray-500">
              {answer.length}/10000 caractères
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={submitAnswer}
                disabled={saving || !answer.trim()}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Enregistrement..."
                  : currentQuestion.index + 1 ===
                    currentQuestion.total
                  ? "Terminer l'entretien"
                  : "Enregistrer et continuer"}
              </button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="mt-8 rounded-xl bg-green-50 p-6 text-center">
            <h2 className="mb-3 text-2xl font-bold text-green-800">
              Entretien terminé !
            </h2>

            <p className="text-green-700">
              Vos réponses ont été enregistrées. Merci pour
              votre participation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}