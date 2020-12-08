from pydantic import AnyHttpUrl, BaseSettings, SecretStr

from barchart_import import logging_helper

_logger = logging_helper.set_up_logger(__name__)


class BarchartImportSettings(BaseSettings):
    username: str
    password: SecretStr
    base_url: AnyHttpUrl = "https://www.barchart.com/options/unusual-activity/stocks"
    localdownload_dir: str = "~/barchart-import"
    objectstorage_bucket: str
    alerts_output_topicname: str
    use_headless_browser: bool = True
    gcp_project: str

    class Config:
        env_prefix = "barchart_importer_"


def get_settings() -> BarchartImportSettings:
    _logger.info("Loading config settings from the environment...")
    return BarchartImportSettings()
