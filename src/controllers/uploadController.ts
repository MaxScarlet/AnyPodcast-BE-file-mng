import { APIGatewayProxyEvent } from "aws-lambda";
import { StatusCodes } from "http-status-codes";
import { GenericApiController } from "./genericApiController";
import { Upload } from "../models/Upload";
import { IFileMngService } from "../services/filemngService";

export class UploadController extends GenericApiController {
	constructor(private service: IFileMngService<any>) {
		super();
	}

	async handleRequest(event: APIGatewayProxyEvent): Promise<any> {
		try {
			const { httpMethod, path, body } = event;

			switch (httpMethod) {
				case "POST":
					if (body) {
						const bodyParsed = JSON.parse(body!) as any;
						const uploadResp = await this.service.upload(bodyParsed);
						return this.successResponse(uploadResp, StatusCodes.CREATED);
					} else {
						return this.errorResponse(StatusCodes.BAD_REQUEST);
					}
				case "PATCH":
					const deleteInstructions = JSON.parse(body!);
					for (const deleteInstruction of deleteInstructions) {
						await this.service.deleteFile(deleteInstruction);
					}
					return this.successResponse(StatusCodes.GONE);
				default:
					return this.errorResponse(StatusCodes.METHOD_NOT_ALLOWED);
			}
		} catch (error) {
			console.error("Error:", error);
			return this.errorResponse(StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}
