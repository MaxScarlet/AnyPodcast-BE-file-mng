import * as AWS from "aws-sdk";
import { UploaderConfig } from "../src/services/uploaderSettings";

async function clearMultipartUploads() {
	const bucket = UploaderConfig.Bucket!;
	const s3 = new AWS.S3({ region: process.env.REGION });

	try {
		const listResult = await s3.listMultipartUploads({ Bucket: bucket }).promise();

		// Iterate through the results
		for (const upload of listResult.Uploads || []) {
			const key = upload.Key;
			const uploadId = upload.UploadId;

			console.log(`Key: ${key}, UploadId: ${uploadId}`);
			const params: AWS.S3.AbortMultipartUploadRequest = {
				Bucket: bucket,
				Key: key!,
				UploadId: uploadId!,
			};
			await s3.abortMultipartUpload(params).promise();
		}

		console.log("Multipart uploads cleared successfully.");
	} catch (error) {
		console.error("Error clearing multipart uploads:", error);
	}
}

clearMultipartUploads();
