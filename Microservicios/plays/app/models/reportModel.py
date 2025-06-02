from pydantic import BaseModel
from typing import List

class ItemGame(BaseModel):
    juego: str
    numberGames: int
    responses: List['ResponseGame'] = None

class ResponseGame(BaseModel):
    move: int 
    reason: str
    result: str
    model: str
    player: str
    is_winner: bool
