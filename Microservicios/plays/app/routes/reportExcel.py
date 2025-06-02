from fastapi import APIRouter,HTTPException
from bson import ObjectId
from models.reportModel import ItemGame
import httpx
from config.database import partidas_collection, collection_response
from fastapi.responses import StreamingResponse
from io import BytesIO
from openpyxl import Workbook

routerReporteExcel =APIRouter()



@routerReporteExcel.get('/reporte/{id}',tags=['Reporte'])
async def get_reporte(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID invalido")
    
    partida = await partidas_collection.find_one({"_id": ObjectId(id)})
    if not partida:
        return {"error": "Partida no encontrada"}
    
    partida_obj = ItemGame(
        juego=partida['juego'],
        numberGames=partida.get('numberGames'),
        responses=[]
    )
    
    respuestas_cursor = collection_response.find({"idPartida": id})
    respuestas = await respuestas_cursor.to_list(length=None)

    wb = Workbook()
    ws = wb.active
    ws.title = "Reporte Partida"

    headers = ["Game","NumberGame","Move", "Reason", "Result", "Model", "Player", "Is_winner","tiempo_respuesta","juego_number"]
    ws.append(headers)

    for r in respuestas:
        ws.append([
            partida_obj.juego,
            partida_obj.numberGames,
            r.get("move", ""),
            r.get("reason", ""),
            r.get("result", ""),
            r.get("model", ""),
            r.get("player", ""),
            "Sí" if r.get("is_winner") in [True, "true", "SI", "Si", "si"] else "No",
            r.get("tiempo_respuesta", ""),
            r.get("juego_number", ""),
        ])

    stream = BytesIO()
    wb.save(stream)
    stream.seek(0)

    filename = f"reporte_partida_{id}.xlsx"
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        })