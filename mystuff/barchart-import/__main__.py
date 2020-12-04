"""A Google Cloud Python Pulumi program"""

import pulumi
import pulumi_gcp
from pulumi import ResourceOptions, Output
from pulumi_gcp import (
    cloudrun,
    compute,
    organizations,
    projects,
    pubsub,
    storage,
    #serviceAccount,
    serviceaccount,
)
import base64

import ephemeral_project
import bucket_with_notification


config = pulumi.Config()
branch_name = config.require("branch_name")
cloud_run_image = config.require("cloud_run_image")
organization_name = config.require("organization_name")
registry_bucketname = config.require("registry_bucketname")
barchart_username = config.require("barchart_username")
barchart_password = config.require_secret("barchart_password")

location = "us-central-1"

project_name = f"unopac-dev-branch-{branch_name}"

# Create an ephemeral project
ephemeral_project = ephemeral_project.Project(
    "branch-project",
    ephemeral_project.ProjectArgs(
        project_name=project_name,
        #root_project_name="unusual-option-activity-qaroot",
        root_project_name="pulumi-ce-team",
        organization_name=organization_name,
    ),
)

project_owner_serviceaccount_iam_storage_admin = projects.IAMMember(
    resource_name="project-owner-service-account-storage-admin",
    project=ephemeral_project.new_project_id,
    role="roles/storage.admin",
    member=ephemeral_project.project_owner_service_account.email.apply(
        lambda service_account_email: f"serviceaccount:{service_account_email}"
    ),
)


ephemeral_project_provider = ephemeral_project.ephemeral_project_provider

services_to_enable = {
    "EnablePubSubService": "pubsub.googleapis.com",
    "EnableCloudRun": "run.googleapis.com",
    "EnableComputeEngine": "compute.googleapis.com",
}


def enable_service(pulumi_resource_name, api_name):
    return projects.Service(
        pulumi_resource_name,
        project=ephemeral_project.new_project_id,
        service=api_name,
        opts=ResourceOptions(provider=ephemeral_project_provider),
    )


services = {
    pulumi_resource_name: enable_service(pulumi_resource_name, api_name)
    for pulumi_resource_name, api_name in services_to_enable.items()
}


bucket_with_pubsubnotification = bucket_with_notification.BucketWithNotification(
    name="barchart-import-bucket-with-pubsub-notification",
    args=bucket_with_notification.BucketWithNotificationArgs(
        ephemeral_project.new_project_id, "barchart-import", "events"
    ),
    opts=ResourceOptions(provider=ephemeral_project_provider),
)


cloudRunServiceAccountSimpleName = ephemeral_project.number.apply(
    lambda project_number: f"serviceaccount:service-{project_number}@serverless-robot-prod.iam.gserviceaccount.com"
)

bucketPolicy = storage.BucketIAMMember(
    resource_name="AccessToContainerRegistry",
    bucket=registry_bucketname,
    member=cloudRunServiceAccountSimpleName,
    role="roles/storage.admin",
    opts=ResourceOptions(depends_on=[services["EnableCloudRun"]]),
)

service = cloudrun.Service(
    "barchart-import-service",
    name="barchart-import-service",
    location=location,
    template={
        "spec": {
            "service_account_name": ephemeral_project.project_owner_service_account.email,
            "containers": [
                {
                    "image": cloud_run_image,
                    "resources": {"limits": {"memory": "2G"}},
                    "envs": [
                        {
                            "name": "BARCHART_IMPORTER_OBJECTSTORAGE_BUCKET",
                            "value": bucket_with_pubsubnotification.bucket.url,
                        },
                        {
                            "name": "BARCHART_IMPORTER_USERNAME",
                            "value": barchart_username,
                        },
                        {
                            "name": "BARCHART_IMPORTER_PASSWORD",
                            "value": barchart_password,
                        },
                        {
                            "name": "BARCHART_IMPORTER_GCP_PROJECT",
                            "value": ephemeral_project.new_project_id,
                        },
                        {
                            "name": "BARCHART_IMPORTER_ALERTS_OUTPUT_TOPICNAME",
                            "value": ephemeral_project.new_project_id,
                        },
                    ],
                },
            ],
        },
    },
    project=ephemeral_project.new_project_id,
    opts=ResourceOptions(
        provider=ephemeral_project_provider, depends_on=[services["EnableCloudRun"]]
    ),
)

pubsub_editor_iam_binding = projects.IAMMember(
    resource_name="project-service-account-pubsub-editor",
    project=ephemeral_project.new_project_id,
    role="roles/pubsub.editor",
    member=ephemeral_project.project_owner_service_account.email.apply(
        lambda service_account_email: f"serviceaccount:{service_account_email}"
    ),
    opts=ResourceOptions(provider=ephemeral_project_provider),
)


subscription = pubsub.Subscription(
    resource_name="barchart-import-available-subscription",
    name="barchart-import-available-subscription",
    topic=bucket_with_pubsubnotification.topic.id,
    project=ephemeral_project.new_project_id,
    push_config={
        "push_endpoint": service.status["url"],
        "oidc_token": {
            "service_account_email": ephemeral_project.project_owner_service_account.email
        },
    },
    opts=ResourceOptions(provider=ephemeral_project_provider),
)

# # Export the DNS name of the bucket
# pulumi.export("bucket_name", barchart_import_bucket.url)
# pulumi.export("topic_name", barchart_import_events_topic.urn)
