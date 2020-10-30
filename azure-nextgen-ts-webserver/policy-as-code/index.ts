import * as azure from "@pulumi/azure-nextgen";
import * as resources from "@pulumi/azure-nextgen/resources/latest";
import * as storage from "@pulumi/azure-nextgen/storage/latest";
import * as network from "@pulumi/azure-nextgen/network/latest";
import * as compute from "@pulumi/azure-nextgen/compute/latest";
import * as iotcentral from "@pulumi/azure-nextgen/iotcentral/latest"

import { PolicyPack, validateResourceOfType } from "@pulumi/policy";
import * as pulumi from "@pulumi/pulumi";

new PolicyPack("azure", {
    policies: [
        {
            name: "discouraged-public-internet",
            description: "Ingress rules with public internet access are discouraged.",
            enforcementLevel: "advisory",
            validateResource: validateResourceOfType(network.SecurityRule, (resource, _, reportViolation) => {
                if (resource.sourceAddressPrefix === "*") {
                    reportViolation("`sourceAddressPrefix` should not be '*'");
                }
            }),
        },
        {
            name: "vnet-sizing",
            description: `VNETs must be of appropriate size.`,
            enforcementLevel: "advisory",
            configSchema: {
                properties: {
                    maxSubnetPrefixLength: {
                        type: "number",
                        default: 22,
                    },
                },
            },
            validateResource: validateResourceOfType(network.VirtualNetwork, (resource, args, reportViolation) => {
                const { maxSubnetPrefixLength } = args.getConfig<{ maxSubnetPrefixLength: number }>();

                resource.addressSpace?.addressPrefixes?.forEach(it => {
                    const prefixLengthAsNumber = Number.parseInt(it.split("/")[1], 10);
                    if (prefixLengthAsNumber < maxSubnetPrefixLength) {
                        reportViolation(`Address space [${it}] is too large. Must be [/${maxSubnetPrefixLength}] or smaller.`);
                    }
                });
            }),
        },
        {
            name: "required-tags",
            description: "The folowing tags are required: cost-center, stack, Name.",
            enforcementLevel: "advisory",
            validateResource: validateResourceOfType(compute.VirtualMachine, (resource, _, reportViolation) => {
                const projectName = pulumi.getProject();
                if (resource.tags?.["cost-center"] !== projectName) {
                    reportViolation(`[cost-center] tag does not match [${projectName}]`);
                }

                const stackName = pulumi.getStack();
                if (resource.tags?.["stack"] !== stackName) {
                    reportViolation(`[stack] tag does not match [${stackName}]`);
                }

                if (resource.tags?.["Name"] === undefined) {
                    reportViolation(`[Name] tag is undefined`);
                }
            }),
        },
        {
            name: "prohibited-services",
            description: "Prohibit restricted services.",
            enforcementLevel: "advisory",
            validateResource: (resource, reportViolation) => {
                const prohibitedServices = ["iotcentral"];
                prohibitedServices.forEach(it => {
                    if (resource.type.startsWith(it)) {
                        reportViolation(`Use of [${resource.type}] is prohibited`);
                    }
                });
            },
        },
        {
            name: "maximum-instance-count",
            description: "Check for maximum number of instances.",
            enforcementLevel: "advisory",
            configSchema: {
                properties: {
                    maximumInstanceCount: {
                        type: "integer",
                        default: 2,
                    },
                },
            },
            validateStack: (stack, reportViolation) => {
                const { maximumInstanceCount } = stack.getConfig<{ maximumInstanceCount: number }>();
                const instances = stack.resources.filter(it => it.isType(compute.VirtualMachine));
                if (instances.length > maximumInstanceCount) {
                    reportViolation(`Number of instances [${instances.length}] exceeds maximum number of instances [${maximumInstanceCount}].`);
                }
            },
        },
        {
            name: "allowed-image-owner",
            description: "Check machine image is from an approved publisher.",
            enforcementLevel: "advisory",
            configSchema: {
                properties: {
                    allowedPublishers: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        default: [
                            "canonical", // Ubuntu
                        ],
                    },
                },
            },
            validateResource: validateResourceOfType(compute.VirtualMachine, (resource, args, reportViolation) => {
                const { allowedPublishers } = args.getConfig<{ allowedPublishers: string[] }>();

                // Validate the publisher of the image
                const imagePublisher = resource.storageProfile?.imageReference?.publisher!;
                if (allowedPublishers.indexOf(imagePublisher) === -1) {
                    reportViolation(`Publisher [${imagePublisher}] is not one of [${allowedPublishers}].`);
                }
            }),
        },
    ],
});