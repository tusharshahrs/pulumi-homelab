#!/bin/bash
set -ex


if [[ -z $1 || -z $2 || -z $3 || -z $4 || -z $5 ]] ; then
    echo Usage: $0 ENV_NAME ORG_ID CLOUDRUN_IMAGE REGISTRY_BUCKETNAME BARCHART_USERNAME
    exit 1
fi
ENV_NAME=$1
ORG_ID=$2
CLOUDRUN_IMAGE=$3
REGISTRY_BUCKETNAME=$4
BARCHART_USERNAME=$5

script_name=$0
script_full_path=$(dirname "$0")

(
    # export TF_LOG=TRACE
    # export TF_TRACE=TRUE
    env
    pulumi stack select --create $ENV_NAME
    pulumi config set branch_name $ENV_NAME
    pulumi config set organization_name $ORG_ID
    pulumi config set gcp:region europe-west1   
    pulumi config set cloud_run_image $CLOUDRUN_IMAGE
    pulumi config set registry_bucketname $REGISTRY_BUCKETNAME
    pulumi config set barchart_username $BARCHART_USERNAME
    pulumi config set --secret  barchart_password $BARCHART_PASSWORD
    pulumi refresh --yes && pulumi up --yes
)