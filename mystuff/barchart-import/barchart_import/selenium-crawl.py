from scripts.bar_chart_crawler import (
    bar_chart_file_fill_from_yahoo,
    download_file_from_bar_chart,
    parse_file_from_bar_chart,
)
from scripts.chameleon_crawler import (
    chameleon_file_fill_from_yahoo,
    download_data_from_chameleon,
    parse_data_into_file,
)


def main():
    # Download and Parse data from BarChart site
    # download_file_from_bar_chart()
    # parse_file_from_bar_chart()
    #
    # # Parse data from Chameleon site
    # data = download_data_from_chameleon()
    # parse_data_into_file(data)

    # Use Yahoo Finance API to crawl data
    bar_chart_file_fill_from_yahoo()
    chameleon_file_fill_from_yahoo()


if __name__ == "__main__":
    main()
