from fastapi import FastAPI
from routes.games import routerGames



app = FastAPI(
    title="Games",
    description="Microservicio",
    version="0.0.1"
)

app.include_router(routerGames)

@app.get('/')
def read_root():
    return {"hello":"GAMES"}