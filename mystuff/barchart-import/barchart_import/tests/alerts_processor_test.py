from datetime import date
from unittest import mock

import pytest

from barchart_import.alerts import alert_parser
from barchart_import.alerts.alerts_processor import AlertsProcessor
from barchart_import.settings import BarchartImportSettings
from barchart_import.tests import csv_fixtures


def test_alert_processor(
    mocked_alertsprocessor_storage_client,
    mocked_alertsprocessor_pubsubclient,
    mocked_alertsprocessor_tempfile,
):
    alerts_processor = AlertsProcessor("topic-name", "gcp_project")
    alerts_processor.process_objectstorage_file(
        "example-bucketname", "example-filename"
    )
    bucket = mocked_alertsprocessor_storage_client().get_bucket
    bucket.assert_called_with("example-bucketname")
    blob = bucket().blob
    blob.assert_called_with("example-filename")
    blob().download_to_filename.assert_called_with(
        csv_fixtures.cleaned_fixture_fullpath
    )
    pubsubclient = mocked_alertsprocessor_pubsubclient()
    assert pubsubclient.publish.call_count == 1000
    assert pubsubclient.publish.call_args_list[-1][0][0] == "topic-name"
