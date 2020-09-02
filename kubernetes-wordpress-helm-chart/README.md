# Updating Helm3 Chart for kubernetes-ts-helm-wordpress
[kubernetes-ts-helm-wordpress](https://github.com/pulumi/examples/tree/master/kubernetes-ts-helm-wordpress) has wordpress helm chart that is no longer valid because
 
 1. The wordpress chart changed locations to bitnami/wordpress
    ```
    $ helm search hub wordpress
    URL                                               	CHART VERSION	APP VERSION	DESCRIPTION
    https://hub.helm.sh/charts/bitnami/wordpress      	9.5.3        	5.5.1      	Web publishing platform for building blogs and ...
    https://hub.helm.sh/charts/presslabs/wordpress-...	0.10.4       	0.10.4     	Presslabs WordPress Operator Helm Chart
    https://hub.helm.sh/charts/presslabs/wordpress-...	v0.10.2      	v0.10.2    	A Helm chart for deploying a WordPress site on ...
    ```
 2. helm moved from version [2](https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/kubernetes/helm/v2/) to version [3](https://www.pulumi.com/docs/reference/pkg/nodejs/pulumi/kubernetes/helm/v3/#module-helm-v3)


Code that needed to be updated is [wordpress block](https://github.com/pulumi/examples/blob/master/kubernetes-ts-helm-wordpress/index.ts#L13-L17)