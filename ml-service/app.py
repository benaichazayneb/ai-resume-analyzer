
from flask import Flask, jsonify, request

from preprocessing import clean_text
from skill_extractor import extract_skills
from matching import calculate_match


app = Flask(__name__)


@app.get("/")
def root():
    return jsonify({
        "success": True,
        "message": "AI Resume Analyzer ML Service"
    }), 200


@app.get("/health")
def health():
    return jsonify({
        "success": True,
        "status": "healthy"
    }), 200


@app.post("/api/analyze-text")
def analyze_text():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({
            "success": False,
            "message": "A JSON object is required"
        }), 400

    text = payload.get("text")

    if not isinstance(text, str) or not text.strip():
        return jsonify({
            "success": False,
            "message": "The text field is required"
        }), 400

    cleaned_text = clean_text(text)
    skills = extract_skills(cleaned_text)

    return jsonify({
        "success": True,
        "data": {
            "cleanedText": cleaned_text,
            "technicalSkills": skills.get("technicalSkills", []),
            "softSkills": skills.get("softSkills", [])
        }
    }), 200


@app.post("/api/matching")
def matching():
    payload = request.get_json(silent=True)

    if not isinstance(payload, dict):
        return jsonify({
            "success": False,
            "message": "A JSON object is required"
        }), 400

    resume_text = payload.get("resumeText")
    job_description = payload.get("jobDescription")

    if not isinstance(resume_text, str) or not resume_text.strip():
        return jsonify({
            "success": False,
            "message": "resumeText is required"
        }), 400

    if not isinstance(job_description, str) or not job_description.strip():
        return jsonify({
            "success": False,
            "message": "jobDescription is required"
        }), 400

    list_fields = [
        "resumeSkills",
        "requiredSkills",
        "preferredSkills",
        "keywords"
    ]

    for field in list_fields:
        if field in payload and (
            not isinstance(payload[field], list)
            or not all(isinstance(item, str) for item in payload[field])
        ):
            return jsonify({
                "success": False,
                "message": f"{field} must be a list of strings"
            }), 400

    try:
        result = calculate_match(
            resume_text=resume_text,
            resume_skills=payload.get("resumeSkills", []),
            job_text=job_description,
            required_skills=payload.get("requiredSkills", []),
            preferred_skills=payload.get("preferredSkills", []),
            keywords=payload.get("keywords", [])
        )

        return jsonify({
            "success": True,
            "data": result
        }), 200

    except Exception:
        app.logger.exception("Matching failed")

        return jsonify({
            "success": False,
            "message": "Matching failed"
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=8000,
        debug=True
    )