import * as pulumi from "@pulumi/pulumi";
//import * as aws from "@pulumi/aws";
//import * as awsx from "@pulumi/awsx";
import * as kafka from "@pulumi/kafka";

// This will ONLY work if it s in the SAME VPC and SAME SECURITY group as the MSK brokers(3).  Port has to be included.
const healthCheckTopic = new kafka.Topic("healthCheckTopic", {
    config: {
        "cleanup.policy": "compact",
        "segment.ms": "20000",
    },
    partitions: 3,
    replicationFactor: 3,
});

const healtCheckTopicACLWrite = new kafka.Acl("healtCheckTopicACLWrite", {
      aclHost: "*",
      aclOperation: "Write",
      aclPermissionType: "Allow",
      aclPrincipal: "User:ANONYMOUS",
      aclResourceName: healthCheckTopic.name,
      aclResourceType: "Topic",
}, {parent:healthCheckTopic, dependsOn: healthCheckTopic});

const healtCheckTopicACLRead = new kafka.Acl("healtCheckTopicACLRead", {
      aclHost: "*",
      aclOperation: "Read",
      aclPermissionType: "Allow",
      aclPrincipal: "User:ANONYMOUS",
      aclResourceName: healthCheckTopic.name,
      aclResourceType: "Topic",
}, {parent:healthCheckTopic, dependsOn: healthCheckTopic});

const commerceLocationConsumeOutgoingTopic = new kafka.Topic("commerce.location.consume.outgoing", {
    /*config: {
        "cleanup.policy": "compact",
        "segment.ms": "20000",
    },*/
    partitions: 3,
    replicationFactor: 3,
});

const commerceLocationConsumeOutgoingTopicACLWrite = new kafka.Acl("commerceLocationConsumeOutgoingTopicACLWrite", {
      aclHost: "*",
      aclOperation: "Write",
      aclPermissionType: "Allow",
      aclPrincipal: "User:ANONYMOUS",
      aclResourceName: commerceLocationConsumeOutgoingTopic.name,
      aclResourceType: "Topic",
}, {parent:commerceLocationConsumeOutgoingTopic, dependsOn: commerceLocationConsumeOutgoingTopic});

const commerceLocationConsumeOutgoingTopicACLRead = new kafka.Acl("commerceLocationConsumeOutgoingTopicACLRead", {
    aclHost: "*",
    aclOperation: "Read",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commerceLocationConsumeOutgoingTopic.name,
    aclResourceType: "Topic",
}, {parent:commerceLocationConsumeOutgoingTopic, dependsOn: commerceLocationConsumeOutgoingTopic});

const commercePaymentConsumeOutgoingTopic = new kafka.Topic("commerce.payment.consume.outgoing", {
  /*config: {
      "cleanup.policy": "compact",
      "segment.ms": "20000",
  },*/
  partitions: 3,
  replicationFactor: 3,
  //name: "commerce.payment.consume.outgoing",
});

const commercePaymentConsumeOutgoingTopicACLWrite = new kafka.Acl("commercePaymentConsumeOutgoingTopicACLWrite", {
      aclHost: "*",
      aclOperation: "Write",
      aclPermissionType: "Allow",
      aclPrincipal: "User:ANONYMOUS",
      aclResourceName: commercePaymentConsumeOutgoingTopic.name,
      aclResourceType: "Topic",
}, {parent:commercePaymentConsumeOutgoingTopic, dependsOn: commercePaymentConsumeOutgoingTopic});

const commercePaymentConsumeOutgoingTopicACLRead = new kafka.Acl("commercePaymentConsumeOutgoingTopicACLRead", {
    aclHost: "*",
    aclOperation: "Read",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commercePaymentConsumeOutgoingTopic.name,
    aclResourceType: "Topic",
}, {parent:commercePaymentConsumeOutgoingTopic, dependsOn: commercePaymentConsumeOutgoingTopic});

const commerceProductIngestCustomizableProductHeaderTopic = new kafka.Topic("commerce.product.ingest.customizable-product-header", {
  /*config: {
      "cleanup.policy": "compact",
      "segment.ms": "20003",
  },*/
  partitions: 3,
  replicationFactor: 3,
  //name: "commerce.product.ingest.customizable-product-header",
});

const commerceProductIngestCustomizableProductHeaderTopicACLWrite = new kafka.Acl("commerceProductIngestCustomizableProductHeaderTopicACLWrite", {
    aclHost: "*",
    aclOperation: "Write",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commerceProductIngestCustomizableProductHeaderTopic.name,
    aclResourceType: "Topic",
}, {parent:commerceProductIngestCustomizableProductHeaderTopic, dependsOn: commerceProductIngestCustomizableProductHeaderTopic});

const commerceProductIngestCustomizableProductHeaderTopicACLRead = new kafka.Acl("commerceProductIngestCustomizableProductHeaderTopicACLRead", {
    aclHost: "*",
    aclOperation: "Read",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commerceProductIngestCustomizableProductHeaderTopic.name,
    aclResourceType: "Topic",
}, {parent:commerceProductIngestCustomizableProductHeaderTopic, dependsOn: commerceProductIngestCustomizableProductHeaderTopic});

export const healthcheck_name = healthCheckTopic.name;
export const healthcheck_config = healthCheckTopic.config;

export const commerceLocationConsumeOutgoingTopic_name = commerceLocationConsumeOutgoingTopic.name;
export const commerceLocationConsumeOutgoingTopic_config = commerceLocationConsumeOutgoingTopic.config;

export const commercePaymentConsumeOutgoingTopic_name = commercePaymentConsumeOutgoingTopic.name;
export const commercePaymentConsumeOutgoingTopic_config = commercePaymentConsumeOutgoingTopic.config;

export const commerceProductIngestCustomizableProductHeaderTopicname = commerceProductIngestCustomizableProductHeaderTopic.name;
export const commerceProductIngestCustomizableProductHeaderTopic_config = commerceProductIngestCustomizableProductHeaderTopic.config;
