from fastapi import FastAPI, UploadFile, File
import whisper
import torch

app = FastAPI()

# Charger le modèle Whisper
model = whisper.load_model("base")

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    contents = await file.read()
    with open("temp_audio.wav", "wb") as f:
        f.write(contents)
    
    # Transcrire l'audio en texte
    result = model.transcribe("cafe_converted.mp3")
    
    return {"text": result["text"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

