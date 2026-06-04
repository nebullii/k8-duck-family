#!/usr/bin/env bash
# Build the dashboard image, load it into the kind cluster, apply the RBAC,
# pod, and service, then restart the dashboard pod so it picks up the new image.
#
# Usage: ./scripts/deploy-dashboard.sh
set -euo pipefail

CLUSTER="duck-family"
NS="duck-family"
IMAGE="localhost/duck-dashboard:latest"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Building image $IMAGE"
podman build -t "$IMAGE" -f "$ROOT/app/Containerfile" "$ROOT/app"

echo "==> Loading image into kind cluster '$CLUSTER'"
podman save "$IMAGE" -o /tmp/duck-dashboard.tar
KIND_EXPERIMENTAL_PROVIDER=podman kind load image-archive /tmp/duck-dashboard.tar --name "$CLUSTER"
rm -f /tmp/duck-dashboard.tar

echo "==> Applying RBAC (read-only dashboard identity)"
kubectl apply -f "$ROOT/k8s/rbac/duck-dashboard-serviceaccount.yaml"
kubectl apply -f "$ROOT/k8s/rbac/dashboard-reader-role.yaml"
kubectl apply -f "$ROOT/k8s/rbac/duck-dashboard-rolebinding.yaml"

echo "==> Applying ConfigMap, Service"
kubectl apply -f "$ROOT/k8s/configmaps/duck-family-message.yaml"
kubectl apply -f "$ROOT/k8s/services/duck-dashboard-service.yaml"

echo "==> Recreating dashboard pod"
kubectl delete pod duck-dashboard -n "$NS" --ignore-not-found --wait=true
kubectl apply -f "$ROOT/k8s/pods/duck-dashboard-pod.yaml"
kubectl wait --for=condition=Ready pod/duck-dashboard -n "$NS" --timeout=90s

echo
echo "==> Done. View the pond:"
echo "    kubectl port-forward -n $NS svc/duck-dashboard-service 8080:80"
echo "    open http://localhost:8080"
