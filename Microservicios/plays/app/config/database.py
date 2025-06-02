from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("MONGO_URI")

db = client['todo_db']
collection_name = db["modelIA_collection"]
partidas_collection = db["partidas"]
collection_response = db["response_collection"]

