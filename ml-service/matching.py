import re

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


SKILL_ALIASES = {
    "react": "react.js",
    "react js": "react.js",
    "reactjs": "react.js",
    "react.js": "react.js",

    "next": "next.js",
    "next js": "next.js",
    "nextjs": "next.js",
    "next.js": "next.js",

    "node": "node.js",
    "node js": "node.js",
    "nodejs": "node.js",
    "node.js": "node.js",

    "express js": "express",
    "expressjs": "express",

    "springboot": "spring boot",
    "spring boot": "spring boot",

    "mongo": "mongodb",
    "mongodb": "mongodb",

    "postgres": "postgresql",
    "postgresql": "postgresql",

    "scikit learn": "scikit-learn",
    "scikit-learn": "scikit-learn",

    "ml": "machine learning",
    "machine learning": "machine learning",

    "dl": "deep learning",
    "deep learning": "deep learning",

    "natural language processing": "nlp",
    "nlp": "nlp",
}


def normalize_text(text):
    """
    Normalise un texte général.
    """

    if not isinstance(text, str) or not text.strip():
        return ""

    text = text.lower()

    text = text.replace("node js", "node.js")
    text = text.replace("nodejs", "node.js")

    text = text.replace("react js", "react.js")
    text = text.replace("reactjs", "react.js")

    text = text.replace("next js", "next.js")
    text = text.replace("nextjs", "next.js")

    text = re.sub(
        r"[^a-z0-9+#.\- ]",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


def normalize_skill(skill):
    """
    Convertit une compétence vers son nom canonique.
    """

    if not isinstance(skill, str):
        return ""

    skill = skill.lower().strip()

    skill = re.sub(
        r"\s+",
        " ",
        skill
    )

    return SKILL_ALIASES.get(
        skill,
        skill
    )


def normalize_list(values):
    """
    Normalise une liste de compétences
    et supprime les doublons.
    """

    if not isinstance(
        values,
        (list, tuple, set)
    ):
        return []

    normalized = set()

    for value in values:

        if not isinstance(value, str):
            continue

        skill = normalize_skill(value)

        if skill:
            normalized.add(skill)

    return sorted(normalized)


def calculate_skill_matching(
    resume_skills,
    required_skills,
    preferred_skills
):
    """
    Compare les compétences du CV
    avec celles demandées par l'offre.
    """

    resume_set = set(
        normalize_list(resume_skills)
    )

    required_set = set(
        normalize_list(required_skills)
    )

    preferred_set = set(
        normalize_list(preferred_skills)
    )

    matched_required = (
        resume_set & required_set
    )

    matched_preferred = (
        resume_set & preferred_set
    )

    missing_required = (
        required_set - resume_set
    )

    missing_preferred = (
        preferred_set - resume_set
    )

    if required_set:

        required_score = (
            len(matched_required)
            / len(required_set)
        ) * 100

    else:
        required_score = 100

    if preferred_set:

        preferred_score = (
            len(matched_preferred)
            / len(preferred_set)
        ) * 100

    else:
        preferred_score = 100

    if required_set and preferred_set:

        skill_score = (
            required_score * 0.8
            + preferred_score * 0.2
        )

    elif required_set:

        skill_score = required_score

    elif preferred_set:

        skill_score = preferred_score

    else:

        skill_score = 0

    return {
        "score": round(
            skill_score,
            2
        ),

        "matchedSkills": sorted(
            matched_required
            | matched_preferred
        ),

        "missingSkills": sorted(
            missing_required
            | missing_preferred
        ),
    }


def calculate_text_similarity(
    resume_text,
    job_text
):
    """
    Calcule la similarité TF-IDF
    entre le CV et l'offre.
    """

    resume_text = normalize_text(
        resume_text
    )

    job_text = normalize_text(
        job_text
    )

    if not resume_text or not job_text:
        return 0

    if resume_text == job_text:
        return 100

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2)
    )

    try:

        vectors = vectorizer.fit_transform(
            [
                resume_text,
                job_text
            ]
        )

        similarity = cosine_similarity(
            vectors[0:1],
            vectors[1:2]
        )[0][0]

        return round(
            float(similarity * 100),
            2
        )

    except ValueError:

        return 0


def calculate_keyword_matching(
    resume_text,
    keywords
):
    """
    Compare les mots-clés du CV
    avec ceux de l'offre.
    """

    resume_text = normalize_text(
        resume_text
    )

    normalized_keywords = set(
        normalize_list(keywords)
    )

    if not normalized_keywords:

        return {
            "score": 100,
            "matchedKeywords": [],
            "missingKeywords": [],
        }

    matched_keywords = []
    missing_keywords = []

    for keyword in sorted(
        normalized_keywords
    ):

        pattern = (
            r"(?<![a-z0-9+#])"
            + re.escape(keyword)
            + r"(?![a-z0-9+#])"
        )

        if re.search(
            pattern,
            resume_text
        ):

            matched_keywords.append(
                keyword
            )

        else:

            missing_keywords.append(
                keyword
            )

    score = (
        len(matched_keywords)
        / len(normalized_keywords)
    ) * 100

    return {
        "score": round(
            score,
            2
        ),

        "matchedKeywords":
            matched_keywords,

        "missingKeywords":
            missing_keywords,
    }


def calculate_match(
    resume_text,
    resume_skills,
    job_text,
    required_skills,
    preferred_skills,
    keywords
):
    """
    Calcule le score global de matching.
    """

    skill_result = calculate_skill_matching(
        resume_skills,
        required_skills,
        preferred_skills
    )

    similarity_score = calculate_text_similarity(
        resume_text,
        job_text
    )

    keyword_result = calculate_keyword_matching(
        resume_text,
        keywords
    )

    final_score = (
        skill_result["score"] * 0.50
        + similarity_score * 0.30
        + keyword_result["score"] * 0.20
    )

    return {
        "score": round(
            final_score,
            2
        ),

        "skillsScore":
            skill_result["score"],

        "similarityScore":
            similarity_score,

        "keywordScore":
            keyword_result["score"],

        "experienceScore": None,

        "educationScore": None,

        "matchedSkills":
            skill_result["matchedSkills"],

        "missingSkills":
            skill_result["missingSkills"],

        "matchedKeywords":
            keyword_result["matchedKeywords"],

        "missingKeywords":
            keyword_result["missingKeywords"],
    }