@echo off
setlocal enabledelayedexpansion

rem Specify your S3 bucket name
set "BUCKET_NAME=upload.eu-w1.oxymoron-technique.com"

rem List multipart uploads and iterate through the results
for /f "tokens=2,4 delims=:{}," %%a in ('aws s3api list-multipart-uploads --region eu-west-1 --bucket !BUCKET_NAME! ^| findstr /C:"\"Key\": \"" /C:"\"UploadId\": \""') do (
    set "key=%%~a"
    set "uploadId=%%~b"

    rem Print the Key and UploadId for each iteration
    echo Key: !key!
    echo UploadId: !uploadId!
    echo ---------

    rem Abort the multipart upload
    @REM aws s3api abort-multipart-upload --region eu-west-1 --bucket !BUCKET_NAME! --key !key! --upload-id !uploadId!
)

endlocal
pause