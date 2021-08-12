import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as iam from "./iam";

// Create 3 IAM Roles and matching InstanceProfiles to use with the nodegroups.
const my_name = `shaht-eks`;
const roles = iam.createRoles(my_name, 2);
const instanceProfiles = iam.createInstanceProfiles(my_name, roles);

const myvpc = new awsx.ec2.Vpc("shaht-vpc", {
    numberOfAvailabilityZones: 3,
    numberOfNatGateways: 1,
    tags: { "Name": "shaht-vpc" },
});

const mycluster = new eks.Cluster("shaht-eks", {
    skipDefaultNodeGroup: true,
    vpcId: myvpc.id,
    publicSubnetIds: myvpc.publicSubnetIds,
    privateSubnetIds: myvpc.privateSubnetIds,
    instanceType: "t3a.medium",
    version: "1.21",
    nodeRootVolumeSize: 10,
    instanceRole: roles[0],
    encryptRootBockDevice: true,
    enabledClusterLogTypes: ["api", "audit", "authenticator", "controllerManager", "scheduler"],
}, {dependsOn: myvpc}
);

const mg = new eks.ManagedNodeGroup("manangednodegroup", {
    cluster: mycluster,
    capacityType: "SPOT",
    instanceTypes: ["t3a.medium"],
    nodeRole: roles[0],
    diskSize: 10,
},{dependsOn: [mycluster, myvpc]})
