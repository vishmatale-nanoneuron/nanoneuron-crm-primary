import io
import pandas as pd
from pypdf import PdfReader

def parse_uploaded_file(filename: str, content: bytes) -> tuple[str, int]:
    lower = filename.lower()
    if lower.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(content))
        return df.head(200).to_csv(index=False), len(df)
    if lower.endswith(".xlsx") or lower.endswith(".xls"):
        df = pd.read_excel(io.BytesIO(content))
        return df.head(200).to_csv(index=False), len(df)
    if lower.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages[:10])
        return text[:15000], 0
    raise ValueError("Unsupported file type. Upload CSV, Excel, or PDF.")
