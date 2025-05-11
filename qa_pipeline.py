# Enhanced qa_pipeline.py with summarization for real-time insights
import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from transformers import pipeline

# Load dataset
DATA_PATH = "data/retail_sales_dataset.csv"
df = pd.read_csv(DATA_PATH)
df = df.fillna("")

# Convert rows to plain text for embedding
documents = df.apply(lambda row: " | ".join(row.astype(str)), axis=1).tolist()

# Load embedding and summarization models
model = SentenceTransformer('all-MiniLM-L6-v2')
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

# Encode all documents
embeddings = model.encode(documents, convert_to_numpy=True)

# Create FAISS index
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

# Enhanced search with summarization
def search(query, top_k=5):
    query_vec = model.encode([query])
    distances, indices = index.search(np.array(query_vec), top_k)
    top_matches = [documents[i] for i in indices[0]]

    # Concatenate for summarization
    text_to_summarize = "\n".join(top_matches)
    try:
        summary = summarizer(text_to_summarize[:1024], max_length=60, min_length=20, do_sample=False)[0]['summary_text']
        return [f"🤖 Insight: {summary}"]
    except Exception as e:
        return ["🔎 Retrieved:"] + top_matches