from fastapi import FastAPI
from routes.models import routerModels

app = FastAPI(
    title="MODELS",
    description="Microservicio",
    version="0.0.1"
)

app.include_router(routerModels)


@app.get('/')
def read_root():
    return {"hello":"MODELS"}