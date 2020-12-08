import csv
import datetime
import decimal
from datetime import date
from typing import List

from pydantic import ValidationError

from barchart_import import logging_helper
from barchart_import.alerts.barchart_alert import BarchartAlert

_logger = logging_helper.set_up_logger(__name__)

_barchart_date_format = "%m/%d/%y"


def _parse_barchartformat_date(date_string: str) -> date:
    return datetime.datetime.strptime(date_string, _barchart_date_format).date()


def _parse_row(row: List[str]) -> BarchartAlert:
    try:
        return BarchartAlert(
            symbol=row[0],
            price=row[1],
            option_type=row[2],
            strike=row[3],
            expiry_date=_parse_barchartformat_date(row[4]),
            days_to_expiration=row[5],
            bid=row[6],
            midpoint=row[7],
            ask=row[8],
            last=row[9],
            volume=row[10],
            open_interest=row[11],
            volume_on_open_interest=row[12],
            implied_volatility=decimal.Decimal(row[13].strip("%")) / 100,
            alert_date=_parse_barchartformat_date(row[14]),
        )
    except ValidationError as e:
        _logger.error(f"Cannot parse {(',').join(row)} into BarchartAlert")
        raise e


def keep_only_valid_rows(input_filename: str, target_filename: str):
    _logger.info(
        f"Removing non csv compliant rows from {input_filename} to {target_filename}"
    )
    with open(input_filename, "r") as input_file:
        with open(target_filename, "w") as target_file:
            csv_reader = csv.reader(input_file, delimiter=",")
            csv_writer = csv.writer(target_file, delimiter=",")
            for row in csv_reader:
                if len(row) >= 13:
                    csv_writer.writerow(row)


def parse_file(input_filename: str) -> List[BarchartAlert]:
    _logger.info(f"Parsing alerts from {input_filename}")
    alerts: List[BarchartAlert] = []
    with open(input_filename, "r") as input_file:
        csv_reader = csv.reader(input_file, delimiter=",")
        line_count = 0
        for row in csv_reader:
            if line_count > 0:
                alerts.append(_parse_row(row))
            line_count += 1
    return alerts
