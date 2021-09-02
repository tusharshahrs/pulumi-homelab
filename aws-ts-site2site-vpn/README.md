
# AWS VPC, VPN Gateway, Customer Gateway, VPN Connection, & VPN Connection Route

AWS VPC, VPN Gateway, Customer Gateway, VPN Connection, & VPN Connection Route

## Deployment

1. Initialize a new stack called: `dev` via [pulumi stack init](https://www.pulumi.com/docs/reference/cli/pulumi_stack_init/).

   ```bash
   pulumi stack init dev
   ```

1. Install dependencies:
   ```bash
   npm install
   ```

1. View the current config settings. This will be empty.

   ```bash
   pulumi config
   ```

   ```bash
   KEY                     VALUE
   ```

1. Populate the config.  Here are aws [endpoints](https://docs.aws.amazon.com/general/latest/gr/rande.html)
      ```bash
   pulumi config set aws:region us-east-2 # any valid aws region
   ```

1. Launch

   ```bash
   pulumi up -y
   ```

   Results
   ```bash
    Previewing update (dev)

    View Live: https://app.pulumi.com/shaht/aws-ts-site2site-vpn/dev/updates/31

        Type                                    Name                            Status       
    +   pulumi:pulumi:Stack                     aws-ts-site2site-vpn-dev        creating...  
    +   ├─ awsx:x:ec2:Vpc                       demo-site2site-vpc                  created      
    +   │  ├─ awsx:x:ec2:Subnet                 demo-site2site-vpc-private-2        created      
    +   │  │  ├─ aws:ec2:RouteTable             demo-site2site-vpc-private-2        created      
    +   pulumi:pulumi:Stack                     aws-ts-site2site-vpn-dev            creating...  
    +   │  │  ├─ aws:ec2:RouteTableAssociation  demo-site2site-vpc-private-2        created     
    +   │  │  └─ aws:ec2:Route                  demo-site2site-vpc-private-2-nat-2  created     
    +   │  ├─ awsx:x:ec2:InternetGateway        demo-site2site-vpc                  created     
    +   │  │  └─ aws:ec2:InternetGateway        demo-site2site-vpc                  created     
    +   │  ├─ awsx:x:ec2:NatGateway             demo-site2site-vpc-0                created     
    +   │  │  ├─ aws:ec2:Eip                    demo-site2site-vpc-0                created     
    +   │  │  └─ aws:ec2:NatGateway             demo-site2site-vpc-0                created     
    +   │  ├─ awsx:x:ec2:Subnet                 demo-site2site-vpc-private-1        created     
    +   │  │  ├─ aws:ec2:RouteTable             demo-site2site-vpc-private-1        created     
    +   │  │  ├─ aws:ec2:Subnet                 demo-site2site-vpc-private-1        created     
    +   │  │  ├─ aws:ec2:RouteTableAssociation  demo-site2site-vpc-private-1        created     
    +   │  │  └─ aws:ec2:Route                  demo-site2site-vpc-private-1-nat-1  created     
    +   │  ├─ awsx:x:ec2:Subnet                 demo-site2site-vpc-public-0         created     
    +   │  │  ├─ aws:ec2:RouteTable             demo-site2site-vpc-public-0         created     
    +   │  │  ├─ aws:ec2:Subnet                 demo-site2site-vpc-public-0         created     
    +   │  │  ├─ aws:ec2:Route                  demo-site2site-vpc-public-0-ig      created     
    +   │  │  └─ aws:ec2:RouteTableAssociation  demo-site2site-vpc-public-0         created     
    +   │  ├─ awsx:x:ec2:Subnet                 demo-site2site-vpc-public-2         created     
    +   │  │  ├─ aws:ec2:RouteTable             demo-site2site-vpc-public-2         created     
    +   │  │  ├─ aws:ec2:Subnet                 demo-site2site-vpc-public-2         created     
    +   │  │  ├─ aws:ec2:Route                  demo-site2site-vpc-public-2-ig      created     
    +   │  │  └─ aws:ec2:RouteTableAssociation  demo-site2site-vpc-public-2         created     
    +   │  ├─ awsx:x:ec2:Subnet                 demo-site2site-vpc-public-1         created     
    +   │  │  ├─ aws:ec2:RouteTable             demo-site2site-vpc-public-1         created     
    +   │  │  ├─ aws:ec2:Subnet                 demo-site2site-vpc-public-1         created     
    +   │  │  ├─ aws:ec2:Route                  demo-site2site-vpc-public-1-ig      created     
    +   │  │  └─ aws:ec2:RouteTableAssociation  demo-site2site-vpc-public-1         created     
    +   │  ├─ awsx:x:ec2:Subnet                 demo-site2site-vpc-private-0        created     
    +   │  │  ├─ aws:ec2:Subnet                 demo-site2site-vpc-private-0        created     
    +   │  │  ├─ aws:ec2:RouteTable             demo-site2site-vpc-private-0        created     
    +   │  │  ├─ aws:ec2:RouteTableAssociation  demo-site2site-vpc-private-0        created     
    +   │  │  └─ aws:ec2:Route                  demo-site2site-vpc-private-0-nat-0  created     
    +   │  └─ aws:ec2:Vpc                       demo-site2site-vpc                  created     
    +   ├─ aws:ec2:CustomerGateway              demo-site2site-customergateway      created     
    +   ├─ aws:ec2:VpnGateway                   demo-site2site-vpngateway           created     
    +   ├─ aws:ec2:VpnConnection                demo-site2site-vpnconnection        created     
    +   └─ aws:ec2:VpnConnectionRoute           demo-site2site-vpnconnectionroute   created     
    
    Outputs:
        customergateway_id                       : "cgw-0f094a3610ca4ff7d"
        office_vpnconnectionroute_id             : "192.168.11.0/24:vpn-0d63297be1d248e14"
        office_vpnconnectionroute_urn            : "urn:pulumi:dev::aws-ts-site2site-vpn::aws:ec2/vpnConnectionRoute:VpnConnectionRoute::demo-site2site-vpnconnectionroute"
        office_vpnconnectionroute_vpnconnectionid: "vpn-0d63297be1d248e14"
        vpcs_id                                  : "vpc-07024c488ec5940f9"
        vpcs_name                                : "vpc-07024c488ec5940f9"
        vpn_connection_id                        : "vpn-0d63297be1d248e14"
        vpn_gateway_id                           : "vgw-0919c724b026ddd7e"

    Resources:
        + 42 created

    Duration: 5m29s
   ```

1. View the outputs.
   ```bash
   pulumi stack output
   ```

   Results
   ```bash
    Current stack outputs (8):
        OUTPUT                                     VALUE
        customergateway_id                         cgw-0f094a3610ca4ff7d
        office_vpnconnectionroute_id               192.168.11.0/24:vpn-0d63297be1d248e14
        office_vpnconnectionroute_urn              urn:pulumi:dev::aws-ts-site2site-vpn::aws:ec2/vpnConnectionRoute:VpnConnectionRoute::demo-site2site-vpnconnectionroute
        office_vpnconnectionroute_vpnconnectionid  vpn-0d63297be1d248e14
        vpcs_id                                    vpc-07024c488ec5940f9
        vpcs_name                                  vpc-07024c488ec5940f9
        vpn_connection_id                          vpn-0d63297be1d248e14
        vpn_gateway_id                             vgw-0919c724b026ddd7e
   ```

1. Clean up
   ```bash
   pulumi destroy -y
   ```

1. Remove.  This will remove the *Pulumi.dev.yaml* file also
   ```bash
   pulumi stack rm dev -y
   ```