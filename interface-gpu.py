import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import io
import json

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 모델 로딩
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def model_fn(model_dir):
    return model

def predict_fn(input_data, model):
    image_bytes = input_data["image"]
    text = input_data["text"]

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(text=[text], images=image, return_tensors="pt", padding=True).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        logits_per_image = outputs.logits_per_image
        probs = logits_per_image.softmax(dim=1)

    return {"probability": probs.cpu().tolist()}
