import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

# Load dataset
DATA_PATH = "data/retail_sales_dataset.csv"
df = pd.read_csv(DATA_PATH)
df = df.fillna("")

# Convert rows to plain text for embedding
documents = df.apply(lambda row: " | ".join(row.astype(str)), axis=1).tolist()

# Load sentence embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Encode all documents
embeddings = model.encode(documents, convert_to_numpy=True)

# Create FAISS index
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

# Search function
def search(query, top_k=5):
    query_vec = model.encode([query])
    distances, indices = index.search(np.array(query_vec), top_k)
    return [documents[i] for i in indices[0]]
