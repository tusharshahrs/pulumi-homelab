from pulumi import ComponentResource, Output, ResourceOptions
from pulumi_gcp import storage


class CrossProjectCloudRunAccessArgs:

    registry_bucketname: str
    target_project_number: Output[str]

    def __init__(self, registry_bucketname: str, target_project_number: Output[str]):
        self.registry_bucketname = registry_bucketname
        self.target_project_number = target_project_number


class CrossProjectCloudRunAccess(ComponentResource):

    bucket_policy: storage.BucketIAMMember

    def __init__(
        self,
        name: str,
        args: CrossProjectCloudRunAccessArgs,
        opts: ResourceOptions = None,
    ):
        super().__init__("unopac:modules:CrossProjectCloudRunAccess", name, {}, opts)

        cloudrun_serviceaccount_name = Output.concat(
            "serviceAccount:service-",
            args.target_project_number,
            "@serverless-robot-prod.iam.gserviceaccount.com",
        )

        self.bucket_policy = storage.BucketIAMMember(
            resource_name="AccessToContainerRegistry",
            bucket=args.registry_bucketname,
            member=cloudrun_serviceaccount_name,
            role="roles/storage.admin",
            opts=opts,
        )
