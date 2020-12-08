#!/bin/bash
set -ex 

flake8 barchart_import/**
black . --check
##isort ./*/*.py --check-only