# Local Development

> WARNING! Has not been tested yet. May need to edit the `./run_server.sh` command to properly include `.env.list` variables

Install Docker or use Cloud Shell

## Local Setup

### Submodules

```bash
git submodule foreach git pull origin master
git submodule update --init --recursive
```

### Environment Variables

You'll need to create a `custom_dc/.env.list` file for sensitive environment variables (DO NOT COMMIT TO SCM).

`cp custom_dc/gps_dataverse_[dev|prod].env.list custom_dc/.env.list`

- Edit `.env.list` to add sensitive variables from [here](https://console.cloud.google.com/security/secret-manager?project=gps-dataverse)
  - `MAPS_API_KEY`
  - `DC_API_KEY` 

```bash
virtualenv .env
source .env/bin/activate
pip install -r server/requirements.txt
export PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
./run_server.sh -e gps_dataverse
```

## Building and Running an Image

```bash
export SERVICE=datacommons-website-compose
export TAG=latest
export LOCAL_IMAGE=$SERVICE:$TAG

docker build \
  -f build/web_compose/Dockerfile \
  -t $LOCAL_IMAGE .

docker run -it \
--env-file $PWD/custom_dc/.env.list \
-p 8080:8080 \
-e DEBUG=true \
-e GOOGLE_APPLICATION_CREDENTIALS=/gcp/creds.json \
-v $HOME/.config/gcloud/application_default_credentials.json:/gcp/creds.json:ro \
-v $PWD/server/templates/custom_dc:/workspace/server/templates/custom_dc \
$LOCAL_IMAGE
```

- Visit `localhost:8080`
- Some changes can be seen with a simple `docker restart $(docker ps --format '{{.ID}}')`; other changes require a full rebuild

## Deployment

### Tag and Push the Image

Build the image with the commands mentioned above. Then authenticate to push with Docker

```bash
export REGION=us-central1
gcloud auth configure-docker $REGION-docker.pkg.dev
```

- Tag the image

```bash
export PROJECT_ID=gps-dataverse-dev
export CUSTOM_DC_TAG=gps_dataverse
export REGION=us-central1

export REGISTRY=datacommons
export SERVICE=datacommons-website-compose
export TAG=latest
export LOCAL_IMAGE=$SERVICE:$TAG
export REMOTE_IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/$REGISTRY/$SERVICE:$CUSTOM_DC_TAG

docker tag $LOCAL_IMAGE $REMOTE_IMAGE
docker push $REMOTE_IMAGE
```

### Deploy the Built Image

In GCP IAM, grant the default service account "Cloud SQL Editor" permission. Then run:

```bash
# Then env file is "custom_dc/.env.list"
export RUN_SERVICE=datacommons
env_vars=$(awk -F '=' 'NF==2 {print $1"="$2}' custom_dc/.env.list | tr '\n' ',' | sed 's/,$//')

gcloud run deploy $RUN_SERVICE \
  --allow-unauthenticated \
  --region $REGION \
  --min-instances 1 \
  --cpu 2 \
  --memory 8G \
  --image $REMOTE_IMAGE \
  --set-env-vars="$env_vars" \
  --add-cloudsql-instances=$PROJECT_ID:$REGION:dc-graph \
  --max-instances 5 \
  --port 8080
```

## Appendix

### Set Up Google Artifact Registry (one time)

```bash
export PROJECT_ID=gps-dataverse
export REGION=us-central1
export REGISTRY=datacommons

gcloud artifacts repositories create $REGISTRY \
  --project=$PROJECT_ID \
  --repository-format=docker \
  --location=$REGION \
  --immutable-tags \
  --async
```

### DNS and Global Load Balancer

[Documentation](https://cloud.google.com/run/docs/integrate/custom-domain-load-balancer#command-line)

You must grant the Default Service Account the following IAM roles before proceeding:

- Cloud Run Developer
- Compute Instance Admin (beta)
- Compute Load Balancer Admin
- Logs Bucket Writer
- Service Account Token Creator
- Service Account User
- Storage Admin

```bash
export RUN_SERVICE=datacommons
export WEBSITE=gpsdataverse.com
export REGION=us-central1

gcloud beta run integrations create \
  --type=custom-domains \
  --parameters="set-mapping=$WEBSITE:$RUN_SERVICE" \
  --region $REGION
``

Check IP with
```bash
export REGION=us-central1

gcloud beta run integrations describe custom-domains \
  --region $REGION
```
