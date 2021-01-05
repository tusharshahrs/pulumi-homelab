import * as aws from "@pulumi/aws";
import * as iam from "./iam";

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
    name: "EKSClusterAutoscalePolicy",
    description: "EKS Cluster Autoscale Policy for cluster-autoscaler helm3 chart",
    path: "/",
    policy: `${eks_cluster_autoscale_policy}`,
});

let managedPolicyArns: string[] = [
    "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
];

export function createRole(name: string): aws.iam.Role {
    const role = new aws.iam.Role(`${name}-iamrole`, {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
            Service: "ec2.amazonaws.com",
        }),
    });

    let counter = 0;
    for (const policy of managedPolicyArns) {
        // Create RolePolicyAttachment without returning it.
        const rpa = new aws.iam.RolePolicyAttachment(`${name}-policy-${counter++}`,
            { policyArn: policy, role: role },
        );
    }

    // Adding Custom Policy
    const rpa = new aws.iam.RolePolicyAttachment(`${name}-policy-${counter++}`,
        { policyArn: my_custom_policy.arn, role: role },
        { dependsOn: my_custom_policy });

    return role;
}

// Creates a collection of IAM roles.
export function createRoles(name: string, quantity: number): aws.iam.Role[] {
    const roles: aws.iam.Role[] = [];

    for (let i = 0; i < quantity; i++) {
        roles.push(iam.createRole(`${name}-role-${i}`));
    }

    return roles;
}

// Creates a collection of IAM instance profiles from the given roles.
export function createInstanceProfiles(name: string, roles: aws.iam.Role[]): aws.iam.InstanceProfile[] {
    const profiles: aws.iam.InstanceProfile[] = [];

    for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        profiles.push(new aws.iam.InstanceProfile(`${name}-instanceProfile-${i}`, {role: role}));
    }

    return profiles;
}