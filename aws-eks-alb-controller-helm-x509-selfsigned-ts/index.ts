import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";


const name = "demo"
const vpc = new awsx.ec2.Vpc(`${name}-vpc`, { numberOfAvailabilityZones: 2, tags: {"Name":`${name}-vpc`} });
const cluster = new eks.Cluster(`${name}-cluster`, {
    vpcId: vpc.id,
    instanceType: "t3a.medium",
    subnetIds: vpc.publicSubnetIds,
    desiredCapacity: 2,
    minSize: 1,
    maxSize: 2,
    enabledClusterLogTypes: ["api", "audit", "authenticator", "controllerManager", "scheduler"],
    encryptRootBockDevice: true,
    version: "1.20",
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
   
    // Transformation Starts
    /**
     * Modify specific child resources of this chart to ignore changes to their certificates on each `up`.
     * - https://www.pulumi.com/docs/intro/concepts/resources/#transformations
     */
         transformations: [
            (args) => {
                if (args.type === "kubernetes:core/v1:Secret" && args.name === "default/aws-load-balancer-tls") {
                    pulumi.log.info(`aws-load-balancer-controller transformation: Ignoring changes to TLS certificate on [${args.resource.urn}].`);
                    return ignoreChangesTransformation(args, ["data"]);
                }
                else if (args.name === "aws-load-balancer-webhook"
                    && (args.type === "kubernetes:admissionregistration.k8s.io/v1:ValidatingWebhookConfiguration"
                        || args.type === "kubernetes:admissionregistration.k8s.io/v1:MutatingWebhookConfiguration")
                ) {
                    pulumi.log.info(`aws-load-balancer-controller transformation: Ignoring changes to TLS certificate on [${args.resource.urn}].`);
                    return ignoreChangesTransformation(args, [
                        "webhooks[0].clientConfig.caBundle",
                        "webhooks[1].clientConfig.caBundle",
                    ]);
                }
                return undefined;
            },
        ]
    
    // Transformation Ends
});