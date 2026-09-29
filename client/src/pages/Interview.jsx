import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function Interview() {
  const { token } = useParams();

  // ============================================================
  // DONNÉES ENTRETIEN
  // ============================================================

  const [application, setApplication] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [status, setStatus] = useState("");

  // ============================================================
  // ÉTATS UI
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");

  const [interviewStarted, setInterviewStarted] = useState(false);

  const [aiSpeaking, setAiSpeaking] = useState(false);

  const [listening, setListening] = useState(false);

  const [transcript, setTranscript] = useState("");

  const [recordingTime, setRecordingTime] = useState(0);

  // ============================================================
  // REFS
  // ============================================================

  const videoRef = useRef(null);

  const streamRef = useRef(null);

  const mediaRecorderRef = useRef(null);

  const recordedChunksRef = useRef([]);

  const recognitionRef = useRef(null);

  const recordingTimerRef = useRef(null);

  const answerBufferRef = useRef("");

  const processingAnswerRef = useRef(false);

  const interviewStartedRef = useRef(false);

  const aiSpeakingRef = useRef(false);

  const silenceTimerRef = useRef(null);

  const lastSpeechTimeRef = useRef(0);

  // ============================================================
  // VÉRIFIER L'INVITATION
  // ============================================================

  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/interviews/${token}`);

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

  // ============================================================
  // SYNCHRONISER interviewStarted AVEC LE REF
  // ============================================================

  useEffect(() => {
    interviewStartedRef.current = interviewStarted;
  }, [interviewStarted]);

  // ============================================================
  // CONNECTER LA CAMÉRA AU <VIDEO>
  // ============================================================

  useEffect(() => {
    if (!interviewStarted) {
      return;
    }

    const attachStreamToVideo = async () => {
      if (!videoRef.current || !streamRef.current) {
        return;
      }

      try {
        videoRef.current.srcObject = streamRef.current;

        await videoRef.current.play();

        console.log("✅ Vidéo connectée au stream");

        const videoTracks =
          streamRef.current.getVideoTracks();

        console.log(
          "🎥 Piste vidéo :",
          videoTracks[0]?.readyState
        );

        console.log(
          "🎤 Piste audio :",
          streamRef.current
            .getAudioTracks()[0]?.readyState
        );
      } catch (err) {
        console.error(
          "Erreur lecture vidéo :",
          err
        );
      }
    };

    attachStreamToVideo();
  }, [interviewStarted]);

  // ============================================================
  // NETTOYAGE
  // ============================================================

  useEffect(() => {
    return () => {
      stopSpeechRecognition();
      stopRecordingTimer();

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ============================================================
  // TIMER
  // ============================================================

  const startRecordingTimer = () => {
    setRecordingTime(0);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((previous) => previous + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  // ============================================================
  // CAMERA + MICRO
  // ============================================================

  const initializeMedia = async () => {
    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "La caméra et le microphone ne sont pas disponibles dans ce navigateur."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
            facingMode: "user",
          },
          audio: true,
        });

      streamRef.current = stream;

      console.log("✅ Caméra + microphone activés");

      console.log(
        "🎥 Video tracks :",
        stream.getVideoTracks()
      );

      console.log(
        "🎤 Audio tracks :",
        stream.getAudioTracks()
      );

      return stream;
    } catch (err) {
      console.error(
        "Erreur accès caméra/micro :",
        err
      );

      throw new Error(
        "L'accès à la caméra et au microphone est nécessaire pour commencer l'entretien."
      );
    }
  };

  // ============================================================
  // MEDIA RECORDER
  // ============================================================

  const startRecording = (stream) => {
    recordedChunksRef.current = [];

    let mimeType = "";

    if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9,opus"
      )
    ) {
      mimeType = "video/webm;codecs=vp9,opus";
    } else if (
      MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp8,opus"
      )
    ) {
      mimeType = "video/webm;codecs=vp8,opus";
    } else if (
      MediaRecorder.isTypeSupported("video/webm")
    ) {
      mimeType = "video/webm";
    }

    if (!mimeType) {
      throw new Error(
        "Votre navigateur ne supporte pas l'enregistrement vidéo WebM."
      );
    }

    const recorder = new MediaRecorder(stream, {
      mimeType,
    });

    console.log(
      "🎥 MediaRecorder MIME TYPE :",
      recorder.mimeType
    );

    recorder.onstart = () => {
      console.log("🔴 Enregistrement vidéo démarré");
    };

    recorder.ondataavailable = (event) => {
      if (
        event.data &&
        event.data.size > 0
      ) {
        recordedChunksRef.current.push(
          event.data
        );
      }
    };

    recorder.onerror = (event) => {
      console.error(
        "Erreur MediaRecorder :",
        event
      );

      setError(
        "Une erreur est survenue pendant l'enregistrement."
      );
    };

    recorder.onstop = () => {
      console.log(
        "⏹️ Enregistrement arrêté"
      );
    };

    recorder.start(1000);

    mediaRecorderRef.current = recorder;

    startRecordingTimer();
  };

  // ============================================================
  // STOP RECORDING
  // ============================================================

  const stopRecording = () => {
    return new Promise((resolve) => {
      const recorder =
        mediaRecorderRef.current;

      if (!recorder) {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        stopRecordingTimer();

        const chunks = recordedChunksRef.current;

        if (!chunks.length) {
          resolve(null);
          return;
        }

        /*
         * On force le type final à video/webm.
         * Chrome/Edge utilisent ici WebM avec MediaRecorder.
         * Cela évite qu'un Blob soit envoyé comme text/plain.
         */
        const blob = new Blob(chunks, {
          type: "video/webm",
        });

        console.log(
          "🎥 Vidéo créée :",
          blob.size,
          "bytes"
        );

        console.log(
          "🎥 Type du Blob final :",
          blob.type
        );

        console.log(
          "🎥 Nombre de chunks :",
          chunks.length
        );

        mediaRecorderRef.current = null;

        resolve(blob);
      };

      if (
        recorder.state !== "inactive"
      ) {
        recorder.stop();
      } else {
        resolve(null);
      }
    });
  };

  // ============================================================
  // TEXT TO SPEECH
  // ============================================================

  const speakQuestion = (question) => {
    if (!question) {
      startSpeechRecognition();
      return;
    }

    if (!window.speechSynthesis) {
      startSpeechRecognition();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        question
      );

    utterance.lang = "fr-FR";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setAiSpeaking(true);

      aiSpeakingRef.current = true;

      stopSpeechRecognition();
    };

    utterance.onend = () => {
      setAiSpeaking(false);

      aiSpeakingRef.current = false;

      setTimeout(() => {
        if (
          interviewStartedRef.current &&
          !processingAnswerRef.current
        ) {
          startSpeechRecognition();
        }
      }, 500);
    };

    utterance.onerror = (event) => {
      console.error(
        "Erreur synthèse vocale :",
        event
      );

      setAiSpeaking(false);

      aiSpeakingRef.current = false;

      setTimeout(() => {
        if (
          interviewStartedRef.current &&
          !processingAnswerRef.current
        ) {
          startSpeechRecognition();
        }
      }, 500);
    };

    window.speechSynthesis.speak(
      utterance
    );
  };

  // ============================================================
  // ENVOYER AUTOMATIQUEMENT APRÈS UN SILENCE
  // ============================================================

  const scheduleAnswerSubmission = () => {
    if (silenceTimerRef.current) {
      clearTimeout(
        silenceTimerRef.current
      );
    }

    silenceTimerRef.current =
      setTimeout(() => {
        const answer =
          answerBufferRef.current.trim();

        if (
          answer &&
          !processingAnswerRef.current &&
          interviewStartedRef.current &&
          !aiSpeakingRef.current
        ) {
          console.log(
            "⏱️ Silence détecté, envoi de la réponse..."
          );

          submitVoiceAnswer(answer);
        }
      }, 2000);
  };

  // ============================================================
  // SPEECH RECOGNITION
  // ============================================================

  const startSpeechRecognition = () => {
    if (
      processingAnswerRef.current ||
      aiSpeakingRef.current
    ) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "La reconnaissance vocale n'est pas disponible dans ce navigateur. Utilisez Google Chrome ou Microsoft Edge."
      );

      return;
    }

    // Si déjà active, ne pas recréer
    if (
      recognitionRef.current
    ) {
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "fr-FR";

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log(
        "🎤 Reconnaissance vocale démarrée"
      );

      setListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";

      let interimText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const result =
          event.results[i];

        const text =
          result[0].transcript;

        if (result.isFinal) {
          finalText += text + " ";
        } else {
          interimText += text;
        }
      }

      if (finalText) {
        answerBufferRef.current +=
          finalText;

        lastSpeechTimeRef.current =
          Date.now();

        console.log(
          "📝 Texte reconnu :",
          answerBufferRef.current
        );
      }

      const displayedText =
        (
          answerBufferRef.current +
          interimText
        ).trim();

      setTranscript(
        displayedText
      );

      if (displayedText) {
        scheduleAnswerSubmission();
      }
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      if (
        event.error ===
          "not-allowed" ||
        event.error ===
          "service-not-allowed"
      ) {
        setListening(false);

        setError(
          "L'accès au microphone a été refusé. Autorisez le microphone dans votre navigateur."
        );

        return;
      }

      if (
        event.error === "audio-capture"
      ) {
        setListening(false);

        setError(
          "Le microphone n'est pas disponible."
        );

        return;
      }

      if (
        event.error === "no-speech"
      ) {
        console.log(
          "Aucune parole détectée."
        );
      }
    };

    recognition.onend = () => {
      console.log(
        "🔄 SpeechRecognition terminé"
      );

      setListening(false);

      recognitionRef.current = null;

      if (
        processingAnswerRef.current ||
        aiSpeakingRef.current ||
        !interviewStartedRef.current
      ) {
        return;
      }

      const answer =
        answerBufferRef.current.trim();

      if (answer) {
        /*
         * On NE soumet pas immédiatement.
         * On attend 2 secondes de silence.
         */
        scheduleAnswerSubmission();
      }

      // Relancer la reconnaissance
      setTimeout(() => {
        if (
          interviewStartedRef.current &&
          !processingAnswerRef.current &&
          !aiSpeakingRef.current &&
          !recognitionRef.current
        ) {
          startSpeechRecognition();
        }
      }, 300);
    };

    recognitionRef.current =
      recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error(
        "Impossible de démarrer SpeechRecognition:",
        err
      );

      recognitionRef.current =
        null;
    }
  };

  // ============================================================
  // STOP SPEECH RECOGNITION
  // ============================================================

  const stopSpeechRecognition = () => {
    if (silenceTimerRef.current) {
      clearTimeout(
        silenceTimerRef.current
      );

      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Rien à faire
      }

      recognitionRef.current = null;
    }

    setListening(false);
  };

  // ============================================================
  // ENVOYER LA RÉPONSE VOCALE
  // ============================================================

  const submitVoiceAnswer = async (
    voiceAnswer
  ) => {
    if (
      processingAnswerRef.current
    ) {
      return;
    }

    if (!voiceAnswer.trim()) {
      return;
    }

    processingAnswerRef.current =
      true;

    setProcessing(true);

    setError("");

    stopSpeechRecognition();

    try {
      console.log(
        "📤 Envoi réponse :",
        voiceAnswer
      );

      const response =
        await api.post(
          `/interviews/${token}/answer`,
          {
            answer:
              voiceAnswer.trim(),
          }
        );

      const newStatus =
        response.data.status;

      const newQuestion =
        response.data.currentQuestion;

      setStatus(newStatus);

      setCurrentQuestion(
        newQuestion
      );

      setTranscript("");

      answerBufferRef.current = "";

      // ========================================================
      // ENTRETIEN TERMINÉ
      // ========================================================

      if (
        newStatus === "COMPLETED" ||
        !newQuestion
      ) {
        await finishInterview();

        return;
      }

      // ========================================================
      // QUESTION SUIVANTE
      // ========================================================

      setTimeout(() => {
        speakQuestion(
          newQuestion.question
        );
      }, 500);
    } catch (err) {
      console.error(
        "Erreur réponse vocale:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Impossible de traiter votre réponse."
      );

      setTimeout(() => {
        if (
          interviewStartedRef.current
        ) {
          startSpeechRecognition();
        }
      }, 1000);
    } finally {
      processingAnswerRef.current =
        false;

      setProcessing(false);
    }
  };

  // ============================================================
  // DÉMARRER L'ENTRETIEN
  // ============================================================

  const startInterview = async () => {
    try {
      setStarting(true);

      setError("");

      // ========================================================
      // 1. Activer caméra + microphone
      // ========================================================

      const stream =
        await initializeMedia();

      // ========================================================
      // 2. Créer session backend
      // ========================================================

      const response =
        await api.post(
          `/interviews/${token}/start`
        );

      console.log("🚀 RÉPONSE START INTERVIEW :", response.data);
      console.log("📌 STATUS :", response.data.status);
      console.log("❓ QUESTION :", response.data.currentQuestion);

      setStatus(
        response.data.status
      );

      setCurrentQuestion(
        response.data.currentQuestion
      );

      /*
       * IMPORTANT :
       *
       * On met interviewStarted à true
       * AVANT de connecter la vidéo.
       *
       * Cela force React à créer le <video>.
       */

      setInterviewStarted(true);

      // ========================================================
      // 3. Démarrer l'enregistrement
      // ========================================================

      startRecording(stream);

      // ========================================================
      // 4. Faire parler l'IA
      // ========================================================

      if (
        response.data.currentQuestion
      ) {
        setTimeout(() => {
          speakQuestion(
            response.data.currentQuestion
              .question
          );
        }, 1000);
      }
    } catch (err) {
      console.error(
        "Erreur démarrage entretien:",
        err
      );

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        streamRef.current = null;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible de démarrer l'entretien."
      );
    } finally {
      setStarting(false);
    }
  };

  // ============================================================
  // TERMINER L'ENTRETIEN
  // ============================================================

  const finishInterview = async () => {
    try {
      stopSpeechRecognition();

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // ========================================================
      // Arrêter l'enregistrement
      // ========================================================

      const videoBlob =
        await stopRecording();

      if (!videoBlob) {
        throw new Error(
          "Aucun enregistrement vidéo disponible."
        );
      }

      console.log(
        "🎥 Vidéo finale :",
        videoBlob.size,
        "bytes"
      );

      // ========================================================
      // Arrêter caméra + microphone
      // ========================================================

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        streamRef.current = null;
      }

      setInterviewStarted(false);

      // ========================================================
      // Préparer le fichier
      // ========================================================

      /*
       * Vérifications avant l'envoi.
       */
      console.log(
        "🎥 Type vidéo avant FormData :",
        videoBlob.type
      );

      console.log(
        "🎥 Taille vidéo avant FormData :",
        videoBlob.size
      );

      if (!videoBlob.type.startsWith("video/")) {
        throw new Error(
          `Type vidéo invalide : ${videoBlob.type || "inconnu"}`
        );
      }

      if (videoBlob.size === 0) {
        throw new Error(
          "La vidéo enregistrée est vide."
        );
      }

      const formData = new FormData();

      formData.append(
        "video",
        videoBlob,
        `interview-${Date.now()}.webm`
      );

      formData.append(
        "duration",
        String(recordingTime)
      );

      console.log(
        "📦 FormData vidéo préparée :",
        {
          type: videoBlob.type,
          size: videoBlob.size,
          filename: `interview-${Date.now()}.webm`,
        }
      );

      // ========================================================
      // Envoyer au backend
      // ========================================================

      setProcessing(true);

      await api.post(
        `/interviews/${token}/video`,
        formData
      );

      console.log(
        "✅ Vidéo envoyée avec succès."
      );

      setStatus("COMPLETED");

      setProcessing(false);
    } catch (err) {
      console.error(
        "Erreur fin entretien:",
        err
      );

      setProcessing(false);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Impossible d'enregistrer la vidéo."
      );
    }
  };

  // ============================================================
  // RENDU CHARGEMENT
  // ============================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        Vérification de l'invitation...
      </div>
    );
  }

  // ============================================================
  // INVITATION INVALIDE
  // ============================================================

  if (error && !application) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-xl border border-red-200 bg-white p-8">
          <h1 className="mb-3 text-2xl font-bold">
            Invitation invalide
          </h1>

          <p className="text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const isCompleted =
    status === "COMPLETED" ||
    application?.status ===
      "INTERVIEW_COMPLETED";

  // ============================================================
  // INTERFACE
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <div className="border-b p-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Entretien IA
            </h1>

            <h2 className="mt-2 text-xl font-semibold text-gray-700">
              {application?.job?.title ||
                "Entretien de recrutement"}
            </h2>
          </div>

          {/* ================================================== */}
          {/* ERREUR */}
          {/* ================================================== */}

          {error && (
            <div className="mx-6 mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ================================================== */}
          {/* AVANT ENTRETIEN */}
          {/* ================================================== */}

          {!interviewStarted &&
            !isCompleted && (
              <div className="p-8">
                <div className="mx-auto max-w-2xl text-center">

                  <div className="mb-6 text-6xl">
                    🎥
                  </div>

                  <h2 className="mb-4 text-2xl font-bold">
                    Entretien vidéo avec IA
                  </h2>

                  <p className="mb-6 leading-7 text-gray-600">
                    Cet entretien se déroule sous
                    forme de conversation avec notre
                    intervieweur IA.
                    <br />
                    Votre caméra et votre microphone
                    seront utilisés pendant toute la
                    durée de l'entretien.
                  </p>

                  <div className="mb-8 rounded-xl bg-blue-50 p-5 text-left">

                    <h3 className="mb-3 font-semibold text-blue-900">
                      Avant de commencer
                    </h3>

                    <ul className="space-y-2 text-sm text-blue-800">

                      <li>
                        ✓ Vérifiez votre caméra
                      </li>

                      <li>
                        ✓ Vérifiez votre microphone
                      </li>

                      <li>
                        ✓ Installez-vous dans un
                        endroit calme
                      </li>

                      <li>
                        ✓ Répondez naturellement à
                        voix haute
                      </li>

                      <li>
                        ✓ L'entretien est enregistré
                        pendant toute sa durée
                      </li>

                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={startInterview}
                    disabled={starting}
                    className="rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {starting
                      ? "Préparation de l'entretien..."
                      : "Commencer l'entretien"}
                  </button>

                </div>
              </div>
            )}

          {/* ================================================== */}
          {/* ENTRETIEN EN COURS */}
          {/* ================================================== */}

          {interviewStarted &&
            !isCompleted && (
              <div className="p-6">

                <div className="grid gap-6 lg:grid-cols-3">

                  {/* ======================================== */}
                  {/* VIDEO */}
                  {/* ======================================== */}

                  <div className="lg:col-span-2">

                    <div className="relative overflow-hidden rounded-2xl bg-black">

                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="aspect-video w-full object-cover"
                      />

                      {/* INDICATEUR ENREGISTREMENT */}

                      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm text-white">

                        <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />

                        Enregistrement

                        <span>
                          {formatTime(
                            recordingTime
                          )}
                        </span>

                      </div>
                    </div>
                  </div>

                  {/* ======================================== */}
                  {/* IA STATUS */}
                  {/* ======================================== */}

                  <div className="flex flex-col rounded-2xl border bg-gray-50 p-6">

                    <div className="mb-6 flex items-center gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                        🤖
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          Intervieweur IA
                        </h3>

                        <p className="text-sm text-gray-500">
                          Gemini
                        </p>
                      </div>

                    </div>

                    {/* IA PARLE */}

                    {aiSpeaking && (
                      <div className="rounded-xl bg-blue-100 p-4 text-center">

                        <div className="mb-2 text-2xl">
                          🔊
                        </div>

                        <p className="font-medium text-blue-800">
                          L'IA vous parle...
                        </p>

                      </div>
                    )}

                    {/* CANDIDAT PARLE */}

                    {listening &&
                      !aiSpeaking && (
                        <div className="rounded-xl bg-green-100 p-4 text-center">

                          <div className="mb-2 text-2xl">
                            🎤
                          </div>

                          <p className="font-medium text-green-800">
                            Je vous écoute...
                          </p>

                        </div>
                      )}

                    {/* TRAITEMENT */}

                    {processing && (
                      <div className="rounded-xl bg-yellow-100 p-4 text-center">

                        <div className="mb-2 text-2xl">
                          ⏳
                        </div>

                        <p className="font-medium text-yellow-800">
                          Analyse de votre réponse...
                        </p>

                      </div>
                    )}

                    {/* QUESTION */}

                    {!processing &&
                      currentQuestion && (
                        <div className="mt-6 rounded-xl bg-white p-4">

                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Question actuelle
                          </p>

                          <p className="text-sm leading-6 text-gray-700">
                            {currentQuestion.question}
                          </p>

                        </div>
                      )}

                  </div>
                </div>

                {/* ================================================== */}
                {/* TRANSCRIPTION */}
                {/* ================================================== */}

                <div className="mt-6 rounded-2xl border bg-white p-6">

                  <div className="mb-3 flex items-center justify-between">

                    <h3 className="font-semibold text-gray-800">
                      Votre réponse
                    </h3>

                    {listening && (
                      <span className="text-sm text-green-600">
                        ● Microphone actif
                      </span>
                    )}

                  </div>

                  <div className="min-h-24 rounded-xl bg-gray-50 p-4 text-gray-700">

                    {transcript ? (
                      transcript
                    ) : (
                      <span className="text-gray-400">
                        Votre réponse apparaîtra ici
                        pendant que vous parlez...
                      </span>
                    )}

                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    Répondez naturellement. Votre réponse
                    sera automatiquement détectée après
                    quelques secondes de silence.
                  </p>

                </div>

              </div>
            )}

          {/* ================================================== */}
          {/* FIN */}
          {/* ================================================== */}

          {isCompleted && (
            <div className="p-10 text-center">

              <div className="mb-5 text-6xl">
                ✅
              </div>

              <h2 className="mb-3 text-3xl font-bold text-green-800">
                Entretien terminé
              </h2>

              <p className="mx-auto max-w-xl text-gray-600">
                Merci pour votre participation.
                Votre entretien a été enregistré et
                sera analysé.
              </p>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}