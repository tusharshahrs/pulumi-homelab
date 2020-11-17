package main

import (
	"github.com/pulumi/pulumi-gcp/sdk/v3/go/gcp/compute"
	"github.com/pulumi/pulumi/sdk/v2/go/pulumi"
	"github.com/pulumi/pulumi/sdk/v2/go/pulumi/config"
)

func main() {
	pulumi.Run(flareproxy)
}

type RegionSettings struct {
	VmType string `json:"vmType"`
	Subnet string `json:"subnet"`
}

func flareproxy(ctx *pulumi.Context) error {
	stackName := ctx.Stack()
	commonName := stackName
	cfg := config.New(ctx, "")
	var regions map[string]RegionSettings
	cfg.RequireObject("regions", &regions)
	version := cfg.Require("version")
	gcsReleasesUrl := cfg.Require("gcsReleasesUrl")
	hostname := cfg.Require("hostname")
	cacheAddr := cfg.Require("cacheAddr")
	network := cfg.Require("network")

	var labels map[string]string
	labelsInput := pulumi.StringMap{}
	if err := cfg.GetObject("labels", &labels); err == nil {
		for k, v := range labels {
			labelsInput[k] = pulumi.String(v)
		}
	}

	globalIp, err := compute.NewGlobalAddress(ctx, commonName, &compute.GlobalAddressArgs{
		Labels: labelsInput,
	})
	if err != nil {
		return err
	}
	ctx.Export("globalIp", globalIp.Address)

	sslCertificate, err := compute.NewManagedSslCertificate(ctx, commonName, &compute.ManagedSslCertificateArgs{
		Managed: compute.ManagedSslCertificateManagedArgs{
			Domains: pulumi.StringArray{
				pulumi.String(hostname),
			},
		},
	})
	if err != nil {
		return err
	}

	healthCheck, err := compute.NewHealthCheck(ctx, commonName, &compute.HealthCheckArgs{
		TcpHealthCheck: &compute.HealthCheckTcpHealthCheckArgs{
			Port: pulumi.Int(443),
		},
	})
	if err != nil {
		return err
	}

	instanceTemplates := make(map[string]*compute.InstanceTemplate)
	instanceGroupManagers := make(map[string]*compute.RegionInstanceGroupManager)
	backends := compute.BackendServiceBackendArray{}
	for region, settings := range regions {
		tpl, err := compute.NewInstanceTemplate(ctx, commonName+"-"+region, &compute.InstanceTemplateArgs{
			Disks: compute.InstanceTemplateDiskArray{
				compute.InstanceTemplateDiskArgs{
					Boot:        pulumi.Bool(true),
					DiskSizeGb:  pulumi.Int(10),
					SourceImage: pulumi.String("debian-cloud/debian-10"),
				},
			},
			Labels:      labelsInput,
			MachineType: pulumi.String(settings.VmType),
			Metadata: pulumi.Map{
				"startup-script-url": pulumi.String(gcsReleasesUrl + "/" + version + "/" + "flareproxy-gce-startup.sh"),
				"cache-addr":         pulumi.String(cacheAddr),
			},
			NetworkInterfaces: compute.InstanceTemplateNetworkInterfaceArray{
				compute.InstanceTemplateNetworkInterfaceArgs{
					AccessConfigs: compute.InstanceTemplateNetworkInterfaceAccessConfigArray{
						compute.InstanceTemplateNetworkInterfaceAccessConfigArgs{
							NatIp:               nil,
							NetworkTier:         pulumi.String("PREMIUM"),
							PublicPtrDomainName: nil,
						},
					},
					Network:    pulumi.String(network),
					Subnetwork: pulumi.String(settings.Subnet),
				},
			},
			Region: pulumi.String(region),
			ServiceAccount: compute.InstanceTemplateServiceAccountArgs{
				Scopes: pulumi.StringArray{
					pulumi.String("logging-write"),
					pulumi.String("monitoring-write"),
					pulumi.String("storage-ro"),
				},
			},
			Tags: pulumi.StringArray{
				pulumi.String("https-server"),
			},
		}, pulumi.DeleteBeforeReplace(true))
		if err != nil {
			return err
		}
		instanceTemplates[region] = tpl
		mgr, err := compute.NewRegionInstanceGroupManager(ctx, commonName+"-"+region, &compute.RegionInstanceGroupManagerArgs{
			AutoHealingPolicies: compute.RegionInstanceGroupManagerAutoHealingPoliciesArgs{
				HealthCheck:     healthCheck.ID(),
				InitialDelaySec: pulumi.Int(60),
			},
			BaseInstanceName: pulumi.String(commonName),
			NamedPorts: compute.RegionInstanceGroupManagerNamedPortArray{
				compute.RegionInstanceGroupManagerNamedPortArgs{
					Name: pulumi.String("https"),
					Port: pulumi.Int(443),
				},
			},
			Region:     pulumi.String(region),
			TargetSize: pulumi.Int(1),
			UpdatePolicy: compute.RegionInstanceGroupManagerUpdatePolicyArgs{
				MaxUnavailableFixed: pulumi.Int(3),
				MinReadySec:         pulumi.Int(300),
				MinimalAction:       pulumi.String("RESTART"),
				Type:                pulumi.String("PROACTIVE"),
			},
			Versions: compute.RegionInstanceGroupManagerVersionArray{compute.RegionInstanceGroupManagerVersionArgs{
				InstanceTemplate: tpl.SelfLink,
			}},
		},pulumi.DeleteBeforeReplace(true))
		if err != nil {
			return err
		}
		instanceGroupManagers[region] = mgr
		backends = append(backends, compute.BackendServiceBackendArgs{Group: mgr.InstanceGroup})
	}

	// load balancing
	backendService, err := compute.NewBackendService(ctx, commonName, &compute.BackendServiceArgs{
		Backends:     backends,
		HealthChecks: healthCheck.SelfLink,
		PortName:     pulumi.String("https"),
		Protocol:     pulumi.String("HTTP2"),
	})
	if err != nil {
		return err
	}
	urlMap, err := compute.NewURLMap(ctx, commonName, &compute.URLMapArgs{
		DefaultService: backendService.SelfLink,
	})
	if err != nil {
		return err
	}
	targetHttpsProxy, err := compute.NewTargetHttpsProxy(ctx, commonName, &compute.TargetHttpsProxyArgs{
		SslCertificates: pulumi.StringArray{sslCertificate.SelfLink},
		UrlMap:          urlMap.SelfLink,
	})
	if err != nil {
		return err
	}
	_, err = compute.NewGlobalForwardingRule(ctx, commonName, &compute.GlobalForwardingRuleArgs{
		IpAddress: globalIp.Address,
		Labels:    labelsInput,
		PortRange: pulumi.String("443"),
		Target:    targetHttpsProxy.SelfLink,
	})
	if err != nil {
		return err
	}

	return nil
}
