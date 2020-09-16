import pulumi
import pulumi_kubernetes as kubernetes

go_demo_5_namespace = kubernetes.core.v1.Namespace("go_demo_5Namespace",
    api_version="v1",
    kind="Namespace",
    metadata={
        "name": "go-demo-5",
    })
#go_demo_5_api_ingress = kubernetes.extensions.v1beta1.Ingress("go_demo_5ApiIngress",
#go_demo_5_api_ingress = kubernetes.networking.v1.Ingress("go_demo_5ApiIngress",
go_demo_5_api_ingress = kubernetes.networking.v1beta1.Ingress("go_demo_5ApiIngress",
    #api_version="extensions/v1beta1",
    #api_version="networking.k8s.io/v1beta1",
    #api_version="networking.k8s.io/v1",
    api_version="networking.k8s.io/v1",
    kind="Ingress",
    metadata={
        "name": "api",
        "namespace": "go-demo-5",
        "annotations": {
            "kubernetes.io/ingress.class": "nginx",
            "ingress.kubernetes.io/ssl-redirect": "false",
            "nginx.ingress.kubernetes.io/ssl-redirect": "false",
        },
    },
    spec={
        "rules": [{
            "http": {
                "paths": [{
                    "path": "/demo",
                    "backend": {
                        "service_name": "api",
                        "service_port": 8080,
                    },
                }],
            },
        }],
    })

go_demo_5_db_service_account = kubernetes.core.v1.ServiceAccount("go_demo_5DbServiceAccount",
    api_version="v1",
    kind="ServiceAccount",
    metadata={
        "name": "db",
        "namespace": "go-demo-5",
    })
go_demo_5_db_role = kubernetes.rbac.v1.Role("go_demo_5DbRole",
    kind="Role",
    api_version="rbac.authorization.k8s.io/v1",
    metadata={
        "name": "db",
        "namespace": "go-demo-5",
    },
    rules=[{
        "api_groups": [""],
        "resources": ["pods"],
        "verbs": ["list"],
    }])
go_demo_5_db_role_binding = kubernetes.rbac.v1.RoleBinding("go_demo_5DbRoleBinding",
    api_version="rbac.authorization.k8s.io/v1",
    kind="RoleBinding",
    metadata={
        "name": "db",
        "namespace": "go-demo-5",
    },
    role_ref={
        "api_group": "rbac.authorization.k8s.io",
        "kind": "Role",
        "name": "db",
    },
    subjects=[{
        "kind": "ServiceAccount",
        "name": "db",
    }])
go_demo_5_db_stateful_set = kubernetes.apps.v1.StatefulSet("go_demo_5DbStatefulSet",
    api_version="apps/v1",
    kind="StatefulSet",
    metadata={
        "name": "db",
        "namespace": "go-demo-5",
    },
    spec={
        "service_name": "db",
        "selector": {
            "match_labels": {
                "app": "db",
            },
        },
        "template": {
            "metadata": {
                "labels": {
                    "app": "db",
                },
            },
            "spec": {
                "service_account_name": "db",
                "termination_grace_period_seconds": 10,
                "containers": [
                    {
                        "name": "db",
                        "image": "mongo:3.3",
                        "command": [
                            "mongod",
                            "--replSet",
                            "rs0",
                            "--smallfiles",
                            "--noprealloc",
                        ],
                        "ports": [{
                            "container_port": 27017,
                        }],
                        "resources": {
                            "limits": {
                                "memory": "150Mi",
                                "cpu": "0.2",
                            },
                            "requests": {
                                "memory": "100Mi",
                                "cpu": "0.1",
                            },
                        },
                        "volume_mounts": [{
                            "name": "mongo-data",
                            "mount_path": "/data/db",
                        }],
                    },
                    {
                        "name": "db-sidecar",
                        "image": "cvallance/mongo-k8s-sidecar",
                        "env": [
                            {
                                "name": "MONGO_SIDECAR_POD_LABELS",
                                "value": "app=db",
                            },
                            {
                                "name": "KUBE_NAMESPACE",
                                "value": "go-demo-5",
                            },
                            {
                                "name": "KUBERNETES_MONGO_SERVICE_NAME",
                                "value": "db",
                            },
                        ],
                        "resources": {
                            "limits": {
                                "memory": "100Mi",
                                "cpu": "0.2",
                            },
                            "requests": {
                                "memory": "50Mi",
                                "cpu": "0.1",
                            },
                        },
                    },
                ],
            },
        },
        "volume_claim_templates": [{
            "metadata": {
                "name": "mongo-data",
            },
            "spec": {
                "access_modes": ["ReadWriteOnce"],
                "resources": {
                    "requests": {
                        "storage": "2Gi",
                    },
                },
            },
        }],
    })
go_demo_5_db_service = kubernetes.core.v1.Service("go_demo_5DbService",
    api_version="v1",
    kind="Service",
    metadata={
        "name": "db",
        "namespace": "go-demo-5",
    },
    spec={
        "ports": [{
            "port": 27017,
        }],
        "cluster_ip": "None",
        "selector": {
            "app": "db",
        },
    })
go_demo_5_api_deployment = kubernetes.apps.v1.Deployment("go_demo_5ApiDeployment",
    api_version="apps/v1",
    kind="Deployment",
    metadata={
        "name": "api",
        "namespace": "go-demo-5",
    },
    spec={
        "selector": {
            "match_labels": {
                "app": "api",
            },
        },
        "template": {
            "metadata": {
                "labels": {
                    "app": "api",
                },
            },
            "spec": {
                "containers": [{
                    "name": "api",
                    "image": "vfarcic/go-demo-5",
                    "env": [{
                        "name": "DB",
                        "value": "db",
                    }],
                    "readiness_probe": {
                        "http_get": {
                            "path": "/demo/hello",
                            "port": 8080,
                        },
                        "period_seconds": 1,
                    },
                    "liveness_probe": {
                        "http_get": {
                            "path": "/demo/hello",
                            "port": 8080,
                        },
                    },
                    "resources": {
                        "limits": {
                            "memory": "15Mi",
                            "cpu": "0.1",
                        },
                        "requests": {
                            "memory": "10Mi",
                            "cpu": "0.01",
                        },
                    },
                }],
            },
        },
    })
go_demo_5_api_service = kubernetes.core.v1.Service("go_demo_5ApiService",
    api_version="v1",
    kind="Service",
    metadata={
        "name": "api",
        "namespace": "go-demo-5",
    },
    spec={
        "ports": [{
            "port": 8080,
        }],
        "selector": {
            "app": "api",
        },
    })

## New horizontal pod auto
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
                "target_average_utilization": 10,
            },
        },
        {
            "type": "Resource",
            "resource": {
                "name": "memory",
                "target_average_utilization": 10,
            },
        },
    ],
    })

go_demo_5_db_horizontal_pod_autoscaler = kubernetes.autoscaling.v1.HorizontalPodAutoscaler("go_demo_5DbHorizontalPodAutoscaler",
    api_version="autoscaling/v1",
    kind="HorizontalPodAutoscaler",
    metadata={
        "name": "db",
        "namespace": "go-demo-5",
    },
    spec={
        "scale_target_ref": {
            "api_version": "apps/v1",
            "kind": "StatefulSet",
            "name": "db",
        },
        "min_replicas": 3,
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