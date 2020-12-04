import json
import uuid

from fastapi.encoders import jsonable_encoder

from barchart_import.routes.start_import import StartImport


def test_startimport_route(test_app):
    start_import = StartImport(trigger="manual", id=uuid.uuid1())
    json_compatible_data = jsonable_encoder(start_import)
    response = test_app.post("start-import", json=json_compatible_data)
    print(response.json())
    json_compatible_data["status"] = "Success"
    assert response.json() == json.dumps(json_compatible_data)
    assert response.status_code == 200
