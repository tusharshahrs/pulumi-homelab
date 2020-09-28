import pulumi
import pulumi_kubernetes as kubernetes

go_demo_5_api_horizontal_pod_autoscaler = kubernetes.autoscaling.v1.HorizontalPodAutoscaler("go_demo_5ApiHorizontalPodAutoscaler",
    api_version="autoscaling/v1",
    kind="HorizontalPodAutoscaler",
    metadata={
        "name": "api",
        "namespace": "go-demo-5",
    },
    spec={
        "scale_target_ref": {
            "api_version": "apps/v1",
            "kind": "Deployment",
            "name": "api",
        },
        "min_replicas": 2,
        "max_replicas": 5,
        "metrics": [
            {
                "type": "Resource",
                "resource": {
                    "name": "cpu",
                    "target_average_utilization": 80,
                },
            },
            {
                "type": "Resource",
                "resource": {
                    "name": "memory",
                    "target_average_utilization": 80,
                },
            },
        ],
    })
