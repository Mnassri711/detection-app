from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io

app = FastAPI()

# Autorise le backend Express (autre port) à appeler ce service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("best.pt")

@app.get("/")
def health():
    return {"status": "Service actif"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    results = model(image, conf=0.1)[0]

    detections = []
    for box in results.boxes:
        class_id = int(box.cls[0])
        detections.append({
            "className": model.names[class_id],
            "confidence": round(float(box.conf[0]), 3),
            "box": [round(v, 1) for v in box.xyxy[0].tolist()],
        })

    return {"detections": detections}