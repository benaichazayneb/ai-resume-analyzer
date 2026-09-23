from preprocessing import preprocess_text
from skill_extractor import extract_skills


text = """
Software Engineer with experience in Python, JavaScript,
React, Node.js, MongoDB and Docker.

Strong communication, teamwork and problem solving skills.
"""


print("\n PREPROCESSING ")

result = preprocess_text(text)

print("Cleaned text:")
print(result["cleaned_text"])

print("\nTokens:")
print(result["tokens"])

print("\nLemmas:")
print(result["lemmas"])


print("\n SKILL EXTRACTION ")

skills = extract_skills(text)

print("Technical skills:")
print(skills["technicalSkills"])

print("\nSoft skills:")
print(skills["softSkills"])