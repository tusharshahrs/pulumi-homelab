#!/bin/bash
set -ex

export PULUMI_ACCESS_TOKEN=$(cat pulumi-secret.txt)

export BARCHART_PASSWORD=$(cat barchart-password.txt)


script_name=$0
script_full_path=$(dirname "$0")

$script_full_path/../pulumi/create-stack-internal.sh $1 $2 $3 $4 $5