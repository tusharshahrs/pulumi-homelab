script_name=$0
script_full_path=$(dirname "$0")
(
    cd $script_full_path/../../
    pwd
    eval $(cat .env | sed 's/^/export /')
    unset GOOGLE_APPLICATION_CREDENTIALS
    poetry run download-only
)