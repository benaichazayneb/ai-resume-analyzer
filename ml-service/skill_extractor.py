import re


TECHNICAL_SKILLS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "c",
    "c++",
    "c#",
    "php",
    "sql",
    "html",
    "css",
    "react.js",
    "next.js",
    "node.js",
    "express",
    "spring",
    "spring boot",
    "django",
    "flask",
    "fastapi",
    "mongodb",
    "mysql",
    "postgresql",
    "oracle",
    "git",
    "github",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "machine learning",
    "deep learning",
    "nlp",
    "natural language processing",
}


SOFT_SKILLS = {
    "communication",
    "teamwork",
    "leadership",
    "problem solving",
    "adaptability",
    "creativity",
    "time management",
    "critical thinking",
    "collaboration",
}


# Variantes d'une même compétence
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

    "nlp": "nlp",
    "natural language processing": "nlp",
}


def normalize_text(text: str) -> str:
    """
    Normalise le texte avant l'extraction.
    """

    if not isinstance(text, str):
        return ""

    text = text.lower()

    # Uniformiser les variantes
    text = text.replace("node js", "node.js")
    text = text.replace("nodejs", "node.js")

    text = text.replace("react js", "react.js")
    text = text.replace("reactjs", "react.js")

    text = text.replace("next js", "next.js")
    text = text.replace("nextjs", "next.js")

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def normalize_skill(skill: str) -> str:
    """
    Retourne le nom canonique d'une compétence.
    """

    if not isinstance(skill, str):
        return ""

    skill = skill.lower().strip()

    skill = re.sub(r"\s+", " ", skill)

    return SKILL_ALIASES.get(skill, skill)


def contains_skill(text: str, skill: str) -> bool:
    """
    Vérifie si une compétence apparaît dans le texte.
    """

    skill = normalize_skill(skill)

    if not skill:
        return False

    # Pour les compétences avec un point
    escaped_skill = re.escape(skill)

    pattern = rf"(?<!\w){escaped_skill}(?!\w)"

    return re.search(
        pattern,
        text,
        flags=re.IGNORECASE
    ) is not None


def extract_skills(text: str) -> dict:
    """
    Extrait les compétences techniques et soft skills.
    """

    normalized_text = normalize_text(text)

    technical_skills = set()
    soft_skills = set()

    for skill in TECHNICAL_SKILLS:

        if contains_skill(normalized_text, skill):
            technical_skills.add(
                normalize_skill(skill)
            )

    for skill in SOFT_SKILLS:

        if contains_skill(normalized_text, skill):
            soft_skills.add(
                normalize_skill(skill)
            )

    return {
        "technicalSkills": sorted(technical_skills),
        "softSkills": sorted(soft_skills),
    }