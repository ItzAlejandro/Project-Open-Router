from fastapi import APIRouter,HTTPException
from models.game import Game
from config.database import collection_game, collection_act
from schema.schemas import list_game, individual_game
from bson import ObjectId
from fastapi.responses import  JSONResponse

routerGames =APIRouter()

@routerGames.get('/game',tags=['Game'])
async def get_games():
    cursor = collection_game.find()  #
    games = await cursor.to_list()  
    if games :
        return list_game(games) 
    
    raise HTTPException(status_code=204, detail="No existen juegos")


@routerGames.get('/game/{id}',tags=['Game'])
async def getgamebyid( id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID invalido")
    game = await collection_game.find_one({"_id": ObjectId(id)})
    if game : 
         return individual_game(game) 
    
    raise HTTPException(status_code=404, detai=f"ModelRouter {id} not found")

@routerGames.post('/game',tags=['Game'])
async def post_models_ia(game : Game):
    game_dict = game.model_dump()
    existing_game = await collection_game.find_one({"name": game.name})
    if existing_game:
        raise HTTPException(status_code=400, detail="El juego ya existe")
    
    result = await collection_game.insert_one(game_dict)
    game_dict["_id"] = str(result.inserted_id)
    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "message": "Se agregó un nuevo juego",
            "model": game_dict
        }
    )


@routerGames.put('/game/{id}',tags=['Game'])
async def put_game(id : str,  game:Game):
    game_dict = game.model_dump()
    result = await collection_game.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": game_dict},  
        return_document=True  
    )
    if result:
        return JSONResponse(
            status_code=200,
            content={
                "message": "Juego actualizada",
                "model": game_dict
            }
        )
    raise HTTPException(status_code=404, detail=f"Juego {id} no existe")

@routerGames.delete('/game/{id}',tags=['Game'])
async def delete_model_ia(id :str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID no válido")
    result = await collection_game.find_one_and_delete({"_id": ObjectId(id)})
    
    if result:
        return JSONResponse(
            status_code=200,
            content={"message": f"Juego con ID {id} eliminado exitosamente"}
        )
    
    raise HTTPException(status_code=404, detail=f"Juego con ID {id} no encontrado")

#ESTE SERVICIO ES PARA CREAR EL ID UNICO

@routerGames.get('/act',tags=['Game'])
async def post_models_ia():
    result = await collection_act.insert_one({})
    idUnico = str(result.inserted_id)
    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "message": "Se agregó",
            "model": idUnico
        }
    )