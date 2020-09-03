# Updating index.ts for kubernetes-ts-configmap-rollout
[kubernetes-ts-configmap-rollout](https://github.com/pulumi/examples/tree/master/kubernetes-ts-configmap-rollout) has wordpress helm chart that is no longer valid because
 
 1. There is a double [status](https://github.com/pulumi/examples/blob/master/kubernetes-ts-configmap-rollout/index.ts#L60) that needs to be replace with the following [code](www.google.com)

 2. The selector: is missing from below spec and above replica [here](https://github.com/pulumi/examples/blob/master/kubernetes-ts-configmap-rollout/index.ts#L27):
    replace it with this [code](www.google.com) 