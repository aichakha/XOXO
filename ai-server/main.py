from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import whisper
import os
import mimetypes
import shutil
import requests
from summarize import Summarizer
from fastapi.middleware.cors import CORSMiddleware
from file import convert_audio
from translate import translate_marian

app = FastAPI()

# 🔒 Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚀 Charger les modèles
model = whisper.load_model("base")
summarizer = Summarizer()

@app.post("/transcribe/")
async def transcribe_audio(
    file: UploadFile = File(...),
    url: str = Form(None)
):
    try:
        # Si un fichier est téléchargé
        if file:
            # Enregistrer temporairement le fichier uploadé
            temp_file_path = f"temp_uploaded{os.path.splitext(file.filename)[1]}"
            with open(temp_file_path, "wb") as f:
                f.write(await file.read())

            # Convertir le fichier en MP3 si nécessaire
            converted_path = convert_audio(temp_file_path)
            if converted_path is None:
                return {"error": "Échec de la conversion du fichier en MP3."}

            audio_path = converted_path  # Utiliser le fichier converti

        # Si une URL est fournie
        elif url:
            # Télécharger le fichier depuis l'URL
            temp_file_path = "temp_downloaded_audio"
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    with open(temp_file_path, "wb") as f:
                        f.write(response.content)
                    
                    # Convertir le fichier téléchargé en MP3
                    converted_path = convertir_fichier_en_mp3(temp_file_path)
                    if converted_path is None:
                        return {"error": "Échec de la conversion du fichier en MP3."}
                    
                    audio_path = converted_path  # Utiliser le fichier converti
                else:
                    return {"error": "Impossible de télécharger le fichier depuis l'URL."}
            except Exception as e:
                return {"error": f"Erreur lors du téléchargement du fichier: {str(e)}"}

        else:
            return {"error": "Aucun fichier ou URL fourni."}

        # Transcrire l'audio en texte avec Whisper
        result = model.transcribe(audio_path)

        # Supprimer le fichier après transcription
        os.remove(audio_path)

        return {"text": result["text"]}

    except Exception as e:
        return {"error": f"Une erreur est survenue: {str(e)}"}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    file_path = f"temp_{file.filename}"

    # 📂 Sauvegarde le fichier
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print(f"📂 Fichier reçu et enregistré: {file_path}")

    # 🔄 Transcription avec Whisper
    result = model.transcribe(file_path)

    print(f"📝 Transcription obtenue: {result['text']}")

    return {"text": result["text"]}

#résumé:
@app.post("/summarize/")
async def summarize_text(data: dict):
    text = data.get('text', '')
    if not text:
        raise HTTPException(status_code=400, detail="Aucun texte fourni.")
    
    summary = summarizer.summarize_text(text)
    return {"summary": summary}
#traduction:
@app.post("/translate/")
async def translate_text(data: dict):
    text = data.get("text")
    src_lang = data.get("src_lang", "").lower()
    tgt_lang = data.get("tgt_lang", "").lower()  # Assurer que c'est bien une chaîne en minuscules
    
    allowed_languages = ["fr", "es", "de", "it", "pt", "nl", "pl", "ru", "ja", "zh", "ko"]

    # Vérifier si le texte est fourni
    if not text:
        raise HTTPException(status_code=400, detail="Aucun texte fourni.")

    # Vérifier si la langue cible est supportée
    if tgt_lang not in allowed_languages:
        raise HTTPException(status_code=400, detail=f"Langue cible non supportée: {tgt_lang}. Langues supportées: {allowed_languages}")

    try:
        # Traduire avec Marian
        translation = translate_marian(text, src_lang, tgt_lang)
        return {"translation": translation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la traduction: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)


