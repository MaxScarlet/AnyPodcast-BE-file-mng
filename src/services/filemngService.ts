import { IFileMngService } from "../controllers/filemngController";
import { IDbHelper } from "../helpers/IDbHelper";
import {
	S3Client,
	CreateMultipartUploadCommand,
	UploadPartCommand,
	CompleteMultipartUploadCommand,
	CompleteMultipartUploadCommandInput,
} from "@aws-sdk/client-s3";
const s3 = new S3Client({ region: "eu-west-1" });

import { StatRecord, StatRecordDoc } from "../models/StatRecord";
// import { SearchParams } from "../models/searchParams";
export class FileMngService implements IFileMngService<StatRecord> {
	constructor(private dbHelper: IDbHelper<StatRecordDoc> | IDbHelper<StatRecord>) {}

	async init(queryString: any): Promise<string> {
		try {
			console.log("QS", queryString);
			const { fileName } = queryString;
			const bucket = "upload.eu-w1.oxymoron-technique.com";
			const key = `upload/${fileName}`;

			const createMultipartUploadResponse = await s3.send(
				new CreateMultipartUploadCommand({
					Bucket: bucket,
					Key: key,
				})
			);
			const uploadId = createMultipartUploadResponse.UploadId;

			return uploadId!;
		} catch (error: any) {
			throw new Error(error);
		}
	}

	async complete(queryString: any, completedParts: any): Promise<any> {
		const { fileName, uploadId } = queryString;
		const bucket = `upload.eu-w1.oxymoron-technique.com`;
		const key = `upload/${fileName}`;

		const completeMultipartUploadInput: CompleteMultipartUploadCommandInput = {
			Bucket: bucket,
			Key: key,
			UploadId: uploadId,
			MultipartUpload: {
				Parts: completedParts,
			},
		};
		await s3.send(new CompleteMultipartUploadCommand(completeMultipartUploadInput));
	}
}
