#Sans onnx:
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import gc
import time

# Charger tokenizer et modèle PyTorch
tokenizer = AutoTokenizer.from_pretrained("google/long-t5-tglobal-base")
model = AutoModelForSeq2SeqLM.from_pretrained("google/long-t5-tglobal-base")

# Forcer CPU pour le modèle
# Si CUDA est disponible, utiliser le GPU// 16/05/2025
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
model.eval()

# Paramètres pour différents types de résumés
SUMMARY_TYPES = {
    "small": {"min": 30, "max": 128, "beams": 2, "penalty": 1.0, "sample": False},
    "medium": {"min": 80, "max": 256, "beams": 3, "penalty": 1.2, "sample": False},
    "large": {"min": 160, "max": 512, "beams": 4, "penalty": 1.5, "sample": False}
}

def preprocess_text(text):
    prefixes = [
        "Summarize: ",
        "Summarize this for me: ",
        "Provide a summary of the following: ",
        "Generate a concise summary: "
    ]
    if len(text) < 1000:
        prefix = prefixes[0]
    elif len(text) < 3000:
        prefix = prefixes[1]
    elif len(text) < 6000:
        prefix = prefixes[2]
    else:
        prefix = prefixes[3]
    return prefix + text

def summary(text: str, summary_type: str = "medium", max_input_len=2048) -> dict:
    summary_type = summary_type.lower()
    if summary_type not in SUMMARY_TYPES:
        raise ValueError("Type de résumé invalide. Choisir entre 'small', 'medium' ou 'large'.")

    lengths = SUMMARY_TYPES[summary_type]
    min_output_len = lengths["min"]
    max_output_len = lengths["max"]
    beam_count = lengths["beams"]
    length_penalty = lengths["penalty"]
    do_sample = lengths["sample"]

    processed_text = preprocess_text(text)

    if len(text) < 1000:
        max_input_len = min(max_input_len, 1024)

    inputs = tokenizer(
        processed_text,
        return_tensors="pt",
        max_length=max_input_len,
        truncation=True
    ).to(device)

    start_time = time.time()
    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_length=max_output_len,
            min_length=min_output_len,
            num_beams=beam_count,
            length_penalty=length_penalty,
            no_repeat_ngram_size=3,
            early_stopping=True,
            temperature=0.8 if do_sample else 1.0,
            top_p=0.95 if do_sample else 1.0,
            top_k=50 if do_sample else 0,
            do_sample=do_sample,
            use_cache=True
        )
    end_time = time.time()
    processing_time = end_time - start_time
    generated_summary = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Nettoyage
    del inputs, outputs
    gc.collect()
    if device.type == "cuda":
        torch.cuda.empty_cache()

    return {
        "summary": generated_summary,
        "processing_time": processing_time
    }

def get_summary(text: str, summary_type: str = "medium", max_input_len=2048) -> dict:
    try:
        result = summary(text, summary_type, max_input_len)
        return {
            "summary": result["summary"],
            "length": len(result["summary"].split()),
            "summary_type": summary_type,
            "processing_time": result["processing_time"]
        }
    except Exception as e:
        raise ValueError(f"Erreur lors du résumé: {str(e)}")
