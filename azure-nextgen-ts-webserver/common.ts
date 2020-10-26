import * as pulumi from "@pulumi/pulumi";
import { Input, Config } from "@pulumi/pulumi"
import * as network from "@pulumi/azure-nextgen/network/latest";
import * as resources from "@pulumi/azure-nextgen/resources/latest";
const config = new pulumi.Config()
//location is required in azure-next gen
const location = config.get("location") || "westus";

interface StandardAccountArgs {
    cidrBlock: Input<string>;
    subnetCidrBlocks: Input<string>[];
    tags?: pulumi.Input <{
        [key: string]: pulumi.Input<string>;
    }>;
};

export class StandardAccount extends pulumi.ComponentResource {
    public readonly resourceGroup: resources.ResourceGroup;
    public readonly network: network.VirtualNetwork;

    constructor(name: string, args: StandardAccountArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:StandardAccount", name, args, opts);

        // All resources will share a resource group. location is required in azure-next gen
        this.resourceGroup = new resources.ResourceGroup(`${name}-rg`, {
            resourceGroupName: this.resourceGroup.name,
            location: location,
        }, {parent: this });

        // Create subnet args
        const subnets = args.subnetCidrBlocks.map((it: string, i: number) => {
            return {
                name: `${name}-subnet-${i}`,
                resourceGroupName: this.resourceGroup.name,
                location: location,
                addressPrefix: it,
            }
        });

        // Create Virtual Network
        this.network = new network.VirtualNetwork(`${name}-vnet`, {
            resourceGroupName: this.resourceGroup.name,
            virtualNetworkName: `${name}-vnet`,
            addressSpace: { addressPrefixes: [args.cidrBlock]},
            subnets: subnets,
        }, {parent: this,  });

        this.registerOutputs({});
    }
}

/* 
import * as azure_nextgen from "@pulumi/azure-nextgen";
import * as resources from "@pulumi/azure-nextgen/resources/latest";
import * as network from "@pulumi/azure-nextgen/network/latest";

import { Input } from "@pulumi/pulumi";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const location = config.get("location") || "westus";

//import * as resources from "@pulumi/azure-nextgen/resources/latest";

interface StandardAccountArgs {
    cidrBlock: Input<string>;
    subnetCidrBlocks: Input<string>[];
    location: Input<string>;
    tags?: pulumi.Input<{
        [key: string]: pulumi.Input<string>;
    }>;
};

export class StandardAccount extends pulumi.ComponentResource {
    public readonly resourceGroup: resources.ResourceGroup;
    public readonly network: network.VirtualNetwork;
    public readonly subnets: network.Subnet[];

    constructor(name: string, args, StandardAccountArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:StandardAccount", name, args, opts);

        // All resources will share a resource group
        this.resourceGroup = new resources.ResourceGroup(`${name}-rg`, {
            location: location,
            tags: args.tags,
        }, {parent: this });
    }
} */