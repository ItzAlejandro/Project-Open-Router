from fastapi import APIRouter,HTTPException
from models.ModelIA import ModelRouter
from config.database import collection_name, collection_url
from schema.schemas import list_serial,individual_serial, list_url
from bson import ObjectId
from fastapi.responses import JSONResponse
import httpx

routerModels =APIRouter()

@routerModels.get('/model',tags=['Model'])
async def get_models_ia():
    cursor = collection_name.find()  #
    models = await cursor.to_list()  
    if models :
        return list_serial(models) 
    
    raise HTTPException(status_code=204, detail="No existen modelos")

@routerModels.get('/model/{id}',tags=['Model'])
async def getmodelsbyid( id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID Invalido")
    data = await collection_name.find_one({"_id": ObjectId(id)})
    if data : 
         return individual_serial(data) 
    
    raise HTTPException(status_code=404, detai=f"ModelRouter {id} no funciona")

@routerModels.post('/model',tags=['Model'])
async def post_models_ia(model : ModelRouter):
    model_dict = model.model_dump()
    existing_model = await collection_name.find_one({"idModel": model.idModel})
    print('Response:')
    print( model_dict)
    if existing_model:
        raise HTTPException(status_code=400, detail="El id del modelo ya existe")
    
    result = await collection_name.insert_one(model_dict)
    model_dict["_id"] = str(result.inserted_id)
    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "message": "Se agregó un nuevo modelo",
            "model": model_dict
        }
    )

@routerModels.put('/model/{id}',tags=['Model'])
async def put_model_ia(id : str,  model:ModelRouter):
    model_dict = model.model_dump()
    result = await collection_name.find_one_and_update(
        {"_id": ObjectId(id)},
        {"$set": model_dict},  
        return_document=True  
    )

    if result:
        return JSONResponse(
            status_code=200,
            content={
                "message": "Modelo actualizado",
                "model": model_dict
            }
        )
    
    raise HTTPException(status_code=404, detail=f"Model {id} error interno")

@routerModels.delete('/model/{id}',tags=['Model'])
async def delete_model_ia(id :str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="ID no válido")
    result = await collection_name.find_one_and_delete({"_id": ObjectId(id)})
    
    if result:
        return JSONResponse(
            status_code=200,
            content={"message": f"Modelo con ID {id} eliminado exitosamente"}
        )
    
    raise HTTPException(status_code=404, detail=f"Modelo con ID {id} no encontrado")

    
async def getmodelsopenrouter():
    url = "https://openrouter.ai/api/v1/models"
    headers = {"accept": "application/json"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener modelos de OpenRouter")

    data=response.json()
    models = [datum['id'] for datum in data['data']]  

    return models

@routerModels.get('/url',tags=['Url'])
async def get_urls():
    cursor = collection_url.find()  
    url = await cursor.to_list()  
    if url :
        return list_url(url) 
    
    raise HTTPException(status_code=204, detail="No existen urls")

@routerModels.get("/apiKey/{key}", tags=["ApiKey"])
async def get_validate_key(key: str):
    headers = {"Authorization": f"Bearer {key}"}
    async with httpx.AsyncClient() as client:
        response = await client.get("https://openrouter.ai/api/v1/key", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if data['data']['is_free_tier']:
            raise HTTPException(status_code=403, detail="Debe ingresar una API KEY de paga")
        return data
    else:
        raise HTTPException(status_code=response.status_code, detail="API Key Invalida")