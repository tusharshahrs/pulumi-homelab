import base64

import pulumi_gcp
from pulumi import ComponentResource, Output, ResourceOptions, log
from pulumi_gcp import organizations, projects, pubsub, serviceaccount, storage


class ProjectArgs:
    def __init__(
        self, project_name: str, root_project_name: str, organization_name: str
    ):
        self.project_name = project_name
        self.root_project_name = root_project_name
        self.organization_name = organization_name


class Project(ComponentResource):

    ephemeral_project_provider: pulumi_gcp.Provider

    project: pulumi_gcp.organizations.Project

    new_project_id: Output[str]

    number: Output[str]

    project_owner_service_account: pulumi_gcp.serviceaccount.Account

    def __init__(self, name: str, args: ProjectArgs, opts: ResourceOptions = None):

        super().__init__("unopac:modules:Project", name, {}, opts)

        root_project = organizations.Project.get(
            f"{name}-root-project", id=args.root_project_name
        )
        organization = organizations.get_organization(
            organization=args.organization_name
        )

        log.info(f'Creating a project with name {args.project_name}')
        # Create an ephemeral project
        self.project = organizations.Project(
            f"{name}-new-project",
            name=args.project_name,
            project_id=args.project_name,
            billing_account=root_project.billing_account,
            org_id=organization.org_id,
            opts=ResourceOptions(parent=self),
        )

        self.project_owner_service_account = serviceaccount.Account(
            resource_name=f"{args.project_name}-project-owner-service-account",
            account_id="projectowner",
            project=self.project.project_id,
            opts=ResourceOptions(parent=self),
        )

        project_owner_service_account_key = serviceaccount.Key(
            resource_name=f"{args.project_name}-project-owner-service-account-key",
            service_account_id=self.project_owner_service_account.name,
            opts=ResourceOptions(parent=self),
        )

        project_owner_serviceaccount_iam_membership = projects.IAMMember(
            resource_name=f"{args.project_name}-project-owner-service-account-iam-member",
            project=self.project.project_id,
            role="roles/owner",
            member=self.project_owner_service_account.email.apply(
                lambda service_account_email: f"serviceAccount:{service_account_email}"
            ),
            opts=ResourceOptions(parent=self),
        )

        resourceManagerService = projects.Service(
            f"{args.project_name}-enable-resorce-management",
            project=self.project.project_id,
            service="cloudresourcemanager.googleapis.com",
            opts=ResourceOptions(parent=self),
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
                parent=self,
            ),
        )

        self.number = self.project.number
        self.new_project_id = self.project.project_id
        self.register_outputs(
            {
                "new_project_id": self.project.project_id,
                "number": self.project.number,
            }
        )
