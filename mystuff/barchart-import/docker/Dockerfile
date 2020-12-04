FROM python:3.7-slim AS base

ENV PYTHONFAULTHANDLER=1 \
  PYTHONHASHSEED=random \
  PYTHONUNBUFFERED=1


WORKDIR /barchart_import

FROM base as base_with_firefox

# Installing gecko driver

ARG FIREFOX_VERSION=58.0.2
ARG GK_VERSION=v0.19.1

COPY scripts/build/geckodriver-install.sh /

RUN /geckodriver-install.sh

FROM base as builder

# set environment varibles
ENV PYTHONDONTWRITEBYTECODE 1 \
    PYTHONUNBUFFERED 1 

ARG POETRY_VERSION=1.0.3

RUN pip install "poetry==$POETRY_VERSION" 

RUN python -m venv /venv



COPY pyproject.toml poetry.lock /barchart_import/

RUN poetry export -f requirements.txt | /venv/bin/pip install -r /dev/stdin

COPY barchart_import /barchart_import/barchart_import

RUN poetry build && /venv/bin/pip install dist/*.whl

FROM base_with_firefox as final

ENV PATH="/venv/bin:$PATH"

COPY --from=builder /venv /venv

COPY scripts/build/run.sh  /barchart_import/

ENTRYPOINT ["/barchart_import/run.sh"]



