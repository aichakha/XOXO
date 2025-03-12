from transformers import T5Tokenizer, T5ForConditionalGeneration

class Summarizer:
    def __init__(self):
        self.tokenizer = T5Tokenizer.from_pretrained("t5-large")
        self.model = T5ForConditionalGeneration.from_pretrained("t5-large")

    def summarize_text(self, text: str) -> str:
        if not text:
            return "No text provided"
        
        input_ids = self.tokenizer.encode(f"summarize: {text}", return_tensors="pt", max_length=512, truncation=True)
        output = self.model.generate(input_ids, max_length=150, num_beams=2, early_stopping=True)
        return self.tokenizer.decode(output[0], skip_special_tokens=True)
