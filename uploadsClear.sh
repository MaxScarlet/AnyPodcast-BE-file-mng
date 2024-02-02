#!/bin/bash

BUCKET_NAME="upload.eu-w1.oxymoron-technique.com"

uploads=$(aws s3api list-multipart-uploads --region eu-west-1 --bucket $BUCKET_NAME)

echo $uploads | grep -o -E '"Key": "[^"]+"|"UploadId": "[^"]+"' | paste - - -d' ' | while read key uploadId; do
    key=$(echo "$key" | cut -d'"' -f4)
    uploadId=$(echo "$uploadId" | cut -d'"' -f4)
    echo "Key: $key, UploadId: $uploadId"
    # aws s3api abort-multipart-upload  --region eu-west-1 --bucket $BUCKET_NAME --key $key --upload-id $uploadId
done
