### Scaling
https://github.com/vfarcic/k8s-specs/tree/master/scaling

## SideCar

[go-demo-5-no-sidecar-mem.yml](https://github.com/vfarcic/k8s-specs/tree/master/scaling)

We have two Pods that form an application. The api Deployment is a backend API that uses db StatefulSet for its state.

The essential parts of the definition are resources. Both the api and the db have requests and limits defined for memory and CPU. The database uses a sidecar container that will join MongoDB replicas into a replica set. Please note that, unlike other containers, the sidecar does not have resources. The importance behind that will be revealed later. For now, just remember that two containers have the requests and the limits defined and that one doesn’t.

The output should show that quite a few resources were created and our next action is to wait until the api Deployment is rolled out thus confirming that the application is up-and-running.

`kubectl -n go-demo-5 rollout status deployment api`

The output is as follows.

```
    NAME    READY STATUS  RESTARTS AGE
    api-... 1/1   Running 0        1m
    db-0    2/2   Running 0        1m
```

StateFulSet and DeploymentSet

https://share.getcloudapp.com/NQur0zQO


As you hopefully know, we should aim at having at least two replicas of each Pod, as long as they are scalable. Still, neither of the two had replicas defined. That is intentional. The fact that we can specify the number of replicas of a Deployment or a StatefulSet does not mean that we should. At least, not always.