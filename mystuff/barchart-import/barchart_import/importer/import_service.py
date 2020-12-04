import tempfile
from datetime import date
from functools import lru_cache
import os
from fastapi import Depends
from google.cloud.storage import Client

from barchart_import import logging_helper
from barchart_import.alerts import alert_parser
from barchart_import.importer import download, webdriver_factory
from barchart_import.settings import BarchartImportSettings

_logger = logging_helper.set_up_logger(__name__)


class ImportService:
    config: BarchartImportSettings
    storage_client: Client

    def __init__(self, config: BarchartImportSettings):
        self.config = config
        self.storage_client = Client(project=self.config.gcp_project)

    def download(self) -> str:
        driver = webdriver_factory.build_driver(
            self.config.localdownload_dir, self.config.use_headless_browser
        )
        _logger.info("Correctly created webdriver")
        download.download_file_from_bar_chart(
            driver,
            str(self.config.base_url),
            self.config.username,
            self.config.password.get_secret_value(),
        )
        _logger.info("Correctly downloaded file")
        return self._build_source_filename()

    def upload(self, temp_filename):
        target_bucket = self.storage_client.get_bucket(self.config.objectstorage_bucket)
        target_objectname = f"/barchart/{date.today()}.csv"
        blob = target_bucket.blob(target_objectname)
        blob.upload_from_filename(temp_filename)
        _logger.info(
            f"Correctly uploaded file to bucket {self.config.objectstorage_bucket} with object name {target_objectname} from {temp_filename}"
        )

    def run(self):
        download_folder = self.config.localdownload_dir
        if not os.path.exists(download_folder):
            _logger.info(f"Creating local download dir {download_folder}")
            os.makedirs(download_folder)
        else:
            _logger.info(f"Not creating local download dir if exists {download_folder}")
        downloaded_filename = self.download()
        tmp_filename = tempfile.mktemp("cleaned")
        dirs = os.listdir(self.config.localdownload_dir)
        _logger.info(f"Files located in {self.config.localdownload_dir} : {dirs}")
        alert_parser.keep_only_valid_rows(downloaded_filename, tmp_filename)
        self.upload(tmp_filename)

    def _build_source_filename(self):
        date_string = date.today().strftime("%m-%d-%Y")
        return f"{self.config.localdownload_dir}/unusual-stocks-options-activity-{date_string}.csv"


def main():
    settings = BarchartImportSettings()
    service = ImportService(settings)
    service.download()


if __name__ == "__main__":
    main()
