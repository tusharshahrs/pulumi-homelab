
# AWS EKS with ALB ingress controller via helm3 chart

Stands up a vpc, eks cluster, and alb ingress controller via helm3 chart

# Issue
Pulumi deploys helm charts slightly differently than helm install.  This means that the self-signed certs that the Helm chart generates are getting re-generated on each pulumi up which results in the certificate data changing and the updated/replaced resources.
This is also contributing to the TLS errors as the certificates are changing, and leading to a race condition with validating them.

# General Solution

The best way to to work around this is to tell pulumi to ignore changes to these properties. This means pulumi will set the certificate properties on the first up and then leave them unchanged on subsequent ups.
We can use Pulumi's [transformations functionality](https://www.pulumi.com/docs/intro/concepts/resources/#transformations) to set [ignoreChanges](https://www.pulumi.com/docs/intro/concepts/resources/#ignorechanges) on the child resources of the Helm chart in this case.
## Running the App

1.  Create a new stack:

    ```
    $ pulumi stack init dev
    ```

1.  Restore NPM dependencies:

    ```
    $ npm install
    ```
    
1. Set the AWS region location to use.  This has to match the same region as the console created lambda function
    
    ```
    $ pulumi config set aws:region us-east-2
    ```

1.  Run `pulumi up` and select `y`

    ```
        Previewing update (dev)

        View Live: https://app.pulumi.com/shaht/aws-eks-alb-controller-helm-x509-selfsigned-ts/dev/previews/84ce9512-7924-4a70-a389-e166afb5f8b9

            Type                            Name                                                Plan       
        +   pulumi:pulumi:Stack             aws-eks-alb-controller-helm-x509-selfsigned-ts-dev  create.    
        +   ├─ eks:index:Cluster            demo-cluster                                        create     
        +   │  ├─ eks:index:ServiceRole       demo-cluster-instanceRole                           create     
        +   │  └─ eks:index:ServiceRole       demo-cluster-eksRole                                create     
        +   │     └─ aws:iam:Role             demo-cluster-eksRole-role                           create..   
        +   │     └─ aws:iam:Role             demo-cluster-eksRole-role                           create..   
        +   │  │  └─ aws:iam:Role             demo-cluster-instanceRole-role                      create     
        +   ├─ awsx:x:ec2:Vpc                 demo-vpc                                            create     
        +   │  └─ eks:index:RandomSuffix      demo-cluster-cfnStackName                           create     
        +   │  ├─ awsx:x:ec2:NatGateway       demo-vpc-0                                          create     
        +   │  │  └─ aws:ec2:Eip              demo-vpc-0                                          create     
        +   │  │  └─ aws:ec2:Eip              demo-vpc-0                                          create     
        +   │  │  └─ aws:ec2:RouteTable       demo-vpc-public-0                                   create     
        +   │  │  └─ aws:ec2:RouteTable       demo-vpc-private-1                                  create..   
        +   │  │  └─ aws:ec2:RouteTable       demo-vpc-private-1                                  create     
        +   │  │  └─ aws:ec2:RouteTable       demo-vpc-public-1                                   create..   
        +   │  │  └─ aws:ec2:RouteTable       demo-vpc-public-1                                   create     
        +   │  │  └─ aws:ec2:RouteTable       demo-vpc-public-1                                   create     
        +   │  │  └─ aws:ec2:Subnet           demo-vpc-public-1                                   create..   
        +   │  │  └─ aws:ec2:Subnet           demo-vpc-public-1                                   create..   
        +   │  │  └─ aws:ec2:Subnet                demo-vpc-public-1                                   create     
        +   │  │  └─ aws:ec2:Subnet                demo-vpc-public-1                                   create     
        +   │  │  └─ aws:ec2:Subnet                demo-vpc-public-1                                   create     
        +   │  │  └─ aws:ec2:Subnet                demo-vpc-public-1                                   create     
        +   │  │  └─ aws:ec2:Subnet                demo-vpc-public-1                                   create     
        +   │  ├─ awsx:x:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  ├─ awsx:x:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  ├─ awsx:x:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  ├─ awsx:x:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  ├─ awsx:x:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  ├─ awsx:x:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  ├─ awsx:x:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  ├─ awsx:x:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  ├─ awsx:x:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  ├─ aws:ec2:Eip                    demo-vpc-1                                          create     
        +   │  │  ├─ aws:ec2:Eip                    demo-vpc-1                                          create     
        +   │  └─ aws:eks:Cluster                   demo-cluster-eksCluster                             create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  │  └─ aws:ec2:NatGateway             demo-vpc-1                                          create     
        +   │  ├─ awsx:x:ec2:InternetGateway                                  demo-vpc                                                    create     
        +   │  │  └─ aws:ec2:InternetGateway                                  demo-vpc                                                    create     
        +   │  ├─ awsx:x:ec2:Subnet                                           demo-vpc-private-0                                          create     
        +   │  │  ├─ aws:ec2:Subnet                                           demo-vpc-private-0                                          create     
        +   │  │  ├─ aws:ec2:RouteTable                                       demo-vpc-private-0                                                           create     
        +   │  │  ├─ aws:ec2:RouteTableAssociation                                         demo-vpc-private-0                                                           create     
        +   │  │  └─ aws:ec2:Route                                                         demo-vpc-private-0-nat-0                                                            create     
        +   │  └─ aws:ec2:Vpc                                                              demo-vpc                                                                            create     
        +   └─ kubernetes:helm.sh/v3:Chart                                                   albcontrollerhelm                                                                   create     
        +      ├─ kubernetes:rbac.authorization.k8s.io/v1:ClusterRoleBinding                 albcontrollerhelm-aws-load-balancer-controller-rolebinding                          create     
        +      ├─ kubernetes:core/v1:Service                                                 default/aws-load-balancer-webhook-service                                           create     
        +      ├─ kubernetes:core/v1:ServiceAccount                                          default/albcontrollerhelm-aws-load-balancer-controller                              create     
        +   pulumi:pulumi:Stack                                                              aws-eks-alb-controller-helm-x509-selfsigned-ts-dev                                  create     
        +      ├─ kubernetes:rbac.authorization.k8s.io/v1:Role                               default/albcontrollerhelm-aws-load-balancer-controller-leader-election-role         create     
        +      ├─ kubernetes:admissionregistration.k8s.io/v1:MutatingWebhookConfiguration    aws-load-balancer-webhook                                                           create     
        +      ├─ kubernetes:rbac.authorization.k8s.io/v1:RoleBinding                        default/albcontrollerhelm-aws-load-balancer-controller-leader-election-rolebinding  create     
        +      ├─ kubernetes:apps/v1:Deployment                                              default/albcontrollerhelm-aws-load-balancer-controller                              create     
        +      ├─ kubernetes:admissionregistration.k8s.io/v1:ValidatingWebhookConfiguration  aws-load-balancer-webhook                                                           create     
        +      ├─ kubernetes:core/v1:Secret                                                  default/aws-load-balancer-tls                                                       create     
        +      ├─ kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition                ingressclassparams.elbv2.k8s.aws                                                    create     
        +      └─ kubernetes:apiextensions.k8s.io/v1:CustomResourceDefinition                targetgroupbindings.elbv2.k8s.aws                                                   create     
        
        Resources:
            + 71 to create

        Do you want to perform this update? yes
        Updating (dev)

        View Live: https://app.pulumi.com/myuser/aws-eks-alb-controller-helm-x509-selfsigned-ts/dev/updates/44

            Type                              Name                                                Status       
        +   pulumi:pulumi:Stack               aws-eks-alb-controller-helm-x509-selfsigned-ts-dev  creating     
        +   ├─ eks:index:Cluster              demo-cluster                                        creating...  
        +   │  ├─ eks:index:ServiceRole       demo-cluster-eksRole                                creating     
        +   │  └─ eks:index:ServiceRole       demo-cluster-instanceRole                           creating     
        +   │  └─ eks:index:RandomSuffix      demo-cluster-cfnStackName                           creating     
        +   ├─ kubernetes:helm.sh/v3:Chart    albcontrollerhelm                                   created      
        +   ├─ kubernetes:helm.sh/v3:Chart    albcontrollerhelm                                   created      
        +   ├─ kubernetes:helm.sh/v3:Chart    albcontrollerhelm                                   created      
        +   │  ├─ eks:index:ServiceRole       demo-cluster-instanceRole                           creating     
        +   │  ├─ eks:index:ServiceRole       demo-cluster-instanceRole                           creating.    
        +      ├─ awsx:x:ec2:Subnet                demo-vpc-private-0                                  created      
        +      ├─ awsx:x:ec2:Subnet                demo-vpc-private-0                                  created      
        +      ├─ awsx:x:ec2:Subnet                demo-vpc-private-0                                  created      
        +      ├─ awsx:x:ec2:Subnet                demo-vpc-private-0                                  created      
        +      ├─ awsx:x:ec2:Subnet                demo-vpc-private-0                                  created      
        +      ├─ awsx:x:ec2:Subnet                demo-vpc-private-0                                  created      
        +   ├─ eks:index:Cluster                   demo-cluster                                        creating..   
        +      │  └─ aws:ec2:Eip                   demo-vpc-1                                          created      
        +      ├─ awsx:x:ec2:InternetGateway       demo-vpc                                            created      
        +      │  └─ aws:ec2:InternetGateway       demo-vpc                                            creating     
        +      │  └─ aws:ec2:InternetGateway       demo-vpc                                            creating     
        +      │  └─ aws:ec2:InternetGateway       demo-vpc                                            creating     
        +      ├─ awsx:x:ec2:Subnet                demo-vpc-public-1                                   created      
        +      ├─ awsx:x:ec2:Subnet                demo-vpc-public-1                                   created      
        +      │  └─ aws:ec2:RouteTable            demo-vpc-public-1                                   creating     
        +      │  └─ aws:ec2:Subnet                demo-vpc-public-1                                   creating     
        +      │  └─ aws:ec2:RouteTable            demo-vpc-private-0                                  created      
        +      ├─ awsx:x:ec2:Subnet                demo-vpc-private-1                                  created      
        +      ├─ awsx:x:ec2:Subnet                 demo-vpc-private-1                                  created      
        +      │  ├─ aws:ec2:Subnet                 demo-vpc-private-1                                  created      
        +      │  ├─ aws:ec2:Subnet                 demo-vpc-private-1                                  created      
        +      │  ├─ aws:ec2:Subnet                 demo-vpc-public-1                                   creating.    
        +      │  ├─ aws:ec2:Subnet                 demo-vpc-public-1                                   created      
        +      │  └─ aws:ec2:RouteTableAssociation  demo-vpc-private-1                                  created      
        +      │  └─ aws:ec2:RouteTableAssociation  demo-vpc-private-1                                  created      
        +      │  └─ aws:ec2:RouteTableAssociation  demo-vpc-private-1                                  created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            creating     
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                  demo-vpc-private-1-nat-1                            created      
        +      │  └─ aws:ec2:Route                   demo-vpc-private-1-nat-1                                created      
        +      │  └─ aws:ec2:Route                                                           demo-vpc-private-1-nat-1                                created      
        +      │  └─ aws:ec2:Route                                                           demo-vpc-private-1-nat-1                                created      
        +      │  └─ aws:ec2:Route                                                           demo-vpc-private-1-nat-1                                                            created      
        +      │  └─ aws:ec2:Route                                                           demo-vpc-private-1-nat-1                                                            created      
        +      │  └─ aws:ec2:Route                                                           demo-vpc-private-1-nat-1                                                            created      
        +      │  └─ aws:ec2:Route                                                           demo-vpc-private-1-nat-1                                                            created      
        +      │  └─ aws:ec2:Route                                                           demo-vpc-private-1-nat-1                                                            created      
        +      │  └─ aws:ec2:Route                                                           demo-vpc-private-1-nat-1                                                            created      
        +      │  └─ aws:ec2:Route                                                           demo-vpc-private-1-nat-1                                                            created      
        +      │  └─ aws:ec2:Route                                                           demo-vpc-private-1-nat-1                                                            created      
        +      ├─ awsx:x:ec2:NatGateway                                                      demo-vpc-0                                                                          created     
        +      │  ├─ aws:ec2:Eip                                                             demo-vpc-0                                                                          created     
        +      │  └─ aws:ec2:NatGateway                                                      demo-vpc-0                                                                          created     
        +      ├─ awsx:x:ec2:Subnet                                                          demo-vpc-public-0                                                                   created     
        +      │  ├─ aws:ec2:RouteTable                                                      demo-vpc-public-0                                                                   created     
        +      │  ├─ aws:ec2:Subnet                                                          demo-vpc-public-0                                                                   created     
        +      │  ├─ aws:ec2:Route                                                           demo-vpc-public-0-ig                                                                created     
        +      │  └─ aws:ec2:RouteTableAssociation                                           demo-vpc-public-0                                                                   created     
        +      └─ aws:ec2:Vpc                                                                demo-vpc                                                                            created     
        
        Diagnostics:
        pulumi:pulumi:Stack (aws-eks-alb-controller-helm-x509-selfsigned-ts-dev):
            Warning: apiextensions.k8s.io/v1beta1 CustomResourceDefinition is deprecated in v1.16+, unavailable in v1.22+; use apiextensions.k8s.io/v1 CustomResourceDefinition
        
        Resources:
            + 71 created

    ```
  
