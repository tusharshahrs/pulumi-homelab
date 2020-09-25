"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumerGroupName = void 0;
const azure = require("@pulumi/azure");
const common_1 = require("./common");
exports.consumerGroupName = "dronetelemtry";
const evenHubNamespace = new azure.eventhub.EventHubNamespace(`${common_1.appName}-ns`, {
    resourceGroupName: common_1.resourceGroupName,
    namespaceName: eventHubNamespace.name,
    messageRetention: 1,
    partitionCount: 4,
}, { parent: eventHubNamespace });
