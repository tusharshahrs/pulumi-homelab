import * as aws from "@pulumi/aws";

// Creates a eks cluster autoscale policy json for cluster-autoscaler  helm3 chart
const eks_cluster_autoscale_policy = `{
	"Version": "2012-10-17",
	"Statement": [{
		"Effect": "Allow",
		"Action": [
			"autoscaling:DescribeAutoScalingGroups",
			"autoscaling:DescribeAutoScalingInstances",
			"autoscaling:DescribeLaunchConfigurations",
			"autoscaling:DescribeTags",
			"autoscaling:SetDesiredCapacity",
			"autoscaling:TerminateInstanceInAutoScalingGroup"
		],
		"Resource": "*"
	}]
}`

// Creates a eks cluster autoscale policy json
// https://artifacthub.io/packages/helm/cluster-autoscaler/cluster-autoscaler#aws---iam
const policy = new aws.iam.Policy("eks_cluster_autoscale_policy", {
    name: "EKSClusterAutoscalePolicy",
    description: "EKS Cluster Autoscale Policy for cluster-autoscaler helm3 chart",
    path: "/",
    policy: `${eks_cluster_autoscale_policy}`,
});

export const iam_policy_eks_cluster_autoscale_arn = policy.id;
export const iam_policy_eks_cluster_autoscale_name = policy.name;
export const iam_policy_eks_cluster_autoscale_policy = policy.policy;