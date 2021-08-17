import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as eks from "@pulumi/eks";
import { Role } from "@pulumi/aws/iam";

const ciRunnerRootRole1 = aws.iam.getRole({name: "demo-role-0-iamrole-473026f"});
const ciRunnerRootProfile1 = aws.iam.getInstanceProfile({name: "demo-instanceProfile-0-8d337cc"});

const name_prefix = "demo-shaht";

const cluster = new eks.Cluster(`${name_prefix}-eks`, {
    name: "operator-eks",
    //vpcId: vpc.id,
    //privateSubnetIds: vpc.privateSubnetIds,
    instanceType: "t3a.medium",
    instanceRole: ciRunnerRootRole1.then(),
    instanceProfileName: ciRunnerRootProfile1.then(myprofile =>myprofile.name),
    desiredCapacity: 2,
    minSize: 1,
    maxSize: 2,
    enabledClusterLogTypes: [
      "api",
      "audit",
      "authenticator",
      "controllerManager",
      "scheduler",
    ],
  });

export const ciRunnerRootRole_1 = ciRunnerRootRole1
export const ciRunnerRootRole_1_name = ciRunnerRootRole1.then(myrole =>myrole.name);
export const ciRunnerRootProfile_1 = ciRunnerRootProfile1;
export const ciRunnerRootProfile_1_name = ciRunnerRootProfile1.then(myprofile =>myprofile.name);