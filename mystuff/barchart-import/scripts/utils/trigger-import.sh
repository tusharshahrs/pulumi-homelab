#!/bin/bash
set -ex
uuid=`uuidgen`
curl -X POST -H \
"Authorization: Bearer $(gcloud auth print-identity-token)" \
--header "Content-Type: application/json" \
--data '{"trigger":"manual","id":"6C2E6B64-DC19-4AB3-B778-0ABC6309B571"}' \
https://barchart-import-service-shjiissxzq-ew.a.run.app/start-import


#!/bin/bash
set -ex

curl -X POST -H \
--header "Content-Type: application/json" \
--data '{"trigger":"manual","id":"6C2E6B64-DC19-4AB3-B778-0ABC6309B571"}' \
http://localhost:8080/start-import