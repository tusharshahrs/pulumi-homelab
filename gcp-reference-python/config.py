import pulumi

config = pulumi.Config()

project = pulumi.get_project()

def getResourceName(resourceName=""):
    if resourceName is "":
        return project
    else:
        return f"{project}-{resourceName}"