1.  Run `pulumi up` again and it will say that changes are being made.  We did not change anythign yet.

    ```
            $ pulumi up
        Previewing update (dev)

        View Live: https://app.pulumi.com/myuser/aws-eks-alb-controller-helm-x509-selfsigned-ts/dev/previews/f8a6c984-0106-4a87-b52a-fb6043a9354e

            Type                                                                             Name                                                Plan  
            pulumi:pulumi:Stack                                                              aws-eks-alb-controller-helm-x509-selfsigned-ts-dev        
            └─ kubernetes:helm.sh/v3:Chart                                                   albcontrollerhelm                                     
        ~      ├─ kubernetes:admissionregistration.k8s.io/v1:ValidatingWebhookConfiguration  aws-load-balancer-webhook                           up
        ~      ├─ kubernetes:admissionregistration.k8s.io/v1:MutatingWebhookConfiguration    aws-load-balancer-webhook                           up
        +-     └─ kubernetes:core/v1:Secret                                                  default/aws-load-balancer-tls                       re
        
        Resources:
            ~ 2 to update
            +-1 to replace
            3 changes. 68 unchanged

        Do you want to perform this update? details
        pulumi:pulumi:Stack: (same)
            [urn=urn:pulumi:dev::aws-eks-alb-controller-helm-x509-selfsigned-ts::pulumi:pulumi:Stack::aws-eks-alb-controller-helm-x509-selfsigned-ts-dev]
                ~ kubernetes:admissionregistration.k8s.io/v1:ValidatingWebhookConfiguration: (update)
                    [id=aws-load-balancer-webhook]
                    [urn=urn:pulumi:dev::aws-eks-alb-controller-helm-x509-selfsigned-ts::kubernetes:helm.sh/v3:Chart$kubernetes:admissionregistration.k8s.io/v1:ValidatingWebhookConfiguration::aws-load-balancer-webhook]
                    [provider=urn:pulumi:dev::aws-eks-alb-controller-helm-x509-selfsigned-ts::eks:index:Cluster$pulumi:providers:kubernetes::demo-cluster-provider::fc901cf7-6b7c-4fea-afc5-0477fc836ed5]
                ~ webhooks: [
                    ~ [0]: {
                            ~ clientConfig: {
                                ~ caBundle: "LS123" => "LK432"
                                }
                            }
                    ~ [1]: {
                            ~ clientConfig: {
                                ~ caBundle: "LS123" => "LK432"
                                }
                            }
                    ]
                ~ kubernetes:admissionregistration.k8s.io/v1:MutatingWebhookConfiguration: (update)
                    [id=aws-load-balancer-webhook]
                    [urn=urn:pulumi:dev::aws-eks-alb-controller-helm-x509-selfsigned-ts::kubernetes:helm.sh/v3:Chart$kubernetes:admissionregistration.k8s.io/v1:MutatingWebhookConfiguration::aws-load-balancer-webhook]
                    [provider=urn:pulumi:dev::aws-eks-alb-controller-helm-x509-selfsigned-ts::eks:index:Cluster$pulumi:providers:kubernetes::demo-cluster-provider::fc901cf7-6b7c-4fea-afc5-0477fc836ed5]
                ~ webhooks: [
                    ~ [0]: {
                            ~ clientConfig: {
                                ~ caBundle: "LS123" => "LK432"
                                }
                            }
                    ~ [1]: {
                            ~ clientConfig: {
                                ~ caBundle: "LS123" => "LK432"
                                }
                            }
                    ]
                --kubernetes:core/v1:Secret: (delete-replaced)
                    [id=default/aws-load-balancer-tls]
                    [urn=urn:pulumi:dev::aws-eks-alb-controller-helm-x509-selfsigned-ts::kubernetes:helm.sh/v3:Chart$kubernetes:core/v1:Secret::default/aws-load-balancer-tls]
                    [provider=urn:pulumi:dev::aws-eks-alb-controller-helm-x509-selfsigned-ts::eks:index:Cluster$pulumi:providers:kubernetes::demo-cluster-provider::fc901cf7-6b7c-4fea-afc5-0477fc836ed5]
                +-kubernetes:core/v1:Secret: (replace)
                    [id=default/aws-load-balancer-tls]
                    [urn=urn:pulumi:dev::aws-eks-alb-controller-helm-x509-selfsigned-ts::kubernetes:helm.sh/v3:Chart$kubernetes:core/v1:Secret::default/aws-load-balancer-tls]
                    [provider=urn:pulumi:dev::aws-eks-alb-controller-helm-x509-selfsigned-ts::eks:index:Cluster$pulumi:providers:kubernetes::demo-cluster-provider::fc901cf7-6b7c-4fea-afc5-0477fc836ed5]
                ~ data: {
                    }
                ++kubernetes:core/v1:Secret: (create-replacement)
                    [id=default/aws-load-balancer-tls]
                    [urn=urn:pulumi:dev::aws-eks-alb-controller-helm-x509-selfsigned-ts::kubernetes:helm.sh/v3:Chart$kubernetes:core/v1:Secret::default/aws-load-balancer-tls]
                    [provider=urn:pulumi:dev::aws-eks-alb-controller-helm-x509-selfsigned-ts::eks:index:Cluster$pulumi:providers:kubernetes::demo-cluster-provider::fc901cf7-6b7c-4fea-afc5-0477fc836ed5]
                ~ data: {
                    }
    ```

