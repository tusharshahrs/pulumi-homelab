# from selenium import webdriver
# from selenium.webdriver import FirefoxProfile
# from selenium.webdriver.firefox.options import Options


# class Crawler:
#     """Class which contains driver"""

#     def __init__(self):
#         options = Options()
#         options.headless = False
#         fx_profile = FirefoxProfile()
#         fx_profile.set_preference("browser.download.folderList", 2)
#         fx_profile.set_preference("browser.download.manager.showWhenStarting", False)
#         fx_profile.set_preference("browser.download.dir", DOWNLOAD_FOLDER)
#         fx_profile.set_preference("browser.helperApps.neverAsk.saveToDisk", "text/csv")
#         driver = webdriver.Firefox(firefox_profile=fx_profile, options=options)
#         print("Firefox Initialized")
#         # cookies = pickle.load(open("cookies.pkl", "rb"))
#         # for cookie in cookies:
#         #     driver.add_cookie(cookie)
#         self._driver = driver

#     @property
#     def driver(self):
#         """Get driver from class"""
#         return self._driver

#     @driver.deleter
#     def driver(self):
#         del self._driver
