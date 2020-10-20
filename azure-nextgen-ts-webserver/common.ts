/* import * as azure_nextgen from "@pulumi/azure-nextgen";
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