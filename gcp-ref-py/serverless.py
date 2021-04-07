import pulumi
from pulumi import ComponentResource, ResourceOptions, export, asset
from pulumi_gcp import storage, cloudfunctions

class FuncArgs:
    def __init__(self,
                 runtime="python37",
                 entry_point="handler",
                 trigger_http=True,
                 available_memory_mb=128,
                 role="roles/cloudfunctions.invoker",
                 member="allUsers",
                 tags = None):

        self.runtime = runtime
        self.entry_point = entry_point
        self.trigger_http = trigger_http
        self.available_memory_mb = available_memory_mb
        self.role = role
        self.member = member
        self.tags = tags

class Function(ComponentResource):
    def __init__(self, 
                 name: str,
                 args: FuncArgs,
                 opts: ResourceOptions = None):

        super().__init__('custom:resource:CloudFunction', name, {}, opts)

        bucket_name = f'{name}-bucket'
        self.bucket = storage.Bucket(bucket_name,
            labels=args.tags,
            opts=ResourceOptions(parent=self))

        bucket_object_name = f'{name}-bucketobject'
        self.bucket_object = storage.BucketObject(bucket_object_name,
            bucket=self.bucket.name,
            source=pulumi.FileArchive("./pythonfunction"),
            metadata=args.tags,
            opts=ResourceOptions(parent=self.bucket))
        
        function_name = f'{name}-cloudfunction'
        self.function = cloudfunctions.Function(function_name,
            description="Serverless Function in GCP via Pulumi",
            runtime = args.runtime,
            available_memory_mb =args.available_memory_mb,
            source_archive_bucket=self.bucket.name,
            source_archive_object=self.bucket_object.name,
            trigger_http = args.trigger_http,
            entry_point = args.entry_point,
            #labels = args.tags,
            opts=ResourceOptions(parent=self))

        iam_member_name = f'{name}-functioniammember'
        self.invoker = cloudfunctions.FunctionIamMember(iam_member_name,
            cloud_function=self.function.name,
            role=args.role,
            member=args.member,
            opts=ResourceOptions(parent=self.function))
        
        self.register_outputs({})
