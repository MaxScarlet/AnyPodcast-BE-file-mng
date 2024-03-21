import {
	S3Client,
	ListMultipartUploadsCommand,
	AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";

async function clearMultipartUploads() {
	const bucket = "web.il.oxymoron-tech.com";
	const region = "il-central-1";


	const s3Client = new S3Client({ region: region });

	try {
		const listResult = await s3Client.send(new ListMultipartUploadsCommand({ Bucket: bucket }));

		if (listResult.Uploads) {
			for (const upload of listResult.Uploads) {
				const key = upload.Key;
				const uploadId = upload.UploadId;

				console.log(`Key: ${key}, UploadId: ${uploadId}`);
				const params = {
					Bucket: bucket,
					Key: key!,
					UploadId: uploadId!,
				};
				await s3Client.send(new AbortMultipartUploadCommand(params));
			}
		}

		console.log("Multipart uploads cleared successfully.");
	} catch (error) {
		console.error("Error clearing multipart uploads:", error);
	}
}

clearMultipartUploads();
