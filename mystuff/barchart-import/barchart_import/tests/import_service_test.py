from datetime import date
from unittest import mock

from barchart_import.importer.import_service import ImportService
from barchart_import.settings import BarchartImportSettings


def test_import_service(
    mocked_import_service,
    mocked_download_module,
    mocked_webdriver_factory_module,
    mocked_importservice_storage_client,
    mocked_test_settings,
    mocked_tempfile,
):
    mocked_import_service.run()
    mocked_webdriver_factory_module.build_driver.assert_called_with(
        mocked_test_settings.localdownload_dir, True
    )
    mocked_download_module.download_file_from_bar_chart.assert_called_with(
        "Driver",
        str(mocked_test_settings.base_url),
        mocked_test_settings.username,
        mocked_test_settings.password.get_secret_value(),
    )
    bucket = mocked_importservice_storage_client().get_bucket
    bucket.assert_called_with(mocked_test_settings.objectstorage_bucket)
    blob = bucket().blob
    blob.assert_called_with("/barchart/2020-07-05.csv")
    blob().upload_from_filename.assert_called_with("some-temp-file")
