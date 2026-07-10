import os
from models import Chat
from google import genai
from schemas import Message
from google.genai import types
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends
from database import Base, engine, get_db
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

with open("base_prompt.md", "r", encoding='utf-8') as f:
    base_prompt = f.read()

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("API_KEY"))

@app.post("/create-chat")
def create_chat(db: Session = Depends(get_db)):
    try:
        new_chat = Chat()
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        return {"id": new_chat.id}
    finally:
        db.close()


@app.get("/chat-log")
def load_chat(db: Session = Depends(get_db)):
    try:
        chats = db.query(Chat).all()
        return [{'id': chat.id, 'title': chat.title, "createdAt": chat.created_at} for chat in chats]
    finally:
        db.close()

@app.post("/send-message")
def chat(request: Message, db: Session = Depends(get_db)):

    try:
        db.add(Message(sender = "user", message=request.message))

        response = client.models.generate_content(
            model ='gemini-2.0-flash',
            config=types.GenerateContentConfig(
                system_instruction="You are a helpful data analyst. Respond strictly in JSON format."),
                contents="Summarize our Q3 sales performance."
        )

        db.add(Message(sender = "ai", message=response.text))

        db.commit()

        return {"response" : response.text}

    except:
        print("unable to chat with gemini")
    finally:
        db.close()
    
