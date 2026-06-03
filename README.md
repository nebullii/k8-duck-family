# K8 Duck Family

A small Kubernetes learning project with a duck-family theme.

The goal is to learn containers, pods, multi-container pods, labels, namespaces,
and `kubectl` commands by building something small, visual, and easy to fork.

Fork it, play with it, break it, fix it, and make the duck family your own.

Start with the picture-book walkthrough:

```text
docs/visual-guide.md
```

## Duck Family Map

```text
Kind Pond
├── duck-daisy
│   ├── waddles
│   ├── puddles
│   └── nibbles
│
├── duck-mabel
│   ├── bubbles
│   ├── pebble
│   └── sunny
│
└── duck-ruby
    ├── sprout
    ├── pip
    └── quackie
```

Visual version:

```text
duck-daisy  🦆  ->  🐥 waddles   🐥 puddles   🐥 nibbles
duck-mabel  🦆  ->  🐥 bubbles   🐥 pebble    🐥 sunny
duck-ruby   🦆  ->  🐥 sprout    🐥 pip       🐥 quackie
```

## Simple Terms

**Container**

A container is a small isolated environment that runs one app or process.
In this project, the first container runs nginx and serves the Mother Duck page.

**Image**

An image is the packaged recipe for a container. A container is the running
version of an image.

**Pod**

A pod is the smallest thing Kubernetes runs. A pod can have one container or
multiple containers that belong together.

In this project, each mother pod will contain:

```text
1 mother container
3 named duckling containers
```

**Kubernetes**

Kubernetes, often shortened to k8s, manages containers for you. It starts them,
restarts them if they fail, connects them through networking, and lets you
describe the desired setup with YAML files.

**Cluster**

A cluster is the Kubernetes environment. It contains the control plane and the
worker nodes where pods run.

**Node**

A node is a machine inside the cluster. In our local setup, kind creates the
node as a Podman container.

**Namespace**

A namespace is a named space inside Kubernetes. It helps keep related resources
together. This project uses a namespace named `duck-family`.

Creating a namespace does not automatically add roles, users, or permissions.
It only creates the space. Permissions are handled separately with RBAC resources
like `Role`, `RoleBinding`, `ClusterRole`, and `ClusterRoleBinding`.

**RBAC**

RBAC means role-based access control. It controls who can do what inside
Kubernetes. For example, a role can allow someone to view pods but not delete
them.

This project uses RBAC so the mother duck pods can call the Kubernetes API.

**ServiceAccount**

A ServiceAccount is the identity a pod uses inside Kubernetes.

The project has one ServiceAccount for each mother duck:

```text
duck-daisy
duck-mabel
duck-ruby
```

**Role**

A Role is a permission list inside one namespace.

The project has a Role named `mother-duck-role` in the `duck-family` namespace.
It allows all actions on all resources inside that namespace.

This is namespace access, not full cluster access.

**RoleBinding**

A RoleBinding connects a Role to a ServiceAccount.

Created so far:

```text
duck-daisy-rolebinding
duck-mabel-rolebinding
duck-ruby-rolebinding
```

These connect all three mother duck ServiceAccounts to `mother-duck-role`.

**YAML**

YAML is the file format commonly used to describe Kubernetes resources. Instead
of manually clicking buttons, we write files that say what we want Kubernetes to
create.

**kubectl**

`kubectl` is the command-line tool used to talk to Kubernetes.

**ConfigMap**

A ConfigMap stores non-secret configuration in Kubernetes.

Use it for settings like messages, names, themes, and feature flags.

Do not use ConfigMaps for passwords, tokens, or API keys.

**Service**

A Service gives pods a stable network front door.

Pods can be deleted and recreated with new IP addresses. A Service keeps a
stable name and routes traffic to matching pods using labels.

**Labels**

Labels are key-value tags on Kubernetes objects.

Example:

```yaml
labels:
  app: duck-family
  role: mother
  duck: daisy
  family: daisy
```

**Selectors**

Selectors are how you find Kubernetes objects by label.

Example:

```bash
kubectl get pods -n duck-family -l duck=daisy
```

## Current Progress

We started with the container layer before Kubernetes.

Created so far:

- A local Podman nginx container named `mother`
- A custom Mother Duck web page served by nginx
- A local kind Kubernetes cluster running through Podman
- A Kubernetes namespace named `duck-family`
- Three mother duck ServiceAccounts: `duck-daisy`, `duck-mabel`, `duck-ruby`
- A namespace-scoped Role named `mother-duck-role`
- RoleBindings connecting all three mother ducks to `mother-duck-role`
- The first multi-container pod: `duck-daisy`
- The second multi-container pod: `duck-mabel`
- The third multi-container pod: `duck-ruby`
- Verified all three mother pods and their duckling containers
- A ConfigMap named `duck-family-message`
- A dashboard pod named `duck-dashboard`
- A dashboard Service named `duck-dashboard-service`

The running cluster currently appears in Podman as:

