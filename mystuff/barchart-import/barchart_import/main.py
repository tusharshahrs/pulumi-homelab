from fastapi import FastAPI

from barchart_import.routes import healthcheck, process_import, start_import

app = FastAPI()

app.include_router(start_import.router)
app.include_router(healthcheck.router)
app.include_router(process_import.router)
