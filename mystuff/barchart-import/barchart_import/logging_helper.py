import inspect
import logging
import multiprocessing
import os
import sys
import threading
from collections import OrderedDict

import structlog


def _set_up_structlog():
    if not structlog.is_configured():
        structlog.configure(
            processors=[
                structlog.stdlib.filter_by_level,
                structlog.stdlib.add_log_level,
                structlog.processors.StackInfoRenderer(),
                structlog.processors.format_exc_info,
                structlog.processors.UnicodeDecoder(),
                structlog.processors.TimeStamper(fmt="iso"),
                _add_additional_info,
                _reorder_keys,
                structlog.processors.JSONRenderer(sort_keys=False),
            ],
            context_class=structlog.threadlocal.wrap_dict(dict),
            logger_factory=structlog.stdlib.LoggerFactory(),
            wrapper_class=structlog.stdlib.BoundLogger,
            cache_logger_on_first_use=True,
        )


def _add_additional_info(_logger, _log_method, event_dict):
    event_dict["process_name"] = multiprocessing.current_process().name
    event_dict["process_id"] = os.getpid()
    event_dict["thread_name"] = threading.current_thread().name
    event_dict["thread_ident"] = threading.get_ident()
    frame = inspect.currentframe()
    while frame:
        frame = frame.f_back
        module = frame.f_globals["__name__"]
        if module.startswith("structlog."):
            continue
        event_dict["module"] = module
        event_dict["function"] = frame.f_code.co_name
        event_dict["line_number"] = frame.f_lineno
        return event_dict
    return event_dict


def _reorder_keys(_logger, _log_method, event_dict):
    ordered_event_dict = OrderedDict(event_dict)
    for k in ["level", "event"][::-1]:
        ordered_event_dict.move_to_end(k, last=False)
    return ordered_event_dict


def set_up_logger(logger_name, log_level=logging.DEBUG, log_format=None):
    _set_up_structlog()
    logger = structlog.get_logger(logger_name)
    logger.setLevel(log_level)
    if not logger.new()._logger.handlers:
        logger_handler = logging.StreamHandler(sys.stdout)
        if log_format:
            logger_handler.setFormatter(logging.Formatter(log_format))
        logger.addHandler(logger_handler)
    return logger
