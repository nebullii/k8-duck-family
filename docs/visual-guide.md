# Visual Guide

This project is a tiny duck pond for learning Kubernetes.

## Picture 1: The Pond

```text
Kubernetes Cluster
└── Namespace: duck-family
    ├── duck-daisy pod
    ├── duck-mabel pod
    ├── duck-ruby pod
    └── duck-dashboard pod
```

Simple idea:

```text
cluster = whole pond
namespace = fenced area of the pond
pod = duck house
container = duck inside the house
```

## Picture 2: Mother Duck Pods

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

Simple idea:

```text
one pod can hold one container or many containers
containers inside the same pod live together
```

## Picture 3: How The Web Page Opens

```text
Browser
  |
  v
port-forward
  |
  v
Service: duck-dashboard-service
  |
  v
Pod: duck-dashboard
  |
  v
Container: duck-dashboard
  |
  v
nginx serves index.html
```

Simple idea:

```text
Service = stable front gate
Pod = duck house
Container = duck doing the work
nginx = app server showing the page
```

## Picture 4: How RBAC Works

```text
ServiceAccount
  identity for a pod

Role
  permission list

RoleBinding
  connects the identity to the permission list
```

For this project:

```text
duck-daisy ServiceAccount -> mother-duck-role
duck-mabel ServiceAccount -> mother-duck-role
duck-ruby ServiceAccount -> mother-duck-role
```

Simple idea:

```text
ServiceAccount = name tag
Role = rule book
RoleBinding = permission slip
```

## Picture 5: How ConfigMap Works

```text
ConfigMap: duck-family-message
├── pond-name
├── family-message
└── learning-goal
```

The mother containers read the ConfigMap as environment variables:

```text
POND_NAME
FAMILY_MESSAGE
```

Simple idea:

```text
ConfigMap = message board for non-secret settings
```

## Picture 6: Word Bank

```text
container = one isolated app process
image = recipe used to create a container
pod = smallest thing Kubernetes runs
service = stable network front gate
label = tag on a Kubernetes object
selector = finds objects by tag
configmap = non-secret settings
rbac = permissions
kubectl = command tool for Kubernetes
```
