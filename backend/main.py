import os
from google import genai
from schemas import Message
from google.genai import types
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends
from models import Chat, ChatMessage
from sse_starlette.sse import EventSourceResponse
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, get_db, LocalSession



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

        db.add(ChatMessage(chat_id=request.chat_id, sender="user", text=request.text))
        db.commit()
        
        def generate():
            response = ""
            stream = client.models.generate_content_stream(
                model ='gemini-3.5-flash',
                contents=request.text,
                config=types.GenerateContentConfig(
                    system_instruction=base_prompt),
            )

            for chunk in stream:
                if chunk.text:
                    response += chunk.text
                    yield {"data": chunk.text}

            _db = LocalSession()
            try:
                _db.add(ChatMessage(chat_id = request.chat_id, sender = "ai", text=response))
                _db.commit()
            finally:
                _db.close()
            
            yield {"event": "done", "data": ""}

        return EventSourceResponse(generate())
    