```text
duck-family-control-plane
```

That is expected. The cluster is runtime state, not a project file.

## Target Kubernetes Structure

The project will use one Kubernetes cluster with one namespace.

```text
Kubernetes Cluster
└── Namespace: duck-family
    ├── Pod: duck-daisy
    │   ├── Container: duck-daisy
    │   ├── Container: waddles
    │   ├── Container: puddles
    │   └── Container: nibbles
    │
    ├── Pod: duck-mabel
    │   ├── Container: duck-mabel
    │   ├── Container: bubbles
    │   ├── Container: pebble
    │   └── Container: sunny
    │
    └── Pod: duck-ruby
        ├── Container: duck-ruby
        ├── Container: sprout
        ├── Container: pip
        └── Container: quackie
```

## Learning Path

1. Run a single container with Podman.
2. Customize the container page.
3. Create a local Kubernetes cluster with kind and Podman.
4. Create one namespace for the duck project.
5. Write Kubernetes YAML for the namespace.
6. Create one multi-container pod.
7. Expand to three mother pods.
8. Practice inspecting pods, containers, logs, labels, and namespaces.
9. Bind the mother duck Role to the mother duck ServiceAccounts.
10. Add pods that use those ServiceAccounts to call the Kubernetes API.

## First Pod

The first real Kubernetes pods are `duck-daisy`, `duck-mabel`, and `duck-ruby`.

Files:

```text
k8s/pods/duck-daisy-pod.yaml
k8s/pods/duck-mabel-pod.yaml
k8s/pods/duck-ruby-pod.yaml
```

Structure:

```text
Pod: duck-daisy
├── Container: duck-daisy
├── Container: waddles
├── Container: puddles
└── Container: nibbles

Pod: duck-mabel
├── Container: duck-mabel
├── Container: bubbles
├── Container: pebble
└── Container: sunny

Pod: duck-ruby
├── Container: duck-ruby
├── Container: sprout
├── Container: pip
└── Container: quackie
```

The mother containers use their matching ServiceAccounts and run:

```bash
kubectl get pods -n duck-family
```

That proves the pod can call the Kubernetes API using RBAC.

## Current Running Demo

The demo now has:

```text
3 pods
12 containers
3 ServiceAccounts
1 Role
3 RoleBindings
```

Each mother pod has one mother container and three duckling containers.

The mother containers call the Kubernetes API with:

```bash
kubectl get pods -n duck-family
```

## ConfigMap

The project has one ConfigMap:

```text
k8s/configmaps/duck-family-message.yaml
```

It stores:

```text
family-message
pond-name
learning-goal
```

This is non-secret project configuration that pods can read later.

The mother containers read these ConfigMap keys as environment variables:

```text
family-message -> FAMILY_MESSAGE
pond-name -> POND_NAME
```

## Dashboard Page

The project includes a simple static web page that shows all three duck
families:

```text
app/index.html
app/styles.css
```

This page will be packaged into a container image and served from Kubernetes by
a dashboard pod.

The dashboard also includes a picture-book style guide that explains the path
from browser to port-forward to Service to pod to container to nginx.

The image recipe is:

```text
app/Containerfile
```

It uses nginx and copies `app/index.html` into nginx's web directory.

Local image name:

```text
localhost/duck-dashboard:latest
```

For kind with Podman, the image can be loaded with:

```bash
podman save localhost/duck-dashboard:latest -o /tmp/duck-dashboard.tar
KIND_EXPERIMENTAL_PROVIDER=podman kind load image-archive /tmp/duck-dashboard.tar --name duck-family
```

Dashboard pod:

```text
k8s/pods/duck-dashboard-pod.yaml
```

Dashboard Service:

```text
k8s/services/duck-dashboard-service.yaml
```

The Service selects the dashboard pod with:

```text
app=duck-dashboard
```

In duck-project terms:

```text
Service = front gate
Pod = duck house
Container = duck inside the house
nginx = duck showing the web page
```

## Useful Commands

Check Podman containers:

```bash
podman ps -a
```

Check kind clusters:

```bash
kind get clusters
```

Check Kubernetes nodes:

```bash
kubectl get nodes
```

Check namespaces:

```bash
kubectl get namespaces
kubectl get configmap -n duck-family
kubectl describe configmap duck-family-message -n duck-family
```

Later, after pods are created:

```bash
kubectl get pods -n duck-family
kubectl get pods -n duck-family -l app=duck-family
kubectl get pods -n duck-family -l role=mother
kubectl get pods -n duck-family -l duck=daisy
kubectl describe pod duck-daisy -n duck-family
kubectl logs duck-daisy -c duck-daisy -n duck-family
kubectl logs duck-daisy -c waddles -n duck-family
kubectl logs duck-daisy -c puddles -n duck-family
kubectl logs duck-daisy -c nibbles -n duck-family
kubectl logs duck-mabel -c duck-mabel -n duck-family
kubectl logs duck-ruby -c duck-ruby -n duck-family
```
