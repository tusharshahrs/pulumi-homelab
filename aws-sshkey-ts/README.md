
# AWS SSHKEY and ACM CERT creation 

AWS sshkey and acm cert creation in typescript

# Requirements

pulumi 3.0 & node 14.

## Running the App

1.  Create a new stack:

    ```
    $ pulumi stack init dev
    ```

1.  Restore NPM dependencies:

    ```
    $ npm install
    ```
    
1. Set the AWS region location to use:
    
    ```
    $ pulumi config set aws:region us-east-2
    ```

1.  Run `pulumi up` to preview and deploy changes via selecting `y`

    ```
    Previewing update (dev)

    View Live: https://app.pulumi.com/myuser/aws-sshkey-ts/dev/previews/f244c0b0-2ba0-4b9a-9b25-c6b78f6d8c54

        Type                      Name                  Plan       
    +   pulumi:pulumi:Stack       aws-sshkey-ts-dev     create     
    +   ├─ tls:index:PrivateKey   demo-key-privatekey   create     
    +   └─ tls:index:CertRequest  demo-key-certrequest  create     
    
    Resources:
        + 3 to create

    Updating (dev)

    View Live: https://app.pulumi.com/myuser/aws-sshkey-ts/dev/updates/20

        Type                      Name                  Status      
    +   pulumi:pulumi:Stack       aws-sshkey-ts-dev     created     
    +   ├─ tls:index:PrivateKey   demo-key-privatekey   created     
    +   └─ tls:index:CertRequest  demo-key-certrequest  created     
    
    Outputs:
        certrequest_id                : "42baf49e36439ff52sdfs231271fb0693289"
        certrequest_keyalgorithm      : "RSA"
        certrequest_pem               : "[secret]"
        certrequest_subjects          : [
            [0]: {
                commonName        : "democert"
                organization      : "demoorg"
            }
        ]
        sshkey_algorithm              : "RSA"
        sshkey_id                     : "4049f6f41d7fac2364565478001578170d59f"
        sshkey_privatekeypem          : "[secret]"
        sshkey_publickeyfingerprintmd5: "9a:2c:d6:e9:e2:c3:32:0c:c6:7f:e4:27:43:24:47:cc"
        sshkey_publickeyopenssh       : "ssh-rsa AAAAB3NzaC1yc2EAsfsfOaDURq4usdfRMUYMH4ow==\n"

    Resources:
        + 3 created

    Duration: 4s
    ```

1. Destroy the stack
    ` pulumi stack destroy -y`