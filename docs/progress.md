# Progress Log

## 1. Podman Container

We created a container named `mother` from the official nginx image.

Concept learned:

```text
container = one isolated running app/process
```

The container serves a page from:

```text
/usr/share/nginx/html/index.html
```

The page was changed to show a Mother Duck themed page.

## 2. Port Mapping

The `mother` container exposes nginx port `80` through local port `8080`.

```text
localhost:8080 -> container port 80
```

Concept learned:

```text
host port = port on your Mac
container port = port inside the container
```

## 3. Local Kubernetes Cluster

We created a local kind cluster using Podman.

The visible Podman container is:

```text
duck-family-control-plane
```

That container is the Kubernetes control-plane node for the local cluster.

Concept learned:

```text
kind cluster = Kubernetes cluster running inside container nodes
```

## 4. What Belongs In Git

The running cluster does not create project files.

Git should store:

```text
source files
Containerfiles
Kubernetes YAML
docs
```

Git should not store:

```text
running containers
running pods
cluster runtime state
```

## 5. Next Step

We created the namespace:

```text
duck-family
```

This namespace is only a named space for the project. It does not create roles,
users, or permissions.

RBAC will be added later with resources such as:

```text
Role
RoleBinding
ClusterRole
ClusterRoleBinding
```

## 6. Mother Duck ServiceAccounts

Created one ServiceAccount for each mother duck:

```text
duck-daisy
duck-mabel
duck-ruby
```

A ServiceAccount is the identity a pod uses when it talks to the Kubernetes API.
It does not give permissions by itself.

Files:

```text
k8s/rbac/duck-daisy-serviceaccount.yaml
k8s/rbac/duck-mabel-serviceaccount.yaml
k8s/rbac/duck-ruby-serviceaccount.yaml
```

## 7. Mother Duck Role

Created a namespace-scoped Role:

```text
mother-duck-role
```

File:

```text
k8s/rbac/mother-duck-role.yaml
```

This Role allows all actions on all resources inside the `duck-family`
namespace.

It does not give cluster-wide access, and it does not grant access by itself.
The next RBAC step is RoleBinding.

## 8. Duck Daisy RoleBinding

Created:

```text
duck-daisy-rolebinding
```

File:

```text
k8s/rbac/duck-daisy-rolebinding.yaml
```

This RoleBinding connects:

```text
ServiceAccount: duck-daisy
Role: mother-duck-role
```

Now pods that use the `duck-daisy` ServiceAccount can use the permissions from
`mother-duck-role` inside the `duck-family` namespace.

## 9. Next Step

Created:

```text
duck-mabel-rolebinding
```

File:

```text
k8s/rbac/duck-mabel-rolebinding.yaml
```

This RoleBinding connects:

```text
ServiceAccount: duck-mabel
Role: mother-duck-role
```

## 10. Duck Ruby RoleBinding

Created:

```text
duck-ruby-rolebinding
```

File:

```text
k8s/rbac/duck-ruby-rolebinding.yaml
```

This RoleBinding connects:

```text
ServiceAccount: duck-ruby
Role: mother-duck-role
```

All three mother duck ServiceAccounts are now connected to
`mother-duck-role`.

## 11. Next Step

Created the first real multi-container pod:

```text
Pod: duck-daisy
├── Container: duck-daisy
├── Container: waddles
├── Container: puddles
└── Container: nibbles
```

File:

```text
k8s/pods/duck-daisy-pod.yaml
```

The pod uses:

```text
serviceAccountName: duck-daisy
```

The `duck-daisy` container runs `kubectl get pods -n duck-family`, which proves
it can call the Kubernetes API using the permissions from `mother-duck-role`.

The other three containers are ducklings that stay alive so learners can inspect
logs and practice multi-container pod commands.

## 12. Next Step

Created the second multi-container pod:

```text
Pod: duck-mabel
├── Container: duck-mabel
├── Container: bubbles
├── Container: pebble
└── Container: sunny
```

File:

```text
k8s/pods/duck-mabel-pod.yaml
```

The pod uses:

```text
serviceAccountName: duck-mabel
```

The `duck-mabel` container runs `kubectl get pods -n duck-family`, which proves
it can call the Kubernetes API using the permissions from `mother-duck-role`.

## 13. Next Step

Created the third multi-container pod:

```text
Pod: duck-ruby
├── Container: duck-ruby
├── Container: sprout
├── Container: pip
└── Container: quackie
```

File:

```text
k8s/pods/duck-ruby-pod.yaml
```

The pod uses:

```text
serviceAccountName: duck-ruby
```

The `duck-ruby` container runs `kubectl get pods -n duck-family`, which proves
it can call the Kubernetes API using the permissions from `mother-duck-role`.

## 14. Next Step

Verified all pods and containers:

```text
duck-daisy should show 4/4 Running
duck-mabel should show 4/4 Running
duck-ruby should show 4/4 Running
```

