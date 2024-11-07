from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
import csv
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

# connecting mongodb
MONGO_URI = os.getenv("MONGO_URI")

if MONGO_URI is None:
    raise ValueError("MONGO_URI not set")

client = AsyncIOMotorClient(MONGO_URI)
db = client["email_database"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the database connection
    await startup_db_client(app)
    yield
    # Close the database connection
    await shutdown_db_client(app)

async def startup_db_client(app):
    app.mongodb = db
    print("mongodb connected")

async def shutdown_db_client(app):
    app.mongodb.client.close()
    print("mongodb closed")

#creating server
app = FastAPI(lifespan=lifespan)

def readCsv(filePath: str):
    data = []
    with open(filePath, 'r') as file:
        csvReader = csv.DictReader(file)
        for row in csvReader:
            data.append(row)
    return data

@app.get("/")
async def root():
    # user sends csv
    filePath = os.path.join(os.path.dirname(__file__), "samplecompanies - Sheet1.csv")
    try:
        data = readCsv(filePath)  # list of dictionaries
    except Exception as e:
        return {"error": str(e)}, 500
   #empty csv
    if not data:
        return {"data": []}

    try:
        collection = app.mongodb["companies"]
        result = await collection.insert_many(data)
        print("inserted ids: ", result.inserted_ids)
        return {"data": "hehe"}
    except Exception as e:
        return {"error": str(e)}, 500