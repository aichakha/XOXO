from fastapi import FastAPI, UploadFile, File, Form
import whisper
import torch
import mimetypes
import requests
import os

app = FastAPI()

# Charger le modèle Whisper
model = whisper.load_model("base")

@app.post("/transcribe/")
async def transcribe_audio(
    file: UploadFile = File(None),
    url: str = Form(None)  # Permet d'accepter une URL
):
    audio_path = "temp_audio.wav"  

    if file:
        # Vérifier si c'est bien un fichier audio
        mime_type, _ = mimetypes.guess_type(file.filename)
        if not mime_type or not mime_type.startswith("audio"):
            return {"error": "Le fichier sélectionné n'est pas un fichier audio."}

        # Sauvegarder le fichier uploadé
        contents = await file.read()
        with open(audio_path, "wb") as f:
            f.write(contents)

    elif url:
        # Télécharger le fichier depuis l'URL
        response = requests.get(url)
        if response.status_code != 200:
            return {"error": "Impossible de télécharger le fichier depuis l'URL."}

        # Vérifier si le fichier est bien un fichier audio
        mime_type, _ = mimetypes.guess_type(url)
        if not mime_type or not mime_type.startswith("audio"):
            return {"error": "L'URL fournie ne pointe pas vers un fichier audio."}

        with open(audio_path, "wb") as f:
            f.write(response.content)

    else:
        return {"error": "Aucun fichier ou URL fourni."}

    # Transcrire l'audio en texte
    result = model.transcribe(audio_path)

    # Supprimer le fichier temporaire après utilisation
    os.remove(audio_path)

    return {"text": result["text"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
