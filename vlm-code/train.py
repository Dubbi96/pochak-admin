import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset

class DummyDataset(Dataset):
    def __len__(self):
        return 100
    def __getitem__(self, idx):
        x = torch.randn(3, 224, 224)
        y = torch.tensor(0)
        return x, y

class DummyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()
        self.fc = nn.Linear(3 * 224 * 224, 10)
    def forward(self, x):
        x = self.flatten(x)
        return self.fc(x)

def train_fn():
    dataset = DummyDataset()
    loader = DataLoader(dataset, batch_size=8, shuffle=True)
    model = DummyModel()
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters())

    for epoch in range(3):
        for x, y in loader:
            output = model(x)
            loss = criterion(output, y)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
    torch.save(model.state_dict(), '/opt/ml/model/model.pth')

if __name__ == '__main__':
    train_fn()

