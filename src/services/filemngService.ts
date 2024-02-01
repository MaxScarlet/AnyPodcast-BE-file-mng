import { IFileMngService } from "../controllers/filemngController";
import { IDbHelper } from "../helpers/IDbHelper";
import { S3 } from "aws-sdk";

import { StatRecord, StatRecordDoc } from "../models/StatRecord";
// import { SearchParams } from "../models/searchParams";
const s3 = new S3({ region: "eu-west-1" });
export class FileMngService implements IFileMngService<StatRecord> {
	constructor(private dbHelper: IDbHelper<StatRecordDoc> | IDbHelper<StatRecord>) {}

	async init(queryString: any): Promise<string> {
		try {
			console.log("QS", queryString);
			const { fileName } = queryString;
			const bucket = "upload.eu-w1.oxymoron-technique.com";
			const key = `upload/${fileName}`;

			const initiateUploadResponse = await s3
				.createMultipartUpload({ Bucket: bucket, Key: key })
				.promise();
			const uploadId = initiateUploadResponse.UploadId;

			return uploadId!;
		} catch (error: any) {
			throw new Error(error);
		}
	}

	async complete(queryString: any, completedParts: any): Promise<any> {
		const { fileName, uploadId } = queryString;
		const bucket = `upload.eu-w1.oxymoron-technique.com`;
		const key = `upload/${fileName}`;

		const multipartResponse = await s3
			.completeMultipartUpload({
				Bucket: bucket,
				Key: key,
				UploadId: uploadId,
				MultipartUpload: { Parts: completedParts },
			})
			.promise();
            
		console.log("multipartResponse", multipartResponse);

		return multipartResponse;
	}
}
