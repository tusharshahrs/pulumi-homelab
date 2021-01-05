import * as aws from "@pulumi/aws";

const my_name = `shahtushar`;
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
const my_custom_policy = new aws.iam.Policy("eks_cluster_autoscale_policy", {
    name: "EKSClusterAutoscalePolicyTUSHAR",
    description: "EKS Cluster Autoscale Policy for cluster-autoscaler helm3 chart",
    path: "/",
    policy: `${eks_cluster_autoscale_policy}`,
});

export const iam_policy_eks_cluster_autoscale = my_custom_policy.arn;

export let managedPolicyArns: string[] = [
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
];

iam_policy_eks_cluster_autoscale.apply(iam_policy_eks_cluster_autoscale => managedPolicyArns.push(iam_policy_eks_cluster_autoscale));

// Creates a role and attaches the EKS worker node IAM managed policies
// Creates a collection of IAM roles.
const roles: aws.iam.Role[] = [];
let counter2 = 0;
for (let i = 0; i < 1; i++) {
    const role = new aws.iam.Role(`${my_name}-iamrole-${i}`, {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
            Service: "ec2.amazonaws.com",
        }),
    });

    for (const policy of managedPolicyArns) {
        // Create RolePolicyAttachment without returning it.
        console.log("POLICY ARNS: ", policy)
        const rpa = new aws.iam.RolePolicyAttachment(`${my_name}-policy-${counter2++}`,
            { policyArn: policy, role: role },
        );
    }

    // Adding Custom Policy
    const rpa = new aws.iam.RolePolicyAttachment(`${my_name}-policy-${counter2++}`,
        { policyArn: my_custom_policy.arn, role: role },
        { dependsOn: my_custom_policy });
}

// Creates a collection of IAM instance profiles from the given roles.
const profiles: aws.iam.InstanceProfile[] = [];
for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    profiles.push(new aws.iam.InstanceProfile(`${my_name}-instanceProfile-${i}`, { role: role }));
}