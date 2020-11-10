import * as pulumi from "@pulumi/pulumi";
import { Input } from "@pulumi/pulumi"
import * as network from "@pulumi/azure-nextgen/network/latest";
import * as resources from "@pulumi/azure-nextgen/resources/latest";

interface StandardAccountArgs {
    cidrBlock: Input<string>;
    subnetCidrBlocks: Input<string>[];
    location: Input<string>;
    tags?: pulumi.Input <{
        [key: string]: pulumi.Input<string>;
    }>;
};

export class StandardAccount extends pulumi.ComponentResource {
    public readonly resourceGroup: resources.ResourceGroup;
    public readonly network: network.VirtualNetwork;
    public readonly subnets: network.Subnet[];

    constructor(name: string, args: StandardAccountArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:x:StandardAccount", name, args, opts);
        // location is required in azure-next gen
        // All resources will share a resource group.
        this.resourceGroup = new resources.ResourceGroup(`${name}-rg`, {
            resourceGroupName: `${name}-rg`,
            location: args.location,
        }, {parent: this });

        // Creates a Virtual Network
        this.network = new network.VirtualNetwork(`${name}-vnet`, {
            resourceGroupName: this.resourceGroup.name,
            location: args.location,
            virtualNetworkName: `${name}-vnet`,
            addressSpace: { addressPrefixes: [args.cidrBlock]},
        }, {parent: this, ignoreChanges:["tags"] }); // This is because we hit this error: Custom diff for VirtualNetwork https://github.com/pulumi/pulumi-azure-nextgen-provider/issues/74

        // Create subnets
        this.subnets = [];
        for (let i = 0; i < (args.subnetCidrBlocks?.length ?? 0); i++) {
            const subnet = new network.Subnet(`${name}-subnet-${i}`, {
                resourceGroupName: this.resourceGroup.name,
                virtualNetworkName: this.network.name,
                subnetName: `${name}-subnet-${i}`,
                addressPrefix: args.subnetCidrBlocks[i],
            }, { parent: this.network, });
             this.subnets.push(subnet);
        }
        this.registerOutputs({});
    }
}