1.  Note that it wants to:  **delete-replaced**, **replace**, **create_replace**. This is because we are using a self signed cert.

1. When you add the [transformation block](https://github.com/tusharshahrs/pulumi-homelab/blob/master/aws-eks-alb-controller-helm-x509-selfsigned-ts/index.ts#L48-L73) of code in the index.ts, and then run `pulumi up`, you get no changes.

```
    Previewing update (dev)

    View Live: https://app.pulumi.com/myuser/aws-eks-alb-controller-helm-x509-selfsigned-ts/dev/previews/e2756393-3a79-4ec1-b433-0ab3825fcbd3

        Type                 Name                                                Plan     Info
        pulumi:pulumi:Stack  aws-eks-alb-controller-helm-x509-selfsigned-ts-dev           3 messages
    
    Diagnostics:
    pulumi:pulumi:Stack (aws-eks-alb-controller-helm-x509-selfsigned-ts-dev):
        aws-load-balancer-controller transformation: Ignoring changes to TLS certificate on [undefined].
        aws-load-balancer-controller transformation: Ignoring changes to TLS certificate on [undefined].
        aws-load-balancer-controller transformation: Ignoring changes to TLS certificate on [undefined].
    

    Do you want to perform this update?  [Use arrows to move, enter to select, type to filter]
    yes
    > no
    details
```