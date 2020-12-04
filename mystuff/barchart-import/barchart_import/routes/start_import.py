import json
from datetime import datetime
from enum import Enum
from uuid import UUID

from fastapi import APIRouter, Body, Depends
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field

from barchart_import import logging_helper
from barchart_import.importer.import_service import ImportService
from barchart_import.settings import BarchartImportSettings, get_settings

_logger = logging_helper.set_up_logger(__name__)

router = APIRouter()


class ImportType(str, Enum):
    manual = "manual"
    scheduled = "scheduled"


class StartImport(BaseModel):
    trigger: ImportType
    id: UUID = Field()
    start_datetime: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_mutation = False


def get_import_service(
    settings: BarchartImportSettings = Depends(get_settings, use_cache=False),
) -> ImportService:
    return ImportService(settings)


@router.post("/start-import")
async def import_route(
    start_import: StartImport = Body(...),
    import_service: ImportService = Depends(get_import_service, use_cache=False),
):
    _logger.info(f"Starting import {start_import}")
    import_service.run()
    result = start_import.dict()
    result["status"] = "Success"
    return json.dumps(jsonable_encoder(result))
