import json
import uuid

from fastapi.encoders import jsonable_encoder

from barchart_import.routes.process_import import GoogleObjectStorageEvent


def test_processimport_route(test_app):
    gcp_storage_event = GoogleObjectStorageEvent(
        name="object-name", bucket="bucket-name"
    )
    json_compatible_data = jsonable_encoder(gcp_storage_event)
    response = test_app.post("/process-import", json=json_compatible_data)
    assert response.status_code == 200
