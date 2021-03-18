package main

import (
	datafactory "github.com/pulumi/pulumi-azure-native/sdk/go/azure/datafactory"
	resources "github.com/pulumi/pulumi-azure-native/sdk/go/azure/resources"
	"github.com/pulumi/pulumi/sdk/v2/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		resourceGroup, err := resources.NewResourceGroup(ctx, "factory-rg", nil)
		if err != nil {
			return err
		}

		dataFactorys, err := datafactory.NewFactory(ctx, "demoFactoryName2", &datafactory.FactoryArgs{
			Location:          resourceGroup.Location,
			ResourceGroupName: resourceGroup.Name,
		})
		if err != nil {
			return err
		}

		ctx.Export("DataFactorys", dataFactorys.Name)
		return nil
	})
}
