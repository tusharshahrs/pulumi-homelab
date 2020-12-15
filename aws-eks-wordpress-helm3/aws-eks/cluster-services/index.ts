import * as aws from "@pulumi/aws";
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import { config } from "./config";

const projectName = pulumi.getProject();

// const perfNodegroupIamRoleName = perfNodegroupIamRoleArn.apply(s => s.split("/")).apply(s => s[1])
export const stdNodegroupIamRoleArn = config.stdNodegroupIamRoleArn;
const stdNodegroupIamRoleName = stdNodegroupIamRoleArn.apply(s => s.split("/")).apply(s => s[1]);
export const clusterName = config.clusterName;


// Create a new IAM Policy for fluentd-cloudwatch to manage CloudWatch Logs.
const name = "fluentd-cloudwatch";
const fluentdCloudWatchPolicy = new aws.iam.Policy(name,
    {
        description: "Allows fluentd-cloudwatch to work with CloudWatch Logs.",
        policy: JSON.stringify(
            {
                Version: "2012-10-17",
                Statement: [{Effect: "Allow", Action: ["logs:*"], Resource: ["arn:aws:logs:*:*:*"]}]
            }
        )
    },
);

// Attach CloudWatch Logs policies to a role.
function attachLogPolicies(name: string, arn: pulumi.Input<aws.ARN>) {
    new aws.iam.RolePolicyAttachment(name,
        { policyArn: fluentdCloudWatchPolicy.arn, role: arn},
    );
}

attachLogPolicies("stdRpa", stdNodegroupIamRoleName);
// attachLogPolicies("perfRpa", perfNodegroupIamRoleName);

// Deploy fluentd using the Helm chart.
const provider = new k8s.Provider("provider", {kubeconfig: config.kubeconfig});
const fluentdCloudWatchLogGroup = new aws.cloudwatch.LogGroup(name);
export let fluentdCloudWatchLogGroupName = fluentdCloudWatchLogGroup.name;

// Deploy fluentd using the Helm chart.
const fluentdCloudwatch = new k8s.helm.v2.Chart(name,
    {
        namespace: config.clusterSvcsNamespaceName,
        chart: "fluentd-cloudwatch",
        version: "0.13.2",
        fetchOpts: {
            repo: "https://charts.helm.sh/incubator/",
        },
        values: {
            extraVars: [ "{ name: FLUENT_UID, value: '0' }" ],
            rbac: {create: true},
            awsRegion: aws.config.region,
            logGroupName: fluentdCloudWatchLogGroup.name,
        },
        transformations: [
            (obj: any) => {
                // Do transformations on the YAML to set the namespace
                if (obj.metadata) {
                    obj.metadata.namespace = config.clusterSvcsNamespaceName;
                }
            },
        ],
    },
    {providers: { kubernetes: provider }},
);

//FIXME: metrics server api unavailable
/* const k8sMetricsServerChart = new k8s.helm.v2.Chart("metrics-server", {
    namespace: "kube-system",
    fetchOpts: {repo: "https://charts.bitnami.com/bitnami"},
    chart: "metrics-server",
    version: "5.3.1",
    values: {
        rbac: {create: true},
        awsRegion: aws.config.region,
    },
    transformations: [
        (obj: any) => {
            // Do transformations on the YAML to set the namespace
            if (obj.metadata) {
                obj.metadata.namespace = "kube-system";
            }
        },
    ],
}, { provider: provider }); */


