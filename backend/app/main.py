from fastapi import FastAPI

app = FastAPI(title="AWS Photobooth API", version="1.0.0")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
