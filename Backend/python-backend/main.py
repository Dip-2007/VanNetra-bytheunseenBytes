import os
import shutil
import re
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import easyocr
from transformers import pipeline

# ---------- FastAPI App ----------
app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary uploads folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize OCR reader
ocr_reader = easyocr.Reader(["en"], gpu=False)

# Initialize Hugging Face NER pipeline (better multilingual model)
ner_pipeline = pipeline(
    "token-classification",
    model="Davlan/xlm-roberta-large-ner-hrl",  # better for Indian names/places
    grouped_entities=True
)

# ---------- OCR CLEANING ----------
def clean_text(text: str) -> str:
    # Keep only alphanumeric, punctuation, spaces
    text = re.sub(r"[^A-Za-z0-9\s.,:/\-]", " ", text)
    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text)
    # Remove standalone 1–2 letter junk tokens
    text = " ".join([w for w in text.split() if len(w) > 2])
    return text.strip()

# ---------- OCR FUNCTION ----------
def run_ocr(file_path: str) -> str:
    results = ocr_reader.readtext(file_path)
    raw_text = " ".join([res[1] for res in results])
    return clean_text(raw_text)

# ---------- ENTITY POST-PROCESSING ----------
def merge_entities(entities, min_score=0.85):
    merged = {}
    for ent in entities:
        if ent["score"] < min_score:
            continue  # skip low-confidence
        key = ent["entity_group"]
        word = ent["word"].replace("##", "")
        word = word.title()
        merged.setdefault(key, []).append(word)

    # Deduplicate + join consecutive tokens
    for k in merged:
        merged[k] = [" ".join(dict.fromkeys(merged[k]))]
    return merged

# ---------- ENTITY EXTRACTION ----------
def run_ner(text: str):
    entities = ner_pipeline(text)
    return merge_entities(entities)

# ---------- CUSTOM FIELD EXTRACTION ----------
def extract_patfields(text: str):
    patterns = {
        "Patta Holder Name": r"(?:Patta Holder|Holder Name)[:\- ]+([A-Za-z\s]{1,50})",
        "Village": r"Village[:\- ]+([A-Za-z\s]{1,50})",
        "District": r"District[:\- ]+([A-Za-z\s]{1,50})",
        "State": r"State[:\- ]+([A-Za-z\s]{1,50})",
        "Claim Type": r"Claim Type[:\- ]+([A-Za-z]{1,30})",
        "ID": r"ID[:\- ]+(\w{3,20})",
    }

    fields = {}
    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        fields[key] = match.group(1).strip() if match else None
    return fields

# ---------- API ROUTE ----------
@app.post("/ocr/process")
async def process_document(file: UploadFile = File(...)):
    temp_file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    try:
        # Save uploaded file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run OCR
        text = run_ocr(temp_file_path)

        # Run NER
        entities = run_ner(text)

        # Extract Patta fields
        patta_fields = extract_patfields(text)

        response = {
            "ocr_text": text,
            "entities": {**entities, **patta_fields},
        }

        return response
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
