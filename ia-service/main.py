from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TexteRequest(BaseModel):
    texte: str
    contexte: str = ""

client = Groq(api_key="YOUR_GROQ_API_KEY")

@app.post("/ameliorer")
def ameliorer(req: TexteRequest):
    if not req.texte.strip():
        return {"erreur": "Texte vide"}

    if req.contexte == "description_offre":
        prompt = f"""Tu es un expert en rédaction professionnelle.
Reformule cette description d'offre de stage/emploi pour la rendre plus claire, attractive et professionnelle.
Réponds uniquement avec le texte amélioré, sans explication.

Texte original :
{req.texte}"""
    else:
        prompt = f"""Tu es un expert en communication professionnelle.
Reformule ce message pour le rendre plus clair, poli et professionnel.
Réponds uniquement avec le texte amélioré, sans explication.

Message original :
{req.texte}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return {"texte_ameliore": response.choices[0].message.content}

@app.get("/health")
def health():
    return {"status": "ok"}
import fitz  # pymupdf
import os

@app.post("/analyser-cv")
def analyser_cv(req: dict):
    cv_filename = req.get("cv", "")
    description_offre = req.get("descriptionOffre", "")

    # Lire le PDF
    cv_path = f"E:/PFE/frond/src/assets/cv/uploads/{cv_filename}"
    
    if not os.path.exists(cv_path):
        return {"erreur": "CV introuvable"}

    doc = fitz.open(cv_path)
    cv_text = ""
    for page in doc:
        cv_text += page.get_text()
    doc.close()

    if not cv_text.strip():
        return {"erreur": "CV vide ou illisible"}

    prompt = f"""Tu es un recruteur expert.
Analyse ce CV par rapport à cette offre de stage/emploi.
Donne un score de 0 à 100 et une décision parmi : ACCEPTÉ, EN_ATTENTE, REJETÉ.
Réponds UNIQUEMENT en JSON valide, sans explication, sans markdown :
{{"score": 75, "decision": "ACCEPTÉ", "raison": "..."}}

Offre :
{description_offre}

CV :
{cv_text[:3000]}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    import json
    try:
        result = json.loads(response.choices[0].message.content)
        return result
    except:
        return {"score": 0, "decision": "ERREUR", "raison": "Impossible d'analyser"}