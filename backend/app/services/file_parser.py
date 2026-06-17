import io
import pandas as pd
from pypdf import PdfReader


def _read_csv(content: bytes) -> pd.DataFrame:
    """Try common encodings — Indian Excel exports are often cp1252/latin-1, not UTF-8."""
    for enc in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            return pd.read_csv(io.BytesIO(content), encoding=enc)
        except UnicodeDecodeError:
            continue
    raise ValueError("Could not decode CSV — open in Excel, Save As → CSV UTF-8, and re-upload.")


def parse_uploaded_file(filename: str, content: bytes) -> tuple[str, int]:
    lower = filename.lower()
    if lower.endswith(".csv"):
        try:
            df = _read_csv(content)
            return df.head(200).to_csv(index=False), len(df)
        except ValueError:
            raise
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
