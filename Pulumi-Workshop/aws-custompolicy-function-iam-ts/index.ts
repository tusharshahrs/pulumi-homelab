import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as iam from "./iam";

export const my_name = "shaht"
export const roles = iam.createRoles(my_name, 1);
export const instanceProfiles = iam.createInstanceProfiles(my_name, roles);
