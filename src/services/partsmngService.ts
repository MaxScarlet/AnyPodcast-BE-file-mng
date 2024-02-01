import { IPartsMngService } from "../controllers/partsmngController";
import { IDbHelper } from "../helpers/IDbHelper";
import { S3 } from "aws-sdk";

import { StatRecord, StatRecordDoc } from "../models/StatRecord";
// import { SearchParams } from "../models/searchParams";
const s3 = new S3({ region: "eu-west-1" });
export class PartsMngService implements IPartsMngService<StatRecord> {
	constructor(private dbHelper: IDbHelper<StatRecordDoc> | IDbHelper<StatRecord>) {}

	async upload(queryString: any, body: any): Promise<string> {
		const { fileName, uploadId, partNumber } = queryString;
		const bucket = "upload.eu-w1.oxymoron-technique.com";
		const key = `upload/${fileName}`;
		const filePart = Buffer.from(body, "base64");

		const uploadPartResponse = await s3
			.uploadPart({
				Bucket: bucket,
				Key: key,
				UploadId: uploadId,
				PartNumber: parseInt(partNumber, 10),
				Body: filePart,
			})
			.promise();
		console.log("uploadPartResponse", uploadPartResponse);

		const eTag = uploadPartResponse.ETag;
		return eTag!;
	}
}
