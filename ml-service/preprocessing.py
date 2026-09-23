import re
import spacy


nlp = spacy.load("en_core_web_sm")


def clean_text(text: str) -> str:
    """
    Nettoie le texte extrait du CV.
    """

    if not text:
        return ""

    # Convertir en minuscules
    text = text.lower()

    # Supprimer les emails
    text = re.sub(r"\S+@\S+", " ", text)

    # Supprimer les URLs
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)

    # Garder les caractères alphanumériques
    text = re.sub(r"[^a-zA-Z0-9+#.\s-]", " ", text)

    # Supprimer les espaces multiples
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def preprocess_text(text: str) -> dict:
    """
    Effectue le preprocessing NLP complet.
    """

    cleaned_text = clean_text(text)

    doc = nlp(cleaned_text)

    tokens = []
    lemmas = []

    for token in doc:

        if token.is_space:
            continue

        if token.is_stop:
            continue

        if not token.is_alpha and not token.text.replace("+", "").replace("#", "").isalnum():
            continue

        tokens.append(token.text)
        lemmas.append(token.lemma_)

    return {
        "cleaned_text": cleaned_text,
        "tokens": tokens,
        "lemmas": lemmas,
    }