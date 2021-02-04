
import * as eks from "@pulumi/eks";
import * as awsx from "@pulumi/awsx";

const clusterName = "odj";
const vpcName = "k8s-ue2-dev";
const vpc = new awsx.ec2.Vpc(vpcName, {
  tags: { Name: vpcName },
});
const cluster = new eks.Cluster(`${clusterName}-eks`, {
  // This works, but if I remove the `providerCredentialOpts I get the above error
  //providerCredentialOpts: {},
  /*roleMappings: [
    // Provides full administrator cluster access to the k8s cluster
    {
      groups: ["system:masters"],
      roleArn: clusterAdminRole.arn,
      username: "pulumi:admin-usr",
    },
    // Map IAM role arn "AutomationRoleArn" to the k8s user with name "automation-usr", e.g. gitlab CI
    {
      groups: ["pulumi:automation-grp"],
      roleArn: automationRole.arn,
      username: "pulumi:automation-usr",
    },
    // Map IAM role arn "EnvProdRoleArn" to the k8s user with name "prod-usr"
    {
      groups: ["pulumi:prod-grp"],
      roleArn: envProdRole.arn,
      username: "pulumi:prod-usr",
    },
  ]*/

  vpcId: vpc.id,
  publicSubnetIds: vpc.publicSubnetIds,
  privateSubnetIds: vpc.privateSubnetIds,
  instanceType: "t3a.small",
  desiredCapacity: 2,
  minSize: 2,
  maxSize: 3,
});
