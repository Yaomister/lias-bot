import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from schemas import Message, Title
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
    allow_origins=["http://localhost:5173", "https://lias-49wqlzm1w-yaomisters-projects.vercel.app/"],
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

@app.get("/chat/{chat_id}/messages/")
def load_messages(chat_id: int, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).where(ChatMessage.chat_id == chat_id).all()
    return messages
 
@app.get("/chat/{chat_id}")
def load_messages(chat_id: int, db: Session = Depends(get_db)):
    chat = db.query(Chat).where(Chat.id == chat_id).first()
    return {"id": chat.id, "title": chat.title}


@app.patch("/chat/{chat_id}")
def update_title(chat_id: int, request: Title,  db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    chat.title = request.title
    db.commit()
    return {"id": chat.id, "title": chat.title}

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
    
