PROJECT_ID="gps-dataverse-dev-468813"
REGION="us-central1"
REGISTRY=gps-dataverse-dev-468813-artifacts
SERVICE=datacommons-website-compose
TAG=latest
LOCAL_IMAGE=$SERVICE:$TAG
REMOTE_IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/$REGISTRY/$SERVICE:$TAG


# Build Docker Image
docker build \
  -f build/web_compose/Dockerfile \
  -t $LOCAL_IMAGE .

# Authenticate Registry
gcloud auth configure-docker $REGION-docker.pkg.dev

# Tag Docker Image
docker tag $LOCAL_IMAGE $REMOTE_IMAGE

# Push docker Image to remote registry
docker push $REMOTE_IMAGE
