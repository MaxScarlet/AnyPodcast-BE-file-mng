import {
    S3Client,
    UploadPartCommand
} from "@aws-sdk/client-s3";
import { IPartsMngService } from "../controllers/partsmngController";
import { IDbHelper } from "../helpers/IDbHelper";
const s3 = new S3Client({ region: "eu-west-1" });

import { StatRecord, StatRecordDoc } from "../models/StatRecord";
// import { SearchParams } from "../models/searchParams";
export class PartsMngService implements IPartsMngService<StatRecord> {
	constructor(private dbHelper: IDbHelper<StatRecordDoc> | IDbHelper<StatRecord>) {}

	async upload(queryString: any, body: string): Promise<any> {
		const { fileName, uploadId, partNumber } = queryString;
		const bucket = "upload.eu-w1.oxymoron-technique.com";
		const key = `upload/${fileName}`;
		const filePart = Buffer.from(body, "base64");

		try {
			const uploadPartResponse = await s3.send(
				new UploadPartCommand({
					Bucket: bucket,
					Key: key,
					PartNumber: partNumber,
					UploadId: uploadId,
					Body: filePart,
				})
			);
			return { ETag: uploadPartResponse.ETag, PartNumber: partNumber };
		} catch (error: any) {
			console.error(error);
			throw new Error(error);
		}
	}
}
