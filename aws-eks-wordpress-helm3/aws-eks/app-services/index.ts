import * as aws from "@pulumi/aws";
import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
import { config } from "./config";

const projectName = pulumi.getProject();

const privateSubnetIds = config.privateSubnetIds;
const securityGroupIds = config.securityGroupIds;
const clusterName = config.clusterName;

// Create a k8s Provider.
const provider = new k8s.Provider("provider", {
    kubeconfig: config.kubeconfig,
    namespace: config.appsNamespaceName,
});

const k8sDashboardChart = new k8s.helm.v2.Chart("kubernetes-dashboard", {
    namespace: config.appSvcsNamespaceName,
    fetchOpts: {repo: "https://kubernetes.github.io/dashboard/"},
    chart: "kubernetes-dashboard",
    version: "3.0.0",
    transformations: [
        (obj: any) => {
            // Do transformations on the YAML to set the namespace
            if (obj.metadata) {
                obj.metadata.namespace = config.appSvcsNamespaceName;
            }
        },
    ],
    values: {fullnameOverride: 'kubernetes-dashboard',
    image: {tag: "v2.0.3"}}
}, { provider: provider });

// // Create the DB secret for MariaDB, the backing storage for WordPress.
// const mariadbSecret = new k8s.core.v1.Secret("mariadb", {
//     stringData: {
//         "mariadb-root-password": new random.RandomPassword("mariadb-root-pw", {
//             length: 12}).result,
//         "mariadb-password": new random.RandomPassword("mariadb-pw", {
//             length: 12}).result
//     }
// }, { provider: provider });
//
// // Create the DB Secret for the WordPress admin.
// const wordpressSecret = new k8s.core.v1.Secret("wordpress", {
//     stringData: {
//         "wordpress-password": new random.RandomPassword("wordpress-pw", {
//             length: 12}).result,
//     }
// }, { provider: provider });
//
// // Create a ConfigMap of the MariaDB settings.
// const mariadbCM = new k8s.core.v1.ConfigMap("mariadb", {
//     data: {
//         "my.cnf": `
// [mysqld]
// skip-name-resolve
// explicit_defaults_for_timestamp
// basedir=/opt/bitnami/mariadb
// port=3306
// socket=/opt/bitnami/mariadb/tmp/mysql.sock
// tmpdir=/opt/bitnami/mariadb/tmp
// max_allowed_packet=16M
// bind-address=0.0.0.0
// pid-file=/opt/bitnami/mariadb/tmp/mysqld.pid
// log-error=/opt/bitnami/mariadb/logs/mysqld.log
// character-set-server=UTF8
// collation-server=utf8_general_ci
//
// [client]
// port=3306
// socket=/opt/bitnami/mariadb/tmp/mysql.sock
// default-character-set=UTF8
//
// [manager]
// port=3306
// socket=/opt/bitnami/mariadb/tmp/mysql.sock
// pid-file=/opt/bitnami/mariadb/tmp/mysqld.pid
// `
//     }
// }, { provider: provider });
//
// // Create a PersistentVolumeClaim for WordPress on the MariaDB volume.
// const wordpressPVC = new k8s.core.v1.PersistentVolumeClaim("wordpress", {
//     spec: {
//         accessModes: ["ReadWriteOnce"],
//         resources: {
//             requests: {
//                 storage: "1Gi"
//             }
//         }
//     }
// }, { provider: provider });
//
// // Create a Service for MariaDB.
// const mariadbSvc = new k8s.core.v1.Service("mariadb", {
//     metadata: {
//         name: "mariadb",
//     },
//     spec: {
//         type: "ClusterIP",
//         ports: [
//             {
//                 name: "mysql",
//                 port: 3306,
//                 targetPort: "mysql"
//             }
//         ],
//         selector: {
//             app: "mariadb",
//             component: "master",
//             release: "example"
//         }
//     }
// }, { provider: provider });
//
// // Create a Service for Wordpress.
// const wordpressSvc = new k8s.core.v1.Service("wordpress", {
//     spec: {
//         type: "LoadBalancer",
//         externalTrafficPolicy: "Cluster",
//         ports: [
//             {
//                 name: "http",
//                 port: 80,
//                 targetPort: "http"
//             },
//             {
//                 name: "https",
//                 port: 443,
//                 targetPort: "https"
//             }
//         ],
//         selector: {
//             app: "wordpress"
//         }
//     }
// }, { provider: provider });
//
// const wpLabels = { app: "wordpress", release: "example" };
// const wordpress = new k8s.apps.v1.Deployment("wordpress", {
//     spec: {
//         selector: {
//             matchLabels: wpLabels
//         },
//         strategy: {
//             type: "RollingUpdate"
//         },
//         replicas: 1,
//         template: {
//             metadata: { labels: wpLabels },
//             spec: {
//                 hostAliases: [
//                     {
//                         ip: "127.0.0.1",
//                         hostnames: [
//                             "status.localhost"
//                         ]
//                     }
//                 ],
//                 containers: [
//                     {
//                         name: "wordpress",
//                         image: "docker.io/bitnami/wordpress:5.2.4-debian-9-r0",
//                         imagePullPolicy: "IfNotPresent",
//                         env: [
//                             { name: "ALLOW_EMPTY_PASSWORD", value: "yes" },
//                             { name: "MARIADB_HOST", value: "mariadb" },
//                             { name: "MARIADB_PORT_NUMBER", value: "3306" },
//                             { name: "WORDPRESS_DATABASE_NAME", value: "bitnami_wordpress" },
//                             { name: "WORDPRESS_DATABASE_USER", value: "bn_wordpress" },
//                             {
//                                 name: "WORDPRESS_DATABASE_PASSWORD",
//                                 valueFrom: {
//                                     secretKeyRef: {
//                                         name: mariadbSecret.metadata.name,
//                                         key: "mariadb-password"
//                                     }
//                                 }
//                             },
//                             { name: "WORDPRESS_USERNAME", value: "user" },
//                             {
//                                 name: "WORDPRESS_PASSWORD",
//                                 valueFrom: {
//                                     secretKeyRef: {
//                                         name: wordpressSecret.metadata.name,
//                                         key: "wordpress-password"
//                                     }
//                                 }
//                             },
//                             { name: "WORDPRESS_EMAIL", value: "user@example.com" },
//                             { name: "WORDPRESS_FIRST_NAME", value: "FirstName" },
//                             { name: "WORDPRESS_LAST_NAME", value: "LastName" },
//                             { name: "WORDPRESS_HTACCESS_OVERRIDE_NONE", value: "no" },
//                             { name: "WORDPRESS_BLOG_NAME", value: "User's Blog!" },
//                             { name: "WORDPRESS_SKIP_INSTALL", value: "no" },
//                             { name: "WORDPRESS_TABLE_PREFIX", value: "wp_" },
//                             { name: "WORDPRESS_SCHEME", value: "http" },
//                         ],
//                         ports: [
//                             { name: "http", containerPort: 80 },
//                             { name: "https", containerPort: 443 }
//                         ],
//                         livenessProbe: {
//                             httpGet: { path: "/wp-login.php", port: "http" },
//                             failureThreshold: 6,
//                             initialDelaySeconds: 120,
//                             periodSeconds: 10,
//                             successThreshold: 1,
//                             timeoutSeconds: 5
//                         },
//                         readinessProbe: {
//                             httpGet: { path: "/wp-login.php", port: "http" },
//                             failureThreshold: 6,
//                             initialDelaySeconds: 30,
//                             periodSeconds: 10,
//                             successThreshold: 1,
//                             timeoutSeconds: 5
//                         },
//                         volumeMounts: [
//                             {
//                                 mountPath: "/bitnami/wordpress",
//                                 name: "wordpress-data",
//                                 subPath: "wordpress"
//                             }
//                         ],
//                         resources: {
//                             requests: {
//                                 cpu: "300m",
//                                 memory: "512Mi"
//                             }
//                         }
//                     }
//                 ],
//                 volumes: [
//                     {
//                         name: "wordpress-data",
//                         persistentVolumeClaim: {
//                             claimName: wordpressPVC.metadata.name
//                         }
//                     }
//                 ]
//             }
//         }
//     }
// }, { provider: provider });
//
// // Create a StatefulSet of MariaDB to run locally on the cluster.
// const mariadb = new k8s.apps.v1.StatefulSet("mariadb", {
//     spec: {
//         selector: {
//             matchLabels: {
//                 app: "mariadb",
//                 release: "example",
//                 component: "master"
//             }
//         },
//         serviceName: "mariadb",
//         replicas: 1,
//         updateStrategy: {
//             type: "RollingUpdate"
//         },
//         template: {
//             metadata: {
//                 labels: {
//                     app: "mariadb",
//                     release: "example",
//                     component: "master"
//                 }
//             },
//             spec: {
//                 serviceAccountName: "default",
//                 securityContext: {
//                     fsGroup: 1001,
//                     runAsUser: 1001
//                 },
//                 affinity: {
//                     podAntiAffinity: {
//                         preferredDuringSchedulingIgnoredDuringExecution: [
//                             {
//                                 weight: 1,
//                                 podAffinityTerm: {
//                                     topologyKey: "kubernetes.io/hostname",
//                                     labelSelector: {
//                                         matchLabels: {
//                                             app: "mariadb",
//                                             release: "example"
//                                         }
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 containers: [
//                     {
//                         name: "mariadb",
//                         image: "docker.io/bitnami/mariadb:10.3.18-debian-9-r36",
//                         imagePullPolicy: "IfNotPresent",
//                         env: [
//                             {
//                                 name: "MARIADB_ROOT_PASSWORD",
//                                 valueFrom: {
//                                     secretKeyRef: {
//                                         name: mariadbSecret.metadata.name,
//                                         key: "mariadb-root-password"
//                                     }
//                                 }
//                             },
//                             { name: "MARIADB_USER", value: "bn_wordpress" },
//                             {
//                                 name: "MARIADB_PASSWORD",
//                                 valueFrom: {
//                                     secretKeyRef: {
//                                         name: mariadbSecret.metadata.name,
//                                         key: "mariadb-password"
//                                     }
//                                 }
//                             },
//                             { name: "MARIADB_DATABASE", value: "bitnami_wordpress" }
//                         ],
//                         ports: [
//                             { name: "mysql", containerPort: 3306 }
//                         ],
//                         livenessProbe: {
//                             exec: {
//                                 command: ["sh", "-c", "exec mysqladmin status -uroot -p$MARIADB_ROOT_PASSWORD"],
//                             },
//                             initialDelaySeconds: 120,
//                             periodSeconds: 10,
//                             timeoutSeconds: 1,
//                             successThreshold: 1,
//                             failureThreshold: 3
//                         },
//                         readinessProbe: {
//                             exec: {
//                                 command: ["sh", "-c", "exec mysqladmin status -uroot -p$MARIADB_ROOT_PASSWORD"]
//                             },
//                             initialDelaySeconds: 30,
//                             periodSeconds: 10,
//                             timeoutSeconds: 1,
//                             successThreshold: 1,
//                             failureThreshold: 3
//                         },
//                         volumeMounts: [
//                             {
//                                 name: "data",
//                                 mountPath: "/bitnami/mariadb"
//                             },
//                             {
//                                 name: "config",
//                                 mountPath: "/opt/bitnami/mariadb/conf/my.cnf",
//                                 subPath: "my.cnf"
//                             }
//                         ]
//                     }
//                 ],
//                 volumes: [
//                     {
//                         name: "config",
//                         configMap: {
//                             name: mariadbCM.metadata.name
//                         }
//                     }
//                 ]
//             },
//         },
//         volumeClaimTemplates: [
//             {
//                 metadata: {
//                     name: "data",
//                     labels: {
//                         app: "mariadb",
//                         component: "master",
//                         release: "example",
//                     }
//                 },
//                 spec: {
//                     accessModes: [
//                         "ReadWriteOnce"
//                     ],
//                     resources: {
//                         requests: {
//                             storage: "8Gi"
//                         }
//                     }
//                 }
//             }
//         ]
//     }
// }, { provider: provider });
//
//
// // Export the Service name and public LoadBalancer Endpoint
// export const serviceName = wordpressSvc.metadata.apply(m => m.name);
// export const serviceHostname = wordpressSvc.status.apply(s => s.loadBalancer.ingress[0].hostname);