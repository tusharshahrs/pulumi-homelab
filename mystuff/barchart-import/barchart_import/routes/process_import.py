import json
from datetime import datetime
from enum import Enum
from uuid import UUID

from fastapi import APIRouter, Body, Depends
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

from barchart_import import logging_helper
from barchart_import.alerts.alerts_processor import AlertsProcessor
from barchart_import.settings import BarchartImportSettings, get_settings

_logger = logging_helper.set_up_logger(__name__)

router = APIRouter()


class GoogleObjectStorageEvent(BaseModel):
    name: str
    bucket: str


def get_alerts_processor(
    settings: BarchartImportSettings = Depends(get_settings, use_cache=False)
) -> AlertsProcessor:
    return AlertsProcessor(
        alerts_output_topicname=settings.alerts_output_topicname,
        gcp_project=settings.gcp_project,
    )


@router.post("/process-import")
async def import_available_route(
    object_storage_event: GoogleObjectStorageEvent = Body(...),
    alerts_processor: AlertsProcessor = Depends(get_alerts_processor, use_cache=False),
):
    _logger.info(
        f"Starting processing file in {object_storage_event.bucket}  with name {object_storage_event.name}"
    )
    alerts_processor.process_objectstorage_file(
        object_storage_event.bucket, object_storage_event.name
    )
