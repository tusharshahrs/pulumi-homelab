using Pulumi;
using AzureNextGen = Pulumi.AzureNextGen;
using Pulumi.AzureNextGen.StreamAnalytics.V20170401Preview.Inputs;
using System; 
using System.Reflection;

class MyStack : Stack
{   
    public static class UnionConverter
    {
        public static dynamic ConvertToInputUnion(PropertyInfo property, object value) =>
            ConvertToInputUnionImpl(property.PropertyType, value);

        private static dynamic ConvertToInputUnionImpl(Type type, object value)
        {
            var genericType = type.GetGenericTypeDefinition();
            if (genericType != typeof(InputUnion<,>))
                throw new Exception("Expected an InputUnion<T0, T1> type");
            var leftType = type.GetGenericArguments()[0];
            if (value.GetType() == leftType)
            {
                var leftConverter = type.GetMethod("op_Implicit", new[] { leftType });
                return leftConverter.Invoke(null, new[] { value });
            }
            
            var rightType = type.GetGenericArguments()[1];
            var converter = type.GetMethod("op_Implicit", new[] { rightType });
            if (value.GetType() == rightType)
            {
                return converter.Invoke(null, new[] { value });
            }

            var recursiveResult = ConvertToInputUnionImpl(rightType, value);
            return converter.Invoke(null, new[] { recursiveResult });
        }
    }
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

        var function = new AzureNextGen.StreamAnalytics.V20170401Preview.Function("function", new AzureNextGen.StreamAnalytics.V20170401Preview.FunctionArgs
        {
            FunctionName = "function8197",
            JobName = streamingJob.Name, //"sj8653",
            Properties = new AzureNextGen.StreamAnalytics.V20170401Preview.Inputs.ScalarFunctionPropertiesArgs
            {
                Binding = UnionConverter.ConvertToInputUnion(
                    typeof(ScalarFunctionPropertiesArgs).GetProperty(nameof(ScalarFunctionPropertiesArgs.Binding)),
                    new JavaScriptFunctionBindingArgs
                    {
                    Script = "function (x, y) { return x + y; }",
                    Type = "Microsoft.StreamAnalytics/JavascriptUdf",
                    }),
                Inputs = 
                {
                    new AzureNextGen.StreamAnalytics.V20170401Preview.Inputs.FunctionInputArgs
                    {
                        DataType = "Any",
                    },
                },
                Output = new AzureNextGen.StreamAnalytics.V20170401Preview.Inputs.FunctionOutputArgs
                {
                    DataType = "Any",
                },
                Type = "Scalar",
            },
            ResourceGroupName = resourceGroup.Name // resource "sjrg1637",
        });
    }

}