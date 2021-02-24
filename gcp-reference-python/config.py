import pulumi

config = pulumi.Config()
subnet_cidr_blocks = config.require_object('subnet_cidr_blocks')

project = pulumi.get_project()

def getResourceName(resourceName=""):
    if resourceName is "":
        return project
    else:
        return f"{project}-{resourceName}"

