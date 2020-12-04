This is readme about script for selenium crawler.
Selenium is for script automation which helps to simulate user browsing
More about Selenium can be found here https://selenium.dev/

The scripts is called selenium-crawl.py and there is some properties
Which has to be configured: 

DOWNLOAD_FOLDER = "C:\\Users\\kosto\\etc\\download\\"
OUTPUT_FOLDER = "C:\\Users\\kosto\\etc\\output\\"

Has to point out to existing folders. 
The first one is for where to hold temp downloaded files
and the second one is where the data should be outputed.
The second output folder should contain the file described in DATA_BAR_CHART_FILE_NAME

The last step is to download the firefox drivers: 
https://github.com/mozilla/geckodriver/releases 
You should place it some folder (and should be not moved)
This folder should be added in Windows PATH 
How to do this: https://docs.alfresco.com/4.2/tasks/fot-addpath.html

After configuration it should be started, but currently the script is unfinished
The logic starts from main method def main():