from selenium import webdriver
from selenium.webdriver import FirefoxProfile
from selenium.webdriver.firefox.options import Options

from barchart_import import logging_helper

_logger = logging_helper.set_up_logger(__name__)


def _build_chromedriver(download_dir: str):
    options = webdriver.ChromeOptions()
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--test-type")
    preferences = {
        "download.default_directory": download_dir,
        "directory_upgrade": True,
        "extension_to_open": "",
        "safebrowsing.enabled": True,
    }
    options.add_experimental_option("prefs", preferences)
    # options.add_argument("--headless")
    driver = webdriver.Chrome(chrome_options=options)
    driver.command_executor._commands["send_command"] = (
        "POST",
        "/session/$sessionId/chromium/send_command",
    )
    params = {
        "cmd": "Browser.setDownloadBehavior",
        "params": {"behavior": "allow", "downloadPath": download_dir},
    }
    driver.execute("send_command", params)
    _logger.info(f"Built chrome driver with arguments {options.arguments}")
    return driver


def build_driver(download_dir: str, headless: bool):
    options = Options()
    options.headless = headless
    fx_profile = FirefoxProfile()
    fx_profile.set_preference("browser.download.folderList", 2)
    fx_profile.set_preference("browser.download.manager.showWhenStarting", False)
    fx_profile.set_preference("browser.download.dir", download_dir)
    fx_profile.set_preference("browser.helperApps.neverAsk.saveToDisk", "text/csv")
    _logger.info(f"Built firefox driver with arguments {options.arguments}")
    return webdriver.Firefox(firefox_profile=fx_profile, options=options)
