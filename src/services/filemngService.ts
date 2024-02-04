import { IFileMngService } from "../controllers/filemngController";
import { IDbHelper } from "../helpers/IDbHelper";
import {
	S3Client,
	CreateMultipartUploadCommand,
	CompleteMultipartUploadCommand,
	CompleteMultipartUploadCommandInput,
} from "@aws-sdk/client-s3";

import { UploaderConfig } from "./uploaderSettings";
import { StatRecord, StatRecordDoc } from "../models/StatRecord";

const s3 = new S3Client({ region: UploaderConfig.BucketRegion });
export class FileMngService implements IFileMngService<StatRecord> {
	constructor(private dbHelper: IDbHelper<StatRecordDoc> | IDbHelper<StatRecord>) { }

	async init(queryString: any): Promise<string> {
		console.log("QS", queryString);
		const { fileName } = queryString;
		const key = `${UploaderConfig.UploadFolder}/${fileName}`;

		const createMultipartUploadResponse = await s3.send(
			new CreateMultipartUploadCommand({
				Bucket: UploaderConfig.Bucket,
				Key: key,
			})
		);
		const uploadId = createMultipartUploadResponse.UploadId;

		return uploadId!;
	}

	async complete(queryString: any, completedParts: any): Promise<any> {
		const { fileName, uploadId } = queryString;
		const key = `${UploaderConfig.UploadFolder}/${fileName}`;

		const completeMultipartUploadInput: CompleteMultipartUploadCommandInput = {
			Bucket: UploaderConfig.Bucket,
			Key: key,
			UploadId: uploadId,
			MultipartUpload: {
				Parts: completedParts,
			},
		};
		const resp = await s3.send(new CompleteMultipartUploadCommand(completeMultipartUploadInput));
		return resp;
	}
}
