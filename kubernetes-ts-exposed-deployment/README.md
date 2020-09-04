# Updating index.ts for kubernetes-ts-configmap-rollout
[kubernetes-ts-configmap-rollout](https://github.com/pulumi/examples/tree/master/kubernetes-ts-configmap-rollout) has two issues with it that need to be fixed. 
 
 1. There is a double [status](https://github.com/pulumi/examples/blob/master/kubernetes-ts-configmap-rollout/index.ts#L60) that needs to be replace with the following [code](https://github.com/tusharshahrs/pulumi-homelab/blob/master/kubernetes-ts-exposed-deployment/index.ts#L40)

 2. The **selector { matchLabels: appLabels },** is missing from below spec and above replica [here](https://github.com/pulumi/examples/blob/master/kubernetes-ts-configmap-rollout/index.ts#L27-L28):
    fix this by replacing it with [code](https://github.com/tusharshahrs/pulumi-homelab/blob/master/kubernetes-ts-exposed-deployment/index.ts#L15-L16) 