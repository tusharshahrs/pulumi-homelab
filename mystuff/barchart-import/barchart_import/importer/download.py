import time

from barchart_import import logging_helper
from barchart_import.importer.pages.barchart_uoa_page import BarchartStockUoaPage

_logger = logging_helper.set_up_logger(__name__)

_login_showmodalbutton_path = (
    "div.bc-user-block__button-wrapper:nth-child(1) > a:nth-child(1)"
)
# _login_userinput_path = ".form-field-login"
# _login_passinput_path = "#login-form-password"
# _login_button_path = "button.bc-button"


_barchartpremer_freetrial_modalclose_path = "div div.bc-modal-content.bc-premier-modal div.bc-premier-form div.modal-header-wrapper div.form-close-wrapper"
_downloadanyways_button_path = "body > div.reveal-modal.fade.bc-download-button-error.in > div > div > div:nth-child(4) > div > button"


def _login(page: BarchartStockUoaPage, username: str, password: str):
    _logger.info("Showing login button")
    page.show_login_button.click()
    _logger.info("Preventing hitting double rendering of form by waiting")
    # time.sleep(5)
    _logger.info("Typing username")
    page.login_username_input.send_keys(username)
    _logger.info("Typing password")
    page.login_password_input.send_keys(password)
    # time.sleep(10)
    _logger.info("Clicking on login button")
    page.login_submit_button.click()
    time.sleep(5)
    page.visit(page.base_url)


def _download(
    page: BarchartStockUoaPage,
):
    # time.sleep(8)
    _logger.info("Clicking on download button")
    page.download_button.click()
    # download_button.click()
    time.sleep(5)
    # download_anyways_button = driver.find_element_by_css_selector(
    #     _downloadanyways_button_path
    # )
    # download_anyways_button.click()
    time.sleep(5)


def download_file_from_bar_chart(driver, url, username, password):
    try:
        _logger.info(
            "Starting download of stocks unusual option activity from barchart"
        )

        page = BarchartStockUoaPage(driver, base_url=url)
        page.visit(url)
        _login(page, username, password)
        _download(page)
        _logger.info("Bar chart file downloaded successfully")
    finally:
        _logger.info("Closing driver")
        driver.close()
