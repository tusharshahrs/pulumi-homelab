from barchart_import.importer.pages.basepage import BasePage
from selenium.webdriver.common.by import By


class BarchartStockUoaPage(BasePage):

    locator_dictionary = {
        "download_button": (
            By.CSS_SELECTOR,
            "a.toolbar-button:nth-child(4) > span:nth-child(2)",
        ),
        "show_login_button": (
            By.CSS_SELECTOR,
            "div.bc-user-block__button-wrapper:nth-child(1) > a:nth-child(1)",
        ),
        "login_username_input": (By.CSS_SELECTOR, ".form-field-login"),
        "login_password_input": (By.CSS_SELECTOR, "#login-form-password"),
        "login_submit_button": (By.CSS_SELECTOR, "button.bc-button"),
    }

    def __init__(self, browser, base_url: str):
        BasePage.__init__(self, browser, base_url)
