from pulumi import ComponentResource, ResourceOptions
from pulumi import Output
import pulumi_gcp

from pulumi_gcp import (
    cloudrun,
    compute,
    organizations,
    projects,
    pubsub,
    storage,
    serviceaccount,
)


class BucketWithNotificationArgs:

    bucket_resource_name: str
    project_id: str
    topic_resource_name_suffix: str

    def __init__(
        self,
        project_id: str,
        bucket_resource_name: str,
        topic_resource_name_suffix: str,
    ):
        self.bucket_resource_name = bucket_resource_name
        self.project_id = project_id
        self.topic_resource_name_suffix = topic_resource_name_suffix


class BucketWithNotification(ComponentResource):

    bucket: storage.Bucket

    topic: pubsub.Topic

    gcs_default_project_service_account_topicbindingtopic_iambinding: pubsub.TopicIAMBinding

    notification: storage.Notification

    def __init__(
        self, name: str, args: BucketWithNotificationArgs, opts: ResourceOptions = None
    ):

        super().__init__("unopac:modules:BucketWithNotification", name, {}, opts)

        self.bucket = storage.Bucket(
            args.bucket_resource_name, project=args.project_id, opts=opts
        )

        gcs_account = storage.get_project_service_account(
            project=args.project_id,
            opts=opts,
        )

        self.topic = pubsub.Topic(
            f"{args.bucket_resource_name}-{args.topic_resource_name_suffix}",
            project=args.project_id,
            opts=opts,
        )

        self.gcs_default_project_service_account_topicbindingtopic_iambinding = (
            pubsub.TopicIAMBinding(
                f"{name}-default-project-service-account-topic-iam-binding",
                topic=self.topic.id,
                role="roles/pubsub.publisher",
                members=[f"serviceaccount:{gcs_account.email_address}"],
                opts=opts,
            )
        )

        self.notification = storage.Notification(
            f"{args.bucket_resource_name}-notification",
            bucket=self.bucket.name,
            payload_format="JSON_API_V1",
            topic=self.topic.id,
            event_types=[
                "OBJECT_FINALIZE",
                "OBJECT_METADATA_UPDATE",
            ],
            custom_attributes={
                "new-attribute": "new-attribute-value",
            },
            opts=opts,
        )