The full demo now has:

```text
3 pods
12 containers
3 ServiceAccounts
1 Role
3 RoleBindings
```

Each mother pod has a mother container that can call the Kubernetes API and
three duckling containers that stay alive for inspection.

## 15. Next Step

Practiced labels and selectors.

Labels are key-value tags on Kubernetes objects.

Selectors are queries that find Kubernetes objects by label.

Commands practiced:

```bash
kubectl get pods -n duck-family -l app=duck-family
kubectl get pods -n duck-family -l role=mother
kubectl get pods -n duck-family -l duck=daisy
```

## 16. Next Step

Added clearer family label to `duck-daisy`:

```text
family: daisy
```

This allows:

```bash
kubectl get pods -n duck-family -l family=daisy
```

## 17. Family Labels

Added clearer family labels:

```text
family: mabel
family: ruby
```

All mother pods now have a `family` label:

```text
duck-daisy -> family=daisy
duck-mabel -> family=mabel
duck-ruby -> family=ruby
```

Useful commands:

```bash
kubectl get pods -n duck-family -l family=daisy
kubectl get pods -n duck-family -l family=mabel
kubectl get pods -n duck-family -l family=ruby
```

## 18. Next Step

Created a ConfigMap:

```text
duck-family-message
```

File:

```text
k8s/configmaps/duck-family-message.yaml
```

A ConfigMap stores non-secret configuration in Kubernetes.

This ConfigMap contains:

```text
family-message
pond-name
learning-goal
```

Useful commands:

```bash
kubectl get configmap -n duck-family
kubectl describe configmap duck-family-message -n duck-family
```

## 19. Next Step

Added a visual duck family map to the README:

```text
duck-daisy -> waddles, puddles, nibbles
duck-mabel -> bubbles, pebble, sunny
duck-ruby -> sprout, pip, quackie
```

## 20. Next Step

Updated all mother containers so they read the ConfigMap as environment
variables:

```text
family-message -> FAMILY_MESSAGE
pond-name -> POND_NAME
```

The mother container logs now print the pond name and family message before
calling the Kubernetes API.

## 21. ConfigMap Read Verified

Recreated the mother pods so Kubernetes uses the updated pod specs.

Verified all mother pods are running:

```text
duck-daisy   4/4   Running
duck-mabel   4/4   Running
duck-ruby    4/4   Running
```

Verified the mother containers read the ConfigMap:

```text
Pond: Kind Pond
Message: Stay in line and follow the mother duck.
```

## 22. Next Step

Created the static dashboard page:

```text
app/index.html
```

The page shows:

```text
duck-daisy -> waddles, puddles, nibbles
duck-mabel -> bubbles, pebble, sunny
duck-ruby -> sprout, pip, quackie
```

## 23. Next Step

Created a `Containerfile` so the dashboard page can be packaged as a container
image.

File:

```text
app/Containerfile
```

It uses nginx and copies:

```text
app/index.html -> /usr/share/nginx/html/index.html
```

## 24. Next Step

Built the dashboard image with Podman.

Image:

```text
localhost/duck-dashboard:latest
```

## 25. Next Step

Loaded the dashboard image into the kind cluster.

Because kind was using Podman, the image was exported first:

```bash
podman save localhost/duck-dashboard:latest -o /tmp/duck-dashboard.tar
```

Then loaded into kind:

```bash
KIND_EXPERIMENTAL_PROVIDER=podman kind load image-archive /tmp/duck-dashboard.tar --name duck-family
```

## 26. Next Step

Created the `duck-dashboard` Kubernetes pod.

File:

```text
k8s/pods/duck-dashboard-pod.yaml
```

Verified:

```text
duck-dashboard   1/1   Running
```

## 27. Next Step

Created a Service for the dashboard pod.

File:

```text
k8s/services/duck-dashboard-service.yaml
```

Verified:

```text
duck-dashboard-service   ClusterIP   80/TCP   app=duck-dashboard
```

The Service points to the dashboard pod endpoint:

```text
10.244.0.11:80
```

In project terms:

```text
Service = front gate
Pod = duck house
Container = duck inside the house
nginx = duck showing the web page
```

## 28. Next Step

Added a picture-book style learner guide to the dashboard and docs.

Files:

```text
app/index.html
app/styles.css
docs/visual-guide.md
```

The guide explains:

```text
Browser -> port-forward -> Service -> Pod -> Container -> nginx -> index.html
```

## 29. Next Step

Rebuilt the dashboard image, reloaded it into kind, and recreated the dashboard
pod.

Verified:

```text
duck-dashboard   1/1   Running
```

Verified the Service serves the new guide content:

```text
How the pond works
duck-dashboard-service
```

## 30. Next Step

Open the dashboard in a browser with port-forward and continue improving the
learner guide.
