using Pulumi;
using AzureNextGen = Pulumi.AzureNextGen;

class MyStack : Stack
{
    public MyStack()
    {
        var resourceGroup = new AzureNextGen.Resources.Latest.ResourceGroup("resourceGroup", new AzureNextGen.Resources.Latest.ResourceGroupArgs
        {
            Location = "eastus2",
            ResourceGroupName = "sjrg1637",
        });

        var streamingJob = new AzureNextGen.StreamAnalytics.Latest.StreamingJob("streamingJob", new AzureNextGen.StreamAnalytics.Latest.StreamingJobArgs
        {
            CompatibilityLevel = "1.0",
            DataLocale = "en-US",
            EventsLateArrivalMaxDelayInSeconds = 16,
            EventsOutOfOrderMaxDelayInSeconds = 5,
            EventsOutOfOrderPolicy = "Drop",
            Functions = {},
            Inputs = {},
            JobName = "sj8653",
            Location = "West US",
            OutputErrorPolicy = "Drop",
            Outputs = {},
            ResourceGroupName = resourceGroup.Name,//"sjrg6936",
            Sku = new AzureNextGen.StreamAnalytics.Latest.Inputs.SkuArgs
            {
                Name = "Standard",
            },
            Tags = 
            {
                { "key1", "value1" },
                { "key3", "value3" },
                { "randomKey", "randomValue" },
            },
        });

        var function = new AzureNextGen.StreamAnalytics.Latest.Function("function", new AzureNextGen.StreamAnalytics.Latest.FunctionArgs
        {
            FunctionName = "function8197",
            JobName = streamingJob.Name, //"sj8653",
            Properties = new AzureNextGen.StreamAnalytics.Latest.Inputs.ScalarFunctionPropertiesArgs
            {
                Binding = new AzureNextGen.StreamAnalytics.Latest.Inputs.JavaScriptFunctionBindingArgs
                {
                 Script = "function (x, y) { return x + y; }",
                 Type = "Microsoft.StreamAnalytics/JavascriptUdf",
                },
                Inputs = 
                {
                    new AzureNextGen.StreamAnalytics.Latest.Inputs.FunctionInputArgs
                    {
                        DataType = "Any",
                    },
                },
                Output = new AzureNextGen.StreamAnalytics.Latest.Inputs.FunctionOutputArgs
                {
                    DataType = "Any",
                },
                Type = "Scalar",
            },
            ResourceGroupName = resourceGroup.Name // resource "sjrg1637",
        });
    }

}