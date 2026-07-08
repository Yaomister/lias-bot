from google import genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, LocalSession
from schemas import Message



Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/create-chat")
def create_chat():
    return


@app.get("/load_chat")
def load_chat():
    return


@app.post("/send-message")
def chat(request: Message):
    db = LocalSession()

    try:
        db.add(Message(sender = "user", message=request.message))

        reply = ""

        db.add(Message(sender = "ai", message=reply))

        db.commit()

        return {"reply" : reply}

    except:

        return 0
    finally:
        db.close()
    
