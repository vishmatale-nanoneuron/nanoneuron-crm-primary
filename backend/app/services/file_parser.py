import io
import pandas as pd
from pypdf import PdfReader

def parse_uploaded_file(filename: str, content: bytes) -> tuple[str, int]:
    lower = filename.lower()
    if lower.endswith(".csv"):
        try:
            df = pd.read_csv(io.BytesIO(content))
            return df.head(200).to_csv(index=False), len(df)
        except Exception as exc:
            raise ValueError(f"Could not parse CSV: {exc}")
    if lower.endswith(".xlsx") or lower.endswith(".xls"):
        try:
            df = pd.read_excel(io.BytesIO(content))
            return df.head(200).to_csv(index=False), len(df)
        except Exception as exc:
            raise ValueError(f"Could not parse Excel file: {exc}")
    if lower.endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages[:10])
            if not text.strip():
                raise ValueError("PDF appears to be empty or image-only. Upload a text-based PDF.")
            return text[:15000], 0
        except ValueError:
            raise
        except Exception as exc:
            raise ValueError(f"Could not read PDF: {exc}. Ensure the file is not password-protected or corrupted.")
    raise ValueError("Unsupported file type. Upload CSV, Excel, or PDF.")
