# Kubernetes Deployment for Extracto

## Deploy Redis on k3s Master Node

### Prerequisites
- k3s cluster running
- kubectl configured to access your cluster

### Quick Deploy

Deploy all resources:
```bash
kubectl apply -f k8s/
```

Or deploy step by step:
```bash
# 1. Create namespace
kubectl apply -f k8s/redis-namespace.yaml

# 2. Create persistent volume claim
kubectl apply -f k8s/redis-pvc.yaml

# 3. Deploy Redis
kubectl apply -f k8s/redis-deployment.yaml

# 4. Create Redis service
kubectl apply -f k8s/redis-service.yaml
```

### Verify Deployment

Check if Redis is running:
```bash
kubectl get pods -n extracto
kubectl get svc -n extracto
```

Test Redis connection:
```bash
kubectl exec -it -n extracto deployment/redis -- redis-cli ping
# Should return: PONG
```

### Access Redis

From within the cluster:
- **Hostname**: `redis.extracto.svc.cluster.local`
- **Port**: `6379`
- **Short name**: `redis` (if accessing from same namespace)

From your application config:
```env
REDIS_HOST=redis.extracto.svc.cluster.local
REDIS_PORT=6379
```

### Monitor Redis

View logs:
```bash
kubectl logs -f -n extracto deployment/redis
```

Check resource usage:
```bash
kubectl top pod -n extracto
```

Execute Redis CLI:
```bash
kubectl exec -it -n extracto deployment/redis -- redis-cli
```

### Configuration

The Redis deployment includes:
- **Persistence**: AOF (Append-Only File) enabled
- **Max Memory**: 512MB with LRU eviction policy
- **Storage**: 5Gi persistent volume
- **Node**: Pinned to master node
- **Health Checks**: Liveness and readiness probes

### Update Redis Config

To change Redis configuration, edit `redis-deployment.yaml` and apply:
```bash
kubectl apply -f k8s/redis-deployment.yaml
kubectl rollout restart deployment/redis -n extracto
```

### Cleanup

Remove all resources:
```bash
kubectl delete namespace extracto
```

Or remove individually:
```bash
kubectl delete -f k8s/
```

**Note**: Deleting the namespace will also delete the PVC and all data.
