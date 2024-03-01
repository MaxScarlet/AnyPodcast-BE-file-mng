import { IDbHelper } from "../helpers/IDbHelper";
import {
	S3Client,
	CreateMultipartUploadCommand,
	CompleteMultipartUploadCommand,
	CompleteMultipartUploadCommandInput,
	UploadPartCommand,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UploaderConfig } from "./uploaderSettings";
import { Upload, UploadDoc } from "../models/Upload";
import { once } from "events";
import { Readable } from "stream";
import { Part } from "../models/Part";
import { v4 as uuidv4 } from "uuid";

export interface IFileMngService<T> {
	init(upload: Upload): Promise<Upload>;
	// uploadPart(part: Part, body: string): Promise<Part>;
	downloadFile(fileName: string): Promise<Buffer>;
	complete(upload: Upload, completedParts: any): Promise<any>;
}

export class FileMngService implements IFileMngService<Upload> {
	private s3 = new S3Client({ region: process.env.REGION });
	constructor(private dbHelper: IDbHelper<UploadDoc> | IDbHelper<Upload>) {}

	async init(upload: Upload): Promise<Upload> {
		console.log("Upload", upload);
        
        //TODO: check if it comes from create or update
		const ext = upload.FileName.split(".").pop()?.toLowerCase();
		upload.FileName = this.getUID() + "." + ext;

		const createResp = await this.s3.send(
			new CreateMultipartUploadCommand({
				Bucket: UploaderConfig.Bucket,
				Key: UploaderConfig.GetKey(upload.FileName, upload.User),
			})
		);
		upload.UploadId = createResp.UploadId!;

		// Assuming totalParts is passed in with the upload or calculated based on file size
		const totalParts = upload.TotalParts ?? 0;
		const expTime = process.env.ENV === "local" ? 60 : 3600; // URL expires in 1 hour
		for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
			const command = new UploadPartCommand({
				Bucket: UploaderConfig.Bucket,
				Key: UploaderConfig.GetKey(upload.FileName, upload.User),
				UploadId: upload.UploadId,
				PartNumber: partNumber,
			});
			const url = await getSignedUrl(this.s3, command, { expiresIn: expTime });
			upload.Parts.push({ PartNumber: partNumber, PresignedUrl: url });
		}
		console.log("Parts", upload.Parts);

		// Create record in DB with pre-signed URLs
		upload.Created = new Date().toISOString();
		upload.IsCompleted = false;
		await this.dbHelper.create<Upload>(upload);

		return upload;
	}

	// async uploadPart(part: Part, body: string): Promise<Part> {
	// 	const uploadFound = await this.dbHelper.get_list<Upload>({ UploadId: part.UploadId });
	// 	console.log("uploadFound in DB", uploadFound);
	// 	if (uploadFound) {
	// 		const upload = uploadFound[0];
	// 		const filePart = Buffer.from(body, "base64");

	// 		const uploadPartResponse = await this.s3.send(
	// 			new UploadPartCommand({
	// 				Bucket: UploaderConfig.Bucket,
	// 				Key: UploaderConfig.GetKey(upload.FileName),
	// 				PartNumber: part.PartNumber,
	// 				UploadId: part.UploadId,
	// 				Body: filePart,
	// 			})
	// 		);
	// 		part.ETag = uploadPartResponse.ETag;
	// 		const { UploadId, ...partOut } = part;
	// 		return partOut;
	// 	} else {
	// 		throw new Error(`Upload ${part.UploadId} not found`);
	// 	}
	// }
	getUID(): string {
		const uid: string = uuidv4();
		return uid;
	}

	async complete(upload: Upload, completedParts: Part[]): Promise<any> {
		console.log("Upload", upload);
		console.log("completedParts", completedParts);
		const uploadFound = await this.dbHelper.get_list<UploadDoc>({ UploadId: upload.UploadId });
		console.log("uploadFound in DB", uploadFound);
		if (uploadFound) {
			const upload = uploadFound[0];
			completedParts.sort((a, b) => a.PartNumber - b.PartNumber);
			console.log("completedParts", completedParts);

			const completeMultipartUploadInput: CompleteMultipartUploadCommandInput = {
				Bucket: UploaderConfig.Bucket,
				Key: UploaderConfig.GetKey(upload.FileName, upload.User),
				UploadId: upload.UploadId,
				MultipartUpload: {
					Parts: completedParts,
				},
			};
			console.log("completeMultipartUploadInput", completeMultipartUploadInput);
			const resp = await this.s3.send(
				new CompleteMultipartUploadCommand(completeMultipartUploadInput)
			);
			upload.IsCompleted = true;
			const response = await this.dbHelper.update<Upload>(upload._id, upload);

			return upload;
		} else {
			throw new Error(`Upload ${upload.UploadId} not found`);
		}
	}

	async downloadFile(fileName: string): Promise<Buffer> {
		console.log("Upload", fileName);
		const getObjectParams = {
			Bucket: UploaderConfig.Bucket,
			Key: `${UploaderConfig.BucketPath}/${fileName}`,
		};

		const { Body } = await this.s3.send(new GetObjectCommand(getObjectParams));
		if (Body instanceof Readable) {
			const chunks: any[] = [];
			Body.on("data", (chunk) => chunks.push(chunk));
			await once(Body, "end");
			return Buffer.concat(chunks);
		} else {
			throw new Error("Expected a stream for the file body.");
		}
	}
}
