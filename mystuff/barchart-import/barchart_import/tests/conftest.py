from datetime import date
from unittest import mock

import pytest
import pytest_cases
import rootpath
from starlette.testclient import TestClient

from barchart_import.alerts.alerts_processor import AlertsProcessor
from barchart_import.importer.import_service import ImportService
from barchart_import.main import app
from barchart_import.routes.process_import import get_alerts_processor
from barchart_import.routes.start_import import get_import_service
from barchart_import.settings import BarchartImportSettings
from barchart_import.tests import csv_fixtures


@pytest_cases.fixture(scope="module")
def mocked_test_settings() -> BarchartImportSettings:
    return get_settings()


def get_settings() -> BarchartImportSettings:
    root_path = rootpath.detect()
    if root_path:
        localdownload_dir = f"{rootpath.detect()}/fixtures"
    else:
        localdownload_dir = "./fixtures"
    return BarchartImportSettings(
        username="user",
        password="password",
        objectstorage_bucket="my_bucket",
        gcp_project="",
        localdownload_dir=localdownload_dir,
        alerts_output_topicname="my-topic",
    )


@pytest.fixture(scope="module")
def mocked_importservice_storage_client():
    with mock.patch("barchart_import.importer.import_service.Client") as client:
        yield client


@pytest.fixture(scope="module")
def mocked_download_module():
    with mock.patch("barchart_import.importer.import_service.download") as download:
        download_function = mock.MagicMock()
        download.download_file_from_bar_chart = download_function
        yield download


@pytest.fixture(scope="module")
def mocked_webdriver_factory_module():
    with mock.patch(
        "barchart_import.importer.import_service.webdriver_factory"
    ) as webdriver_factory:
        webdriver_factory.build_driver = mock.MagicMock(return_value="Driver")
        yield webdriver_factory


@pytest.fixture(scope="module")
def mocked_tempfile():
    with mock.patch("barchart_import.importer.import_service.tempfile") as tempfile:
        tempfile.mktemp = mock.MagicMock(return_value="some-temp-file")
        yield tempfile


@pytest.fixture(scope="module")
def mocked_date():
    with mock.patch("barchart_import.importer.import_service.date") as mocked_date:
        mocked_date.today = mock.MagicMock(return_value=date(2020, 7, 5))
        yield mocked_date


@pytest.fixture(scope="module")
def mocked_import_service(
    mocked_test_settings,
    mocked_download_module,
    mocked_webdriver_factory_module,
    mocked_importservice_storage_client,
    mocked_tempfile,
    mocked_date,
):
    ## Import to keep mocked_importservice_storage_client because it is used internally
    service = ImportService(mocked_test_settings)
    yield service


@pytest.fixture(scope="module")
def mocked_alertsprocessor_storage_client():
    with mock.patch("barchart_import.alerts.alerts_processor.Client") as client:
        yield client


@pytest.fixture(scope="module")
def mocked_alertsprocessor_pubsubclient():
    with mock.patch(
        "barchart_import.alerts.alerts_processor.PublisherClient"
    ) as pubsub_client:
        yield pubsub_client


@pytest.fixture(scope="module")
def mocked_alertsprocessor_tempfile():
    with mock.patch("barchart_import.alerts.alerts_processor.tempfile") as tempfile:
        tempfile.mkstemp = mock.MagicMock(
            return_value=("", csv_fixtures.cleaned_fixture_fullpath)
        )
        yield tempfile


@pytest.fixture(scope="module")
def mocked_alerts_processor(
    mocked_alertsprocessor_storage_client,
    mocked_alertsprocessor_tempfile,
    mocked_alertsprocessor_pubsubclient,
):
    return AlertsProcessor("topic-name", "gcp_project")


@pytest.fixture(scope="module")
def test_app(mocked_import_service, mocked_alerts_processor):
    # set up
    def get_mocked_import_service():
        return mocked_import_service

    def get_mocked_alert_processor():
        return mocked_alerts_processor

    app.dependency_overrides[get_import_service] = get_mocked_import_service
    app.dependency_overrides[get_alerts_processor] = get_mocked_alert_processor
    with TestClient(app) as test_client:
        # testing
        yield test_client

        # tear down
