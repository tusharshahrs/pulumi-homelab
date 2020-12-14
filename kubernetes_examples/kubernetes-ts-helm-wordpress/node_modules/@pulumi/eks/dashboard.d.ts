import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
export interface DashboardOptions {
}
export declare function createDashboard(name: string, args: DashboardOptions, parent: pulumi.ComponentResource, k8sProvider: k8s.Provider): void;
