"""A Google Cloud Python Pulumi program"""

import pulumi
from pulumi_gcp import organizations, projects, pubsub, serviceaccount, storage
from pulumi_utils.projects import ephemeral_project

nameprefix = "shaht"
# Create a GCP resource (Storage Bucket)
bucket = storage.Bucket(f'{nameprefix}-bucket')

organization = organizations.get_organization(
            organization="248032716856"
        )

#Create an ephemeral project
ephemeral_project = ephemeral_project.Project(
    #"mitch-ephemeral-project",
    f'{nameprefix}-ephemeral-project',
    ephemeral_project.ProjectArgs(
        #project_name="mitch-ephemeral-project",
        project_name=f'{nameprefix}-ephemeral-project',
        root_project_name="pulum-297218",
        organization_name="248032716856"
    ),
)

# Export the DNS name of the bucket
pulumi.export('bucket_name', bucket.url)
pulumi.export('org', organization)
pulumi.export('proj', ephemeral_project)
