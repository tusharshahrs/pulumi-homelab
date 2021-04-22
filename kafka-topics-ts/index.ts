import * as pulumi from "@pulumi/pulumi";
import * as kafka from "@pulumi/kafka";

// This will ONLY work if it is in the SAME VPC and SAME SECURITY group as the MSK brokers(3).  Port has to be included.
const healthCheckTopic = new kafka.Topic("healthCheckTopic", {
    config: {
        "cleanup.policy": "compact",
        "segment.ms": "20000",
    },
    partitions: 3,
    replicationFactor: 2,
    
    name: "healthCheckTopic"
});

const commerceLocationConsumeOutgoingTopic = new kafka.Topic("commerce.location.consume.outgoing", {
    config: {
        "cleanup.policy": "compact",
        "segment.ms": "20001",
    },
    partitions: 3,
    replicationFactor: 3,
    name: "commerce.location.consume.outgoing",
});

const healtCheckTopicACL = new kafka.Acl("healtCheckTopicACL", {
    aclHost: "*",
    aclOperation: "Write",
    aclPermissionType: "Allow",
    aclPrincipal: "User:CN=msk-healthcheck-producer",
    aclResourceName: healthCheckTopic.name,
    aclResourceType: "Topic",
});

const commercePaymentConsumeOutgoingTopic = new kafka.Topic("commerce.payment.consume.outgoing", {
    config: {
        "cleanup.policy": "compact",
        "segment.ms": "20002",
    },
    partitions: 3,
    replicationFactor: 3,
    name: "commerce.payment.consume.outgoing",
});

const commerceProductIngestCustomizableProductHeaderTopic = new kafka.Topic("commerce.product.ingest.customizable-product-header", {
    config: {
        "cleanup.policy": "compact",
        "segment.ms": "20003",
    },
    partitions: 3,
    replicationFactor: 3,
    name: "commerce.product.ingest.customizable-product-header",
});

export const healthcheck_name = healthCheckTopic.name;
export const healthcheck_config = healthCheckTopic.config;

export const commerceLocationConsumeOutgoingTopic_name = commerceLocationConsumeOutgoingTopic.name;
export const commerceLocationConsumeOutgoingTopic_config = commerceLocationConsumeOutgoingTopic.config;

export const commercePaymentConsumeOutgoingTopic_name = commercePaymentConsumeOutgoingTopic.name;
export const commercePaymentConsumeOutgoingTopic_config = commercePaymentConsumeOutgoingTopic.config;

export const commerceProductIngestCustomizableProductHeaderTopicname = commerceProductIngestCustomizableProductHeaderTopic.name;
export const commerceProductIngestCustomizableProductHeaderTopic_config = commerceProductIngestCustomizableProductHeaderTopic.config;