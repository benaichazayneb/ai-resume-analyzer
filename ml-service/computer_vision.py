import cv2
import sys
import json
import os


def analyze_video(video_path):
    if not video_path:
        raise Exception("Chemin vidéo manquant.")

    if not os.path.exists(video_path):
        raise Exception(
            f"Vidéo introuvable : {video_path}"
        )

    # ==========================================================
    # OUVRIR LA VIDÉO
    # ==========================================================

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise Exception(
            "Impossible d'ouvrir la vidéo."
        )

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    fps = cap.get(
        cv2.CAP_PROP_FPS
    )

    width = int(
        cap.get(cv2.CAP_PROP_FRAME_WIDTH)
    )

    height = int(
        cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
    )

    duration = 0

    if fps > 0:
        duration = total_frames / fps

    # ==========================================================
    # CLASSIFICATEUR VISAGE
    # ==========================================================

    cascade_path = cv2.data.haarcascades + (
        "haarcascade_frontalface_default.xml"
    )

    face_cascade = cv2.CascadeClassifier(
        cascade_path
    )

    if face_cascade.empty():
        cap.release()

        raise Exception(
            "Impossible de charger le détecteur de visage."
        )

    # ==========================================================
    # VARIABLES
    # ==========================================================

    frames_analyzed = 0
    frames_with_face = 0

    brightness_values = []

    face_sizes = []

    previous_face_center = None
    movement_count = 0

    # Analyser environ 1 frame sur 10
    frame_step = 10

    frame_index = 0

    # ==========================================================
    # ANALYSE DES FRAMES
    # ==========================================================

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        frame_index += 1

        if frame_index % frame_step != 0:
            continue

        frames_analyzed += 1

        # ------------------------------------------------------
        # LUMINOSITÉ
        # ------------------------------------------------------

        gray = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2GRAY
        )

        brightness = float(
            gray.mean()
        )

        brightness_values.append(
            brightness
        )

        # ------------------------------------------------------
        # DÉTECTION VISAGE
        # ------------------------------------------------------

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(80, 80)
        )

        if len(faces) == 0:
            continue

        frames_with_face += 1

        # Prendre le visage principal
        # = visage le plus grand
        face = max(
            faces,
            key=lambda rectangle:
            rectangle[2] * rectangle[3]
        )

        x, y, w, h = face

        face_sizes.append(
            (w * h) / (width * height)
            if width > 0 and height > 0
            else 0
        )

        # ------------------------------------------------------
        # CENTRE DU VISAGE
        # ------------------------------------------------------

        center_x = x + (w / 2)
        center_y = y + (h / 2)

        current_center = (
            center_x,
            center_y
        )

        # ------------------------------------------------------
        # MOUVEMENT DE LA TÊTE
        # ------------------------------------------------------

        if previous_face_center is not None:

            previous_x, previous_y = (
                previous_face_center
            )

            movement = (
                abs(center_x - previous_x)
                + abs(center_y - previous_y)
            )

            # Seuil volontairement simple
            if movement > 30:
                movement_count += 1

        previous_face_center = (
            current_center
        )

    cap.release()

    # ==========================================================
    # CALCULS
    # ==========================================================

    if frames_analyzed > 0:
        detection_rate = (
            frames_with_face
            / frames_analyzed
        ) * 100
    else:
        detection_rate = 0

    if brightness_values:
        average_brightness = (
            sum(brightness_values)
            / len(brightness_values)
        )
    else:
        average_brightness = 0

    if face_sizes:
        average_face_visibility = (
            sum(face_sizes)
            / len(face_sizes)
        ) * 100
    else:
        average_face_visibility = 0

    # ==========================================================
    # OBSERVATIONS
    # ==========================================================

    face_observations = []

    if detection_rate >= 90:
        face_observations.append(
            "Le visage est détecté sur la majorité des frames analysées."
        )

    elif detection_rate >= 60:
        face_observations.append(
            "Le visage est généralement visible pendant l'entretien."
        )

    elif detection_rate > 0:
        face_observations.append(
            "Le visage est détecté de manière intermittente."
        )

    else:
        face_observations.append(
            "Aucun visage n'a été détecté dans les frames analysées."
        )

    # ==========================================================
    # LUMINOSITÉ
    # ==========================================================

    quality_observations = []

    if average_brightness < 50:

        quality_observations.append(
            "La vidéo présente une luminosité faible."
        )

    elif average_brightness > 200:

        quality_observations.append(
            "La vidéo présente une luminosité élevée."
        )

    else:

        quality_observations.append(
            "La luminosité de la vidéo est globalement correcte."
        )

    # ==========================================================
    # MOUVEMENTS
    # ==========================================================

    head_observations = []

    if movement_count == 0:

        head_observations.append(
            "Peu de mouvements importants du visage ont été détectés."
        )

    elif movement_count < 10:

        head_observations.append(
            "Quelques mouvements du visage ont été détectés."
        )

    else:

        head_observations.append(
            "Plusieurs mouvements du visage ont été détectés pendant l'entretien."
        )

    # ==========================================================
    # PRÉSENCE
    # ==========================================================

    presence_observations = []

    if detection_rate >= 80:

        presence_observations.append(
            "Le candidat est visuellement présent sur la majorité de la vidéo."
        )

    elif detection_rate >= 40:

        presence_observations.append(
            "La présence visuelle du candidat est partiellement détectée."
        )

    else:

        presence_observations.append(
            "La présence visuelle est limitée dans les frames analysées."
        )

    # ==========================================================
    # RÉSUMÉ
    # ==========================================================

    summary = (
        f"{frames_analyzed} frames ont été analysées. "
        f"Le visage a été détecté sur "
        f"{detection_rate:.1f}% des frames."
    )

    # ==========================================================
    # RÉSULTAT
    # ==========================================================

    return {
        "status": "COMPLETED",

        "faceDetection": {
            "detected": frames_with_face > 0,
            "detectionRate": round(
                detection_rate,
                2
            )
        },

        "faceVisibility": {
            "averageVisibility": round(
                average_face_visibility,
                2
            ),
            "observations": face_observations
        },

        "gaze": {
            "observations": [
                "La direction précise du regard n'est pas déterminée par cette version de l'analyse."
            ]
        },

        "headMovement": {
            "observations": head_observations
        },

        "videoQuality": {
            "brightness": round(
                average_brightness,
                2
            ),
            "observations": quality_observations
        },

        "presence": {
            "observations": presence_observations
        },

        "summary": summary,

        "analyzedAt": None,

        "error": ""
    }


# ==========================================================
# MAIN
# ==========================================================

if __name__ == "__main__":

    try:

        if len(sys.argv) < 2:
            raise Exception(
                "Le chemin de la vidéo est obligatoire."
            )

        video_path = sys.argv[1]

        result = analyze_video(
            video_path
        )

        print(
            json.dumps(
                result,
                ensure_ascii=False
            )
        )

    except Exception as error:

        result = {
            "status": "FAILED",
            "faceDetection": {
                "detected": False,
                "detectionRate": 0
            },
            "faceVisibility": {
                "averageVisibility": 0,
                "observations": []
            },
            "gaze": {
                "observations": []
            },
            "headMovement": {
                "observations": []
            },
            "videoQuality": {
                "brightness": 0,
                "observations": []
            },
            "presence": {
                "observations": []
            },
            "summary": "",
            "analyzedAt": None,
            "error": str(error)
        }

        print(
            json.dumps(
                result,
                ensure_ascii=False
            )
        )

        sys.exit(1)