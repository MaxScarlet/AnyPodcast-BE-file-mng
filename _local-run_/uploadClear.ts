import * as AWS from "aws-sdk";

async function clearMultipartUploads() {
	// Specify your S3 bucket name
	const BUCKET_NAME = "upload.eu-w1.oxymoron-technique.com";

	// Create an S3 instance
	const s3 = new AWS.S3({ region: "eu-west-1" });

	try {
		// List multipart uploads
		const listResult = await s3.listMultipartUploads({ Bucket: BUCKET_NAME }).promise();

		// Iterate through the results
		for (const upload of listResult.Uploads || []) {
			const key = upload.Key;
			const uploadId = upload.UploadId;

			// Print the Key and UploadId for each iteration
			console.log(`Key: ${key}, UploadId: ${uploadId}`);
			const params: AWS.S3.AbortMultipartUploadRequest = {
				Bucket: BUCKET_NAME,
				Key: key!,
				UploadId: uploadId!,
			};
			// Abort the multipart upload
			await s3.abortMultipartUpload(params).promise();
		}

		console.log("Multipart uploads cleared successfully.");
	} catch (error) {
		console.error("Error clearing multipart uploads:", error);
	}
}

// Run the function
clearMultipartUploads();
