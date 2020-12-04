from pulumi import ComponentResource, ResourceOptions
from pulumi import Output
import pulumi_gcp
from pulumi_gcp import (
    organizations,
    projects,
    pubsub,
    storage,
    serviceAccount,
)
import base64


class ProjectArgs:
    def __init__(
        self, project_name: str, root_project_name: str, organization_name: str
    ):
        self.project_name = project_name
        self.root_project_name = root_project_name
        self.organization_name = organization_name


class Project(ComponentResource):

    ephemeral_project_provider: pulumi_gcp.Provider

    new_project_id: Output[str]

    number: Output[str]

    project_owner_service_account: pulumi_gcp.serviceAccount.Account

    def __init__(self, name: str, args: ProjectArgs, opts: ResourceOptions = None):

        super().__init__("unopac:modules:Project", name, {}, opts)

        root_project = organizations.Project.get(
            f"{name}-root-project", id=args.root_project_name
        )
        organization = organizations.get_organization(
            organization=args.organization_name
        )

        # Create an ephemeral project
        ephemeral_project = organizations.Project(
            f"{name}-new-project",
            name=args.project_name,
            project_id=args.project_name,
            billing_account=root_project.billing_account,
            org_id=organization.org_id,
        )

        self.project_owner_service_account = serviceAccount.Account(
            resource_name=f"{args.project_name}-project-owner-service-account",
            account_id="projectowner",
            project=ephemeral_project.project_id,
        )

        project_owner_service_account_key = serviceAccount.Key(
            resource_name=f"{args.project_name}-project-owner-service-account-key",
            service_account_id=self.project_owner_service_account.name,
        )

        project_owner_serviceaccount_iam_membership = projects.IAMMember(
            resource_name=f"{args.project_name}-project-owner-service-account-iam-member",
            project=ephemeral_project.project_id,
            role="roles/owner",
            member=self.project_owner_service_account.email.apply(
                lambda service_account_email: f"serviceAccount:{service_account_email}"
            ),
        )

        resourceManagerService = projects.Service(
            f"{args.project_name}-enable-resorce-management",
            project=ephemeral_project.project_id,
            service="cloudresourcemanager.googleapis.com",
        )

        self.ephemeral_project_provider = pulumi_gcp.Provider(
            resource_name="ephemeral-project-provider",
            credentials=project_owner_service_account_key.private_key.apply(
                lambda k: base64.b64decode(k).decode("utf-8")
            ),
            opts=ResourceOptions(
                depends_on=[
                    resourceManagerService,
                    project_owner_serviceaccount_iam_membership,
                ],
            ),
        )
        projects.Service(
            f"{args.project_name}-ephemeral-project-service-usage",
            project=ephemeral_project.project_id,
            service="serviceusage.googleapis.com",
            opts=ResourceOptions(provider=self.ephemeral_project_provider),
        )
        self.number = ephemeral_project.number
        self.new_project_id = ephemeral_project.project_id
        self.register_outputs(
            {
                "new_project_id": ephemeral_project.project_id,
                "number": ephemeral_project.number,
            }
        )
