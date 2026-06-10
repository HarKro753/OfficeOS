from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes_admin import router as admin_router
from app.routes_auth import router as auth_router
from app.routes_files import router as files_router
from app.routes_requests import router as requests_router
from app.routes_workspaces import router as workspaces_router

app = FastAPI(title="OfficeOS Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(workspaces_router)
app.include_router(requests_router)
app.include_router(files_router)
app.include_router(admin_router)
