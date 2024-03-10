## Deploy
- _layer/function creation_ create empty lambda function/layer via AWS console
- _pre-defined command_ npm run pre_deploy
- _create/update lambda_ use release/*.zip to update layer and function accordingly via AWS console
- _swagger update_ update oas30_templ.json swagger, replacing the placeholders with real values
- _create/update API gateway_ aws apigateway create-rest-api --name "AnyPodcast-file-mng" --body file://swagger/oas30_templ.json --endpoint-configuration types=REGIONAL

## Env Variables
- *REGION* AWS region 
- *DB_NAME* MongoDB database name
- *MONGO_PASS* MongoDB database password
- *DB_TABLE* MongoDB collection name
- *ENV* Environment name (e.g. 'dev', 'stg', 'prod' etc.)
- *BUCKET* AWS S3 bucket name
- *BUCKET_PATH* Path to upload folder on AWS S3 bucket 

*Ensure Lambda permission for the bucket* (see swagger/lambda_policy.json)