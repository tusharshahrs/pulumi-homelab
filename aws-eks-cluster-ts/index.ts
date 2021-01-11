"use strict";
//const pulumi = require("@pulumi/pulumi");
//const aws = require("@pulumi/aws");
//const awsx = require("@pulumi/awsx");
//const eks = require("@pulumi/eks");
//const kubernetes = require("@pulumi/kubernetes");

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as kubernetes from "@pulumi/kubernetes";

const name = "eks-matan";

// Create an EKS cluster with non-default configuration
const vpc = new awsx.ec2.Vpc("vpc-eks-matan",
    { subnets: [{ type: "public" },{ type: "private"}],
        cidrBlock: "10.20.0.0/16",
        //tags: [{ test:"matan" }]
        tags: {"mytest":"matan"}
    });
        
const cluster = new eks.Cluster(`${name}`, {
    vpcId: vpc.id,
    subnetIds: vpc.privateSubnetIds,
    storageClasses: "gp2",
    nodeAssociatePublicIpAddress: false,
    skipDefaultNodeGroup: true,
});

// Creating instanceProfile based on Role.
const myInstanceProfile = new aws.iam.InstanceProfile("node-instanceprofile", {role: cluster.instanceRoles[0]});

const fixedNodeGroup = cluster.createNodeGroup("eks-matan-ng1", {
    
    instanceType: "t2.medium",
    desiredCapacity: 1,
    minSize: 1,
    maxSize: 2,
    labels: {"ondemand": "true"},
    instanceProfile: myInstanceProfile,
});

const spotNodeGroup = new eks.NodeGroup("eks-matan-ng2", {
    cluster: cluster,
    instanceType: "t2.medium",
    desiredCapacity: 1,
    spotPrice: "1",
    minSize: 1,
    maxSize: 2,
    labels: {"preemptible": "true"},
    instanceProfile: myInstanceProfile,
    taints: {
        "special": {
            value: "true",
            effect: "NoSchedule",
        },
    },
}, {
    providers: { kubernetes: cluster.provider},
});

exports.kubeconfig = cluster.kubeconfig;
exports.fixedNodeGroup = fixedNodeGroup;
exports.spotNodeGroup = spotNodeGroup;
exports.vpc = vpc;