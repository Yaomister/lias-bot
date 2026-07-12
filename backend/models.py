from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import Relationship
from sqlalchemy.sql import func
from datetime import datetime 
from database import Base

class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="New Chat")
    created_at = Column(DateTime, server_default=func.now())

    messages = Relationship("ChatMessage", back_populates="chat")

class ChatMessage(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    sender =  Column(String)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    text = Column(String)
    created_at = Column(DateTime, server_default=func.now())

    chat = Relationship("Chat", back_populates="messages")

