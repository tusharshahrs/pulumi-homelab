from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException
import traceback
import time


class BasePage(object):

    locator_dictionary = {}

    def __init__(self, browser, base_url):
        self.base_url = base_url
        self.browser = browser
        self.timeout = 30

    def find_element(self, *loc):
        return self.browser.find_element(*loc)

    def visit(self, url):
        self.browser.get(url)

    # def hover(self,element):
    #         ActionChains(self.browser).move_to_element(element).perform()
    #         # I don't like this but hover is sensitive and needs some sleep time
    #         time.sleep(5)

    def __getattr__(self, what):
        if what in self.locator_dictionary.keys():
            try:
                WebDriverWait(self.browser, self.timeout).until(
                    EC.presence_of_element_located(self.locator_dictionary[what])
                )
            except (TimeoutException, StaleElementReferenceException):
                traceback.print_exc()

            try:
                WebDriverWait(self.browser, self.timeout).until(
                    EC.visibility_of_element_located(self.locator_dictionary[what])
                )
            except (TimeoutException, StaleElementReferenceException):
                traceback.print_exc()
            # I could have returned element, however because of lazy loading, I am seeking the element before return
            return self.find_element(*self.locator_dictionary[what])
