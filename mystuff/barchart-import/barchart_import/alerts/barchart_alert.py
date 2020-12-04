import datetime
import decimal
from enum import Enum

from pydantic import BaseModel, Field


class OptionType(str, Enum):
    call = "Call"
    put = "Put"


class BarchartAlert(BaseModel):
    symbol: str
    price: float
    option_type: OptionType
    strike: decimal.Decimal = Field(..., gt=0)
    expiry_date: datetime.date
    days_to_expiration: int = Field(
        ..., description="The days to expiration when the alert was generated"
    )
    bid: decimal.Decimal = Field(..., ge=0)
    midpoint: decimal.Decimal = Field(..., gt=0)
    ask: decimal.Decimal = Field(..., gt=0)
    last: decimal.Decimal = Field(..., gt=0)
    volume: decimal.Decimal = Field(..., gt=0)
    open_interest: decimal.Decimal = Field(..., gt=0)
    volume_on_open_interest: decimal.Decimal = Field(
        ...,
        gt=0,
        description="The ratio between the volume of the day and the open interest, defined on barchart as VOL/OI",
    )
    implied_volatility: decimal.Decimal = Field(
        ..., ge=0, description="The implied volatility, described on barchart as IV"
    )
    alert_date: datetime.date = Field(
        ..., description="The date the alert was generated, on barchart defined as Time"
    )

    class Config:
        allow_mutation = False
