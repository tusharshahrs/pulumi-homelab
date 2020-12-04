
TAG=ee55761
docker run -p=8080:8080 --env-file ./.env -e GOOGLE_APPLICATION_CREDENTIALS=/root/unopac-dev-master-key.json \
-v `pwd`:/root \
gcr.io/unusual-option-activity-qaroot/barchart-import:$TAG