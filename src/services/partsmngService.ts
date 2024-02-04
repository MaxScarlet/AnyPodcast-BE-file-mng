import {
	GetObjectCommand,
	S3Client,
	UploadPartCommand
} from "@aws-sdk/client-s3";
import { IPartsMngService } from "../controllers/partsmngController";
import { IDbHelper } from "../helpers/IDbHelper";
import { UploaderConfig } from "./uploaderSettings";
import { StatRecord, StatRecordDoc } from "../models/StatRecord";
import { once } from 'events';
import { Readable } from "stream";

const s3 = new S3Client({ region: UploaderConfig.BucketRegion });
export class PartsMngService implements IPartsMngService<StatRecord> {
	constructor(private dbHelper: IDbHelper<StatRecordDoc> | IDbHelper<StatRecord>) { }

	async downloadFile(fileName: string): Promise<Buffer> {
		const getObjectParams = {
			Bucket: UploaderConfig.Bucket,
			Key: `${UploaderConfig.UploadFolder}/${fileName}`,
		};

		const { Body } = await s3.send(new GetObjectCommand(getObjectParams));
		if (Body instanceof Readable) {
			const chunks: any[] = [];
			Body.on('data', (chunk) => chunks.push(chunk));
			await once(Body, 'end');
			return Buffer.concat(chunks);
		} else {
			throw new Error("Expected a stream for the file body.");
		}
	}
	async uploadPart(queryString: any, body: string): Promise<any> {
		const { fileName, uploadId, partNumber } = queryString;

		const key = `${UploaderConfig.UploadFolder}/${fileName}`;
		const filePart = Buffer.from(body, "base64");

		const uploadPartResponse = await s3.send(
			new UploadPartCommand({
				Bucket: UploaderConfig.Bucket,
				Key: key,
				PartNumber: partNumber,
				UploadId: uploadId,
				Body: filePart,
			})
		);
		return { ETag: uploadPartResponse.ETag, PartNumber: partNumber };
	}
}
