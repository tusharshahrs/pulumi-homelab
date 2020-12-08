import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import { Config, getStack, StackReference,getProject } from "@pulumi/pulumi";

const config = new pulumi.Config();
export const eksStack = new StackReference(config.require("eksclusterStack"));
export const cluster = eksStack.getOutput("eks_cluster_name");
export const kubeconfig = eksStack.getOutput("kubeconfig");
export const k8sProvider = eksStack.getProvider("k8sProvider");
export const projectName = pulumi.getProject();
export const stackName = pulumi.getStack();