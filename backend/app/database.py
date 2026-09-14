import os
from sqlmodel import SQLModel, create_engine, Session

DB_FILE = "refinaai.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_FILE}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

def init_db():
    with engine.connect() as connection:
        connection.exec_driver_sql("PRAGMA journal_mode=WAL;")
        connection.exec_driver_sql("PRAGMA synchronous=NORMAL;")
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
