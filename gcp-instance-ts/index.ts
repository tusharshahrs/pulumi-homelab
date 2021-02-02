import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const myinstance = new gcp.compute.Instance("defaultInstance", {
    name: "shahtushar",
    machineType: "n1-standard-1",
    zone: "us-central1-a",
    tags: ["owner", "tushar"],
    networkInterfaces: [{
        accessConfigs: [{}],
        network: "default",
    }],

    bootDisk: { 
        initializeParams:{
            image: "debian-cloud/debian-9",
        }, 
    },
    scratchDisks: [
        
        {"interface": "SCSI"},
        {"interface": "SCSI"},
        {"interface": "SCSI"},
        {"interface": "SCSI"},
        
    ],
    
    
})