# Local Development

## Keeping fork up to date

- Don't edit any existing files. Only add new files.
- Follow [these steps](https://stackoverflow.com/questions/21353656/merge-git-repo-into-branch-of-another-repo) to merge the main repo into the your repo
- Run the Local Setup > Submodules commands any time you make changes to ensure you have the latest

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
# export CUSTOM_DC_TAG=gps_dataverse
# export CUSTOM_DC_TAG=latest
export REGION=us-central1

export REGISTRY=datacommons
export SERVICE=datacommons-website-compose
export TAG=latest
export LOCAL_IMAGE=$SERVICE:$TAG
export REMOTE_IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/$REGISTRY/$SERVICE:$TAG
# export REMOTE_IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/$REGISTRY/$SERVICE:$CUSTOM_DC_TAG

docker tag $LOCAL_IMAGE $REMOTE_IMAGE
docker push $REMOTE_IMAGE
```

### Deploy the Built Image

In GCP IAM, grant the default service account "Cloud SQL Editor" permission. Then run:

```bash
# Then env file is "custom_dc/.env.list"
# export NETWORK=dataverse-vpc
# export SUBNET=central

export RUN_SERVICE=datacommons
env_vars=$(awk -F '=' 'NF==2 {print $1"="$2}' custom_dc/.env.list | tr '\n' ',' | sed 's/,$//')

gcloud beta run deploy $RUN_SERVICE \
  --image $REMOTE_IMAGE \
  --allow-unauthenticated \
  --region $REGION \
  --cpu 2 \
  --memory 8G \
  --min-instances 1 \
  --max-instances 5 \
  --set-env-vars="$env_vars" \
  --port 8080 

  # --add-cloudsql-instances=$PROJECT_ID:$REGION:dc-graph \
  # --network $NETWORK \
  # --subnet $SUBNET \
```

## Appendix

### Set Up Google Artifact Registry (one time)

```bash
export PROJECT_ID=gps-dataverse-dev
export REGION=us-central1
export REGISTRY=datacommons

gcloud artifacts repositories create $REGISTRY \
  --project=$PROJECT_ID \
  --repository-format=docker \
  --location=$REGION \
  --async
```

### Private IP for Cloud SQL

Create a VPC with a subnet in the same region as the Cloud SQL instance. Then, create a private IP for the Cloud SQL instance.

Create a [VPC peering connection](https://cloud.google.com/sql/docs/mysql/connect-instance-cloud-run#expandable-2) between the VPC and the `google-managed-services-default` network.


Create a [VPC connector](https://cloud.google.com/run/docs/configuring/vpc-connectors) for Cloud Run to access the VPC

```bash
export NETWORK=dataverse-vpc
export REGION=us-central1
export VPC_CONNECTOR_NAME=serverless-vpc-access

gcloud compute networks vpc-access connectors create $VPC_CONNECTOR_NAME \
--network $NETWORK \
--region $REGION \
--range 10.8.0.0/24
```

### Connect Cloud Run to Cloud SQL (via public IP)

https://cloud.google.com/sql/docs/mysql/connect-instance-cloud-run#expandable-3

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
