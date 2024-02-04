import { APIGatewayProxyEvent } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { GenericApiController } from "./genericApiController";
import { FileMngService } from "../services/filemngService";
import MongoDbHelper from "../helpers/mongoHelper";
import { StatRecordDoc, StatRecordSchema } from "../models/StatRecord";

export class PartsMngController extends GenericApiController {
	constructor(private service: IPartsMngService<any>) {
		super();
	}

	async handleRequest(event: APIGatewayProxyEvent): Promise<any> {
		try {
			const { httpMethod, body } = event;

			switch (httpMethod) {
				case "GET": // test API
					const dbHelper = new MongoDbHelper<StatRecordDoc>("StatRecord", StatRecordSchema, 'StatRecord');
					const fileMngService = new FileMngService(dbHelper);

					let { fileName } = event.queryStringParameters as any;

					const fileBuffer = await this.service.downloadFile(fileName);
					if (fileBuffer) {
						fileName = "lambda-" + fileName;
						// Step 1: Start the multipart upload to get an upload ID
						const uploadId = await fileMngService.init({ fileName });

						// Step 2: Define part size and calculate the number of parts
						const partSize = 1024 * 1024 * 5; // 5 MB
						const parts: any[] = [];
						for (let start = 0; start < fileBuffer.length; start += partSize) {
							parts.push(fileBuffer.slice(start, Math.min(start + partSize, fileBuffer.length)));
						}

						const uploadedParts: any[] = [];
						for (let index = 0; index < parts.length; index++) {
							const partNumber = index + 1;
							const part = parts[index];
							const resp = await this.service.uploadPart({ fileName, uploadId, partNumber }, part);
							uploadedParts.push(resp);
						}

						const resp = await fileMngService.complete({ fileName, uploadId }, uploadedParts);
						console.log("Upload completed successfully.");
						return this.successResponse(resp);
					} else {
						return this.errorResponse(StatusCodes.NOT_FOUND);
					}

				case "POST":
					const queryString = event.queryStringParameters;
					const part: string = body!;
					const resp = await this.service.uploadPart(queryString, part);
					return this.successResponse({ resp: resp }, StatusCodes.CREATED);
				default:
					return this.errorResponse(StatusCodes.METHOD_NOT_ALLOWED);
			}
		} catch (error) {
			console.error("Error:", error);
			return this.errorResponse(StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}

export interface IPartsMngService<T> {
	uploadPart(queryString: any, body: string): Promise<any>;
	downloadFile(fileName: string): Promise<Buffer>;
}
