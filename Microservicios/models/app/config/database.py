from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("MONGO_URI")

db = client['todo_db']
collection_name = db["modelIA_collection"]
collection_url = db["url_collection"]