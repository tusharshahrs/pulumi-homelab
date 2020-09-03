# Updating index.ts for kubernetes-ts-configmap-rollout
[kubernetes-ts-configmap-rollout](https://github.com/pulumi/examples/tree/master/kubernetes-ts-configmap-rollout) has two issues with it that need to be fixed. 
 
 1. There is a double [status](https://github.com/pulumi/examples/blob/master/kubernetes-ts-configmap-rollout/index.ts#L60) that needs to be replace with the following [code](https://github.com/tusharshahrs/pulumi-homelab/blob/kubernetes-ts-configmap-rollout-fix/kubernetes-ts-exposed-deployment/index.ts#L40)

 2. The selector: is missing from below spec and above replica [here](https://github.com/pulumi/examples/blob/master/kubernetes-ts-configmap-rollout/index.ts#L27-L28):
    replace it with this [code](https://github.com/tusharshahrs/pulumi-homelab/blob/kubernetes-ts-configmap-rollout-fix/kubernetes-ts-exposed-deployment/index.ts#L16) 