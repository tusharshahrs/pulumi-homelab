import * as pulumi from "@pulumi/pulumi";
import * as kafka from "@pulumi/kafka";

// This will ONLY work if it s in the SAME VPC and SAME SECURITY group as the MSK brokers(3).  Port has to be included.
const healthCheckTopic = new kafka.Topic("healthCheckTopic", {
    /*config: {
        "cleanup.policy": "compact",
        "segment.ms": "20000",
    },*/
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
}, {parent:healthCheckTopic});
//}, {parent:healthCheckTopic, dependsOn: healthCheckTopic});

const healtCheckTopicACLRead = new kafka.Acl("healtCheckTopicACLRead", {
      aclHost: "*",
      aclOperation: "Read",
      aclPermissionType: "Allow",
      aclPrincipal: "User:ANONYMOUS",
      aclResourceName: healthCheckTopic.name,
      aclResourceType: "Topic",
}, {parent:healthCheckTopic});
//}, {parent:healthCheckTopic, dependsOn: healthCheckTopic});

const healthCheckTopic2 = new kafka.Topic("healthCheckTopic2", {
/*    config: {
        "cleanup.policy": "compact",
        "segment.ms": "20000",
    },*/
    partitions: 3,
    replicationFactor: 3,
});

const healtCheckTopicACLWrite2 = new kafka.Acl("healtCheckTopicACLWrite2", {
      aclHost: "*",
      aclOperation: "Write",
      aclPermissionType: "Allow",
      aclPrincipal: "User:ANONYMOUS",
      aclResourceName: healthCheckTopic2.name,
      aclResourceType: "Topic",
}, {parent:healthCheckTopic2});
//}, {parent:healthCheckTopic2, dependsOn: healthCheckTopic2});

const healtCheckTopicACLRead2 = new kafka.Acl("healtCheckTopicACLRead2", {
      aclHost: "*",
      aclOperation: "Read",
      aclPermissionType: "Allow",
      aclPrincipal: "User:ANONYMOUS",
      aclResourceName: healthCheckTopic2.name,
      aclResourceType: "Topic",
}, {parent:healthCheckTopic2});
//}, {parent:healthCheckTopic2, dependsOn: healthCheckTopic2});

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
}, {parent:commerceLocationConsumeOutgoingTopic});
//}, {parent:commerceLocationConsumeOutgoingTopic, dependsOn: commerceLocationConsumeOutgoingTopic});

const commerceLocationConsumeOutgoingTopicACLRead = new kafka.Acl("commerceLocationConsumeOutgoingTopicACLRead", {
    aclHost: "*",
    aclOperation: "Read",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commerceLocationConsumeOutgoingTopic.name,
    aclResourceType: "Topic",
}, {parent:commerceLocationConsumeOutgoingTopic});
//}, {parent:commerceLocationConsumeOutgoingTopic, dependsOn: commerceLocationConsumeOutgoingTopic});

const commerceLocationConsumeOutgoingTopic2 = new kafka.Topic("commerceLocationConsumeOutgoingTopic2", {
    /*config: {
        "cleanup.policy": "compact",
        "segment.ms": "20000",
    },*/
    partitions: 3,
    replicationFactor: 3,
});

const commerceLocationConsumeOutgoingTopicACLWrite2 = new kafka.Acl("commerceLocationConsumeOutgoingTopicACLWrite2", {
      aclHost: "*",
      aclOperation: "Write",
      aclPermissionType: "Allow",
      aclPrincipal: "User:ANONYMOUS",
      aclResourceName: commerceLocationConsumeOutgoingTopic2.name,
      aclResourceType: "Topic",
}, {parent:commerceLocationConsumeOutgoingTopic2});
//}, {parent:commerceLocationConsumeOutgoingTopic2, dependsOn: commerceLocationConsumeOutgoingTopic2});

const commerceLocationConsumeOutgoingTopicACLRead2 = new kafka.Acl("commerceLocationConsumeOutgoingTopicACLRead2", {
    aclHost: "*",
    aclOperation: "Read",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commerceLocationConsumeOutgoingTopic2.name,
    aclResourceType: "Topic",
}, {parent:commerceLocationConsumeOutgoingTopic2});
//}, {parent:commerceLocationConsumeOutgoingTopic2, dependsOn: commerceLocationConsumeOutgoingTopic2});

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
}, {parent:commercePaymentConsumeOutgoingTopic});
//}, {parent:commercePaymentConsumeOutgoingTopic, dependsOn: commercePaymentConsumeOutgoingTopic});

const commercePaymentConsumeOutgoingTopicACLRead = new kafka.Acl("commercePaymentConsumeOutgoingTopicACLRead", {
    aclHost: "*",
    aclOperation: "Read",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commercePaymentConsumeOutgoingTopic.name,
    aclResourceType: "Topic",
}, {parent:commercePaymentConsumeOutgoingTopic});
//}, {parent:commercePaymentConsumeOutgoingTopic, dependsOn: commercePaymentConsumeOutgoingTopic});

