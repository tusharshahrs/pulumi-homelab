set -x
export ENV_NAME=master
export ORG_ID=1051047723573
export CLOUDRUN_IMAGE=gcr.io/unusual-option-activity-qaroot/barchart-import:ad2e003
export REGISTRY_BUCKETNAME=artifacts.unusual-option-activity-qaroot.appspot.com
export BARCHART_USERNAME=ahoiahui@mail.bg
export BARCHART_PASSWORD=who_cares
script_name=$0
script_full_path=$(dirname "$0")
(
    $script_full_path/../pulumi/create-stack-internal.sh $ENV_NAME $ORG_ID $CLOUDRUN_IMAGE $REGISTRY_BUCKETNAME $BARCHART_USERNAME
)

