from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Partida(BaseModel):
    codeUnique: str
    apikey: Optional[str]
    apiKeyOpenAi: Optional[str] 
    fecha: datetime
    gameType: str
    ia1: str
    ia2: str
    juego: str
    numberGames: int
    prompt: str
