import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";


const name = "demo"
const vpc = new awsx.ec2.Vpc(`${name}-vpc`, { numberOfAvailabilityZones: 2, tags: {"Name":`${name}-vpc`} });
const cluster = new eks.Cluster(`${name}-cluster`, {
    vpcId: vpc.id,
    instanceType: "t3.medium",
    subnetIds: vpc.publicSubnetIds,
    desiredCapacity: 2,
    minSize: 1,
    maxSize: 2,
    enabledClusterLogTypes: ["api", "audit", "authenticator", "controllerManager", "scheduler"],
    encryptRootBockDevice: true,
    version: "1.19",
    tags: {"owner":"shaht","env":"dev","github":"pulumi-homelab","pulumi":"yes","console":"no", "Name":"shaht-eks"}
})

/**
 * Return a modified resource `ignoreChanges` set to the provided `ignorePropertyNames`.
 * - https://www.pulumi.com/docs/intro/concepts/resources/#ignorechanges
 */
 function ignoreChangesTransformation(resource: pulumi.ResourceTransformationArgs, ignorePropertyNames: string[]): pulumi.ResourceTransformationResult {
    return {
        props: resource.props,
        opts: pulumi.mergeOptions(resource.opts, {
            ignoreChanges: ignorePropertyNames,
        }),
    }
}

const albingresscntlr = new k8s.helm.v3.Chart("albcontrollerhelm", {
    chart: "aws-load-balancer-controller",
    fetchOpts: {
        repo: "https://aws.github.io/eks-charts",
    },
    values: {
        clusterName: cluster.eksCluster.name,
        autoDiscoverAwsRegion: "true",
        autoDiscoverAwsVpcID: "true"
    }
}, {
    provider: cluster.provider,
});