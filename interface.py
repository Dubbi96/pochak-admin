# inference.py
import torch
import torch.nn as nn
import numpy as np
import os

class DummyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()
        self.fc = nn.Linear(3 * 224 * 224, 10)
    def forward(self, x):
        x = self.flatten(x)
        return self.fc(x)

def model_fn(model_dir):
    model = DummyModel()
    model.load_state_dict(torch.load(os.path.join(model_dir, 'model.pth')))
    model.eval()
    return model

def predict_fn(input_data, model):
    if isinstance(input_data, np.ndarray):
        input_tensor = torch.from_numpy(input_data)
    else:
        raise ValueError("입력 데이터는 numpy.ndarray여야 합니다.")

    with torch.no_grad():
        outputs = model(input_tensor)
    return outputs.numpy().tolist()
