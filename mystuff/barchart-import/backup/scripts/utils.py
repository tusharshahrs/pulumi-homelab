import time
from datetime import datetime, timedelta

import requests
from scripts.constants import MARKET_CHAMELEON_NEXT_BUTTON_ID
from selenium.common.exceptions import (
    ElementClickInterceptedException,
    ElementNotInteractableException,
    NoSuchElementException,
)
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait


def get_first_empty_row(sheet):
    return sheet.max_row


def check_is_date(date, date_format):
    try:
        date_time = datetime.strptime(date, date_format)
        print(date_time)
        return True
    except ValueError:
        return False


def check_is_digit(digit):
    is_digit_check_one = digit.replace(".", "", 1).isdigit()
    is_digit_check_two = digit.replace(",", "", 1).isdigit()
    return is_digit_check_one or is_digit_check_two


def close_popup(driver):
    try:
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "register-flyer-close"))
        ).click()
        return True
    except NoSuchElementException:
        return False


def simulate_wait_and_scroll(driver):
    """

    :type driver: WebDriver
    """
    time.sleep(1)
    driver.set_window_size(100, 200)
    time.sleep(10)
    driver.set_window_size(1024, 720)
    time.sleep(5)


def close_popup_by_css_selector(css_selector, driver):
    try:
        popup_close = driver.find_element_by_css_selector(css_selector)
        popup_close.click()
    except NoSuchElementException:
        print("")


def find_next_button(element_id, driver):
    try:
        time.sleep(2)
        next_button = driver.find_element_by_css_selector(element_id)
        if "disabled" in next_button.get_attribute("class"):
            return None
        else:
            return next_button
    except (NoSuchElementException, ElementNotInteractableException) as e:
        print(e)
        return None


def check_is_last_page(driver):
    status = driver.find_element_by_css_selector("#opt_unusual_volume_info").text
    # Showing 276 to 282 of 282 entries
    status = status.replace("Showing ", "")
    status = status.replace("to ", "")
    status = status.replace("of ", "")
    status = status.replace("entries", "")
    digits = status.split(" ")
    result = digits[1] == digits[2]
    return result


def get_next_button(driver):
    try:
        next_page = driver.find_element_by_css_selector(MARKET_CHAMELEON_NEXT_BUTTON_ID)
        next_page.click()
        print("Clicked!")
        return True
    except ElementClickInterceptedException:
        simulate_wait_and_scroll(driver)
        print("Not clicked!")
        return False


def close_popup_by_xpath(xpath, driver):
    try:
        popup_close = driver.find_element_by_xpath(xpath)
        popup_close.click()
    except NoSuchElementException:
        print("")


def crawl_old_data(symbol, crawl_date, reduce):
    # Add T-N Column
    crawl_date = crawl_date + timedelta(days=reduce)
    d = crawl_date - timedelta(hours=1)
    ts_0 = time.mktime(d.timetuple())
    ts_1 = time.mktime(crawl_date.timetuple())

    url = (
        "https://query1.finance.yahoo.com/v8/finance/chart/"
        + symbol
        + "?symbol="
        + symbol
        + "&period1="
        + str(int(ts_0))
        + "&period2="
        + str(int(ts_1))
        + "&interval=1d&includePrePost=true&events=div%2Csplit"
    )
    r = requests.get(url=url)  # Make the actual request
    data = r.json()
    if data is not None:
        try:
            if r.status_code == 404:
                return "[NOT FOUND]"
            else:
                return data["chart"]["result"][0]["indicators"]["quote"][0]["close"][0]
        except (KeyError, TimeoutError):
            return "[MARKET CLOSED]"
    else:
        return "[NOT CONNECTED]"
