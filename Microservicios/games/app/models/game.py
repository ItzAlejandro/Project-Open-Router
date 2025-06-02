from typing import Optional
from pydantic import BaseModel, Field

class Game(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., title="Nombre del juego", min_length=1, max_length=100)
    description: str = Field(..., title="Descripción", min_length=1, max_length=500)
    rulesheet: str = Field(..., title="Rulesheet (enlace o descripción)")
    players: int = Field(..., title="Número de jugadores", gt=0, lt=100)
    editable: bool = Field(..., title = "El juego es editable")