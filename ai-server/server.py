from fastapi import FastAPI, UploadFile, File, Form
import whisper
import os
import shutil
import requests
from file import convert_audio

app = FastAPI()

# Charger le modèle Whisper
model = whisper.load_model("base")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