const commercePaymentConsumeOutgoingTopic2 = new kafka.Topic("commerce.payment.consume.outgoing2", {
    /*config: {
        "cleanup.policy": "compact",
        "segment.ms": "20000",
    },*/
    partitions: 3,
    replicationFactor: 3,
    //name: "commerce.payment.consume.outgoing",
  });
  
const commercePaymentConsumeOutgoingTopicACLWrite2 = new kafka.Acl("commercePaymentConsumeOutgoingTopicACLWrite2", {
    aclHost: "*",
    aclOperation: "Write",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commercePaymentConsumeOutgoingTopic2.name,
    aclResourceType: "Topic",
  }, {parent:commercePaymentConsumeOutgoingTopic2});
  //}, {parent:commercePaymentConsumeOutgoingTopic2, dependsOn: commercePaymentConsumeOutgoingTopic2});
  
const commercePaymentConsumeOutgoingTopicACLRead2 = new kafka.Acl("commercePaymentConsumeOutgoingTopicACLRead2", {
    aclHost: "*",
    aclOperation: "Read",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commercePaymentConsumeOutgoingTopic2.name,
    aclResourceType: "Topic",
}, {parent:commercePaymentConsumeOutgoingTopic2});
//}, {parent:commercePaymentConsumeOutgoingTopic2, dependsOn: commercePaymentConsumeOutgoingTopic2});
  
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
}, {parent:commerceProductIngestCustomizableProductHeaderTopic});
//}, {parent:commerceProductIngestCustomizableProductHeaderTopic, dependsOn: commerceProductIngestCustomizableProductHeaderTopic});

const commerceProductIngestCustomizableProductHeaderTopicACLRead = new kafka.Acl("commerceProductIngestCustomizableProductHeaderTopicACLRead", {
    aclHost: "*",
    aclOperation: "Read",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commerceProductIngestCustomizableProductHeaderTopic.name,
    aclResourceType: "Topic",
}, {parent:commerceProductIngestCustomizableProductHeaderTopic});
//}, {parent:commerceProductIngestCustomizableProductHeaderTopic, dependsOn: commerceProductIngestCustomizableProductHeaderTopic});

const commerceProductIngestCustomizableProductHeaderTopic2 = new kafka.Topic("commerce.product.ingest.customizable-product-header2", {
    /*config: {
        "cleanup.policy": "compact",
        "segment.ms": "20003",
    },*/
    partitions: 3,
    replicationFactor: 3,
  });
  
const commerceProductIngestCustomizableProductHeaderTopicACLWrite2 = new kafka.Acl("commerceProductIngestCustomizableProductHeaderTopicACLWrite2", {
    aclHost: "*",
    aclOperation: "Write",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commerceProductIngestCustomizableProductHeaderTopic2.name,
    aclResourceType: "Topic",
}, {parent:commerceProductIngestCustomizableProductHeaderTopic2});
//}, {parent:commerceProductIngestCustomizableProductHeaderTopic2, dependsOn: commerceProductIngestCustomizableProductHeaderTopic2});
  
const commerceProductIngestCustomizableProductHeaderTopicACLRead2 = new kafka.Acl("commerceProductIngestCustomizableProductHeaderTopicACLRead2", {
    aclHost: "*",
    aclOperation: "Read",
    aclPermissionType: "Allow",
    aclPrincipal: "User:ANONYMOUS",
    aclResourceName: commerceProductIngestCustomizableProductHeaderTopic2.name,
    aclResourceType: "Topic",
}, {parent:commerceProductIngestCustomizableProductHeaderTopic2});
//}, {parent:commerceProductIngestCustomizableProductHeaderTopic2, dependsOn: commerceProductIngestCustomizableProductHeaderTopic2});

export const healthcheck_name = healthCheckTopic.name;
export const healthcheck_config = healthCheckTopic.config;

export const healthcheck_name2 = healthCheckTopic2.name;
export const healthcheck_config2 = healthCheckTopic2.config;

export const commerceLocationConsumeOutgoingTopic_name = commerceLocationConsumeOutgoingTopic.name;
export const commerceLocationConsumeOutgoingTopic_config = commerceLocationConsumeOutgoingTopic.config;

export const commercePaymentConsumeOutgoingTopic_name = commercePaymentConsumeOutgoingTopic.name;
export const commercePaymentConsumeOutgoingTopic_config = commercePaymentConsumeOutgoingTopic.config;

export const commerceProductIngestCustomizableProductHeaderTopicname = commerceProductIngestCustomizableProductHeaderTopic.name;
export const commerceProductIngestCustomizableProductHeaderTopic_config = commerceProductIngestCustomizableProductHeaderTopic.config;
