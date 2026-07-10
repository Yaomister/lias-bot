from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

engine = create_engine("sqlite:///./app.db", connect_args={"check_same_thread": False})

LocalSession = sessionmaker(bind=engine)
Base = declarative_base()


def get_db():
    db = LocalSession()

    try:
        yield db
    finally:
        db.close()