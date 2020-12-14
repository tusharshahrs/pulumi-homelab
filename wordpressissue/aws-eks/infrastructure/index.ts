import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

const projectName = pulumi.getProject();

// Create a new VPC with custom settings.
const vpcName = "eks-test-vpc";
const k8sTagName: string = `kubernetes.io/cluster/${projectName}`;


const vpc = new awsx.ec2.Vpc(vpcName, {
    numberOfAvailabilityZones: "all",
    cidrBlock: "172.16.0.0/16",
    // For clusters before v1.15
    tags: {
        [k8sTagName]: "shared",
    },
    subnets: [
        {
            type: "public",
            tags: {
                "Name": vpcName,
                "kubernetes.io/role/elb": "1",
                [k8sTagName]: "shared",
            }
        }
        // {
        //     type: "private",
        //     tags: {
        //         "Name": vpcName,
        //         "kubernetes.io/role/internal-elb": "1",
        //         [k8sTagName]: "shared",
        //     }
        // }
    ],
});


// Export the VPC resource IDs.
export = async () => {
    // create resources
    return {vpcId: vpc.id, publicSubnetIds: vpc.publicSubnetIds, privateSubnetIds: vpc.privateSubnetIds};
}
