
ORG_ID="1051047723573"
BILLING_ACCOUNT="$(gcloud beta billing accounts list --format="value(ACCOUNT_ID)" --filter="Open=True")"
SA_ID='serviceAccount:272928974106@cloudbuild.gserviceaccount.com'
if [[ ${BILLING_ACCOUNT:-} != "" ]]; then
  echo "Enabling the billing account..."
  gcloud beta billing accounts get-iam-policy "$BILLING_ACCOUNT" > policy-tmp-$$.yml
  unamestr=$(uname)
  if [ "$unamestr" = 'Darwin' ] || [ "$unamestr" = 'Linux' ]; then
    sed -i.bak -e "/^etag:.*/i \\
- members:\\
\ \ - serviceAccount:${SA_ID}\\
\ \ role: roles/billing.user" policy-tmp-$$.yml && rm policy-tmp-$$.yml.bak
    gcloud beta billing accounts set-iam-policy "$BILLING_ACCOUNT" policy-tmp-$$.yml
  else
    echo "Could not set roles/billing.user on service account $SERVICE_ACCOUNT.\
    Please perform this manually."
  fi
  rm -f policy-tmp-$$.yml
fi



gcloud organizations add-iam-policy-binding \
  $ORG_ID \
  --member="$SA_ID" \
  --role="roles/resourcemanager.organizationViewer" \
  --user-output-enabled false

gcloud organizations add-iam-policy-binding \
  $ORG_ID \
  --member="$SA_ID" \
  --role="roles/resourcemanager.projectCreator" \
  --user-output-enabled false



