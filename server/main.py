from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
import csv
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import HTTPException
from groq import Groq

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
    await app.mongodb["tasks"].create_index(
        [("userId", 1), ("name", 1)], unique=True
    )
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
    # user sends csv, uid
    filePath = os.path.join(os.path.dirname(__file__), "samplecompanies - Sheet1.csv")
    uid = "123"
    try:
        data = readCsv(filePath)  # list of dictionaries
    except Exception as e:
        return {"error": str(e)}, 500
   #empty csv
    if not data:
        return {"data": []}
    
    userId = "123"
    task_doc = {
    "userId": userId,
    "name": "Marketing List",
    "list": data,
    "settings": {
        "schedule": "daily",
        "throttle": 5,  #5 emails per minute
        "prompt": (
            "hi i like <<company>> because <reason>"
            "From shash"
            )
    },
    "status": "pending"
    }

    # creating user
    # user_doc = {
    # "uid": "101",
    # "username": "test_user",
    # "email": "user@example.com"
    # }
    # result = await add_or_update_user(user_doc)
    # print("inserted id: ", result.get("uid"))

    try:
        result = await add_or_update_task(task_doc)
        print("inserted id: ", result.get("task_id"))
        return {"data": "hehe"}
    except Exception as e:
        return {"error": str(e)}, 500
    

@app.post("/add-or-update-task")
async def add_or_update_task(task: dict):
    # Assuming task dict has "userId" and "name" keys
    user_id = task.get("userId")
    task_name = task.get("name")

    if not user_id or not task_name:
        raise HTTPException(status_code=400, detail="userId and name are required fields")

    # Define the filter to find the task by userId and name
    filter_query = {"userId": user_id, "name": task_name}

    # Upsert the document: insert if it doesn't exist, or update if it does
    result = await app.mongodb["tasks"].update_one(
        filter_query,
        {"$set": task},
        upsert=True
    )

    if result.upserted_id:
        return {"status": "inserted", "task_id": result.upserted_id}
    else:
        return {"status": "updated"}

@app.post("/add-or-update-user")
async def add_or_update_user(user: dict):
    uid = user.pop("uid")
    
    if not uid:
        raise HTTPException(status_code=400, detail="user id required")

    filter_query = {"_id": uid}

    # Upsert: update if exists, insert if it doesn't
    result = await app.mongodb["users"].update_one(
        filter_query,
        {"$set": user},
        upsert=True
    )

    if result.upserted_id:
        return {"status": "user inserted", "uid": result.upserted_id}
    else:
        return {"status": "user updated"}

@app.get("/get-tasks/{uid}")
async def get_tasks(uid: str):
    try:
        filter_query = {"userId": uid}
        result =  await app.mongodb["tasks"].find(filter_query, {"_id": 0}).to_list(length=None)
        if not result:
            raise HTTPException(status_code=404, detail="User or tasks not found")
        return {"data": result}

    except Exception as e:
        return {"error": str(e)}, 500
    
@app.get("/generate-emails")
async def generate_emails():
    uid = "123" #ft
    tasks = await get_tasks(uid)
    task = tasks["data"][0]
    if not task:
        raise HTTPException(status_code=404, detail="User or tasks not found")
    mailList = task["list"]
    for receiverInfo in mailList:
        await generate_email_text(receiverInfo, task["settings"]["prompt"])
    
    #update in database
    await add_or_update_task(task)

    return {"list": mailList}

async def generate_email_text(receiverInfo : dict, promptTemplate : str):
    llmClient = Groq(api_key=os.getenv("GROQ_API_KEY"))
    name = receiverInfo.get("name")
    desc = receiverInfo.get("desc")
    prompt = promptTemplate.replace("<<company>>", name)
    prompt = prompt.replace("<<location>>", receiverInfo.get("location"))
    try:
        completion = llmClient.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "user",
                    "content": "generate an email in the following format: " + f"{prompt}" + f"\n use this info about {name} to personalize the email: {desc}" + "reply with only the text of the email, nothing else."
                }
            ],
            temperature=0.2,
            max_tokens=500,
            top_p=1,
            stream=False,
            stop=None,
        )

        receiverInfo["content"] = completion.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail="groq api error: "+str(e))