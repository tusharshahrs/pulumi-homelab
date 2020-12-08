import datetime
import decimal
import tempfile

import rootpath

from barchart_import.alerts import alert_parser
from barchart_import.alerts.barchart_alert import BarchartAlert
from barchart_import.tests import csv_fixtures


def count_lines(fname):
    count = 0
    with open(fname, "r") as f:
        for line in f:
            count += 1
    return count


def clean_file(full_source_filename, target_filename):
    alert_parser.keep_only_valid_rows(full_source_filename, target_filename)


def test_alert_parser():
    temp_filename = tempfile.mktemp("cleaned")
    clean_file(csv_fixtures.file1_fullpath, temp_filename)
    assert count_lines(temp_filename) == 1001


def test_single_parsing():
    temp_filename = tempfile.mktemp("cleaned1")
    clean_file(csv_fixtures.file1_fullpath, temp_filename)
    alerts = alert_parser.parse_file(temp_filename)
    last_alert = alerts[-1]
    expected = BarchartAlert(
        symbol="CCL",
        price=15.88,
        option_type="Put",
        strike=decimal.Decimal("14.50"),  # Needed for precision issues
        expiry_date=datetime.date(2020, 7, 10),
        days_to_expiration=8,
        bid=0.28,
        midpoint=0.29,
        ask=decimal.Decimal("0.30"),  # Needed for precision issues
        last=0.29,
        volume=579,
        open_interest=426,
        volume_on_open_interest=1.36,
        implied_volatility=0.8914,
        alert_date=datetime.date(2020, 7, 2),
    )
    assert last_alert == expected


def test_other_file_parsing():
    temp_filename = tempfile.mktemp("cleaned2")
    clean_file(csv_fixtures.file2_fullpath, temp_filename)
    alerts = alert_parser.parse_file(temp_filename)
    assert len(alerts) == 1000
    # No exception thrown here, datetime format is correct
