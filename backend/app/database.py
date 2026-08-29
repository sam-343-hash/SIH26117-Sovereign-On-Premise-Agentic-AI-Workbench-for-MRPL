from sqlmodel import SQLModel, create_engine, Session

# SQLite for Phase 2. Every table here mirrors a shape already consumed
# by the Next.js frontend's mock-data.ts, so the UI needs zero changes
# when it switches from mock data to real fetch() calls.
DATABASE_URL = "sqlite:///./refinaai.db"

engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def init_db():
    from app.models import document, safety_flag  # noqa: F401  (register tables)
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
