# barchart-import


## Ensuring your current user has enough permission on the organization

`gcloud alpha organizations get-iam-policy [ORGANIZATION_ID]
--format json > [FILENAME.JSON]`


`gcloud alpha organizations get-iam-policy 1051047723573
--format json > org-iam-policy.json`





## Granting permissions on the root factory project

Find your organization with

`gcloud organizations list`

Then find the service account for cloud build at the url

https://console.cloud.google.com/cloud-build/settings/service-account

then run

```
gcloud organizations add-iam-policy-binding \
  "${ORG_ID}" \
  --member="serviceAccount:${SA_ID}" \
  --role="roles/billing.user" \
  --user-output-enabled false
```

For example

gcloud organizations add-iam-policy-binding \
  1051047723573 \
  --member="serviceAccount:272928974106@cloudbuild.gserviceaccount.com" \
  --role="roles/billing.user" \
  --user-output-enabled false
  

# Running the barchart api locally

```sh
poetry shell
uvicorn barchart_import.main:app --reload
```

# Running a local import