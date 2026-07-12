from pydantic import BaseModel

class Message(BaseModel):
    text: str
    chat_id: str

class Title(BaseModel):
    title: str


