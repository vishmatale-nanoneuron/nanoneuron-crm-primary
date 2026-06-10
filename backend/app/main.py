import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.models import models
from app.api import auth, reports

Base.metadata.create_all(bind=engine)

app = FastAPI(title="OpsOracle AI API", version="1.0.0")

origins = [
    "https://nanoneuron.ai",
    "https://www.nanoneuron.ai",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(reports.router)

@app.get("/health")
def health():
    return {"status": "ok", "product": "OpsOracle AI"}
