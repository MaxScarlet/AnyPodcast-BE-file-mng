import { APIGatewayProxyEvent } from "aws-lambda";
import MongoDbHelper from "./helpers/mongoHelper";
import { GenericApiController } from "./controllers/genericApiController";

import { UploadDoc, UploadSchema } from "./models/Upload";
import { InitController } from "./controllers/initController";
import { CompleteController } from "./controllers/completeController";

import { FileMngService } from "./services/filemngService";

const tableName = process.env.DB_TABLE!;

const dbHelper = new MongoDbHelper<UploadDoc>("Upload", UploadSchema, tableName);
const fileMngService = new FileMngService(dbHelper);

const initController = new InitController(fileMngService);
const completeController = new CompleteController(fileMngService);

export const handler = async (event: APIGatewayProxyEvent) => {
	await dbHelper.connect();

	const resourceName = GenericApiController.getRootResource(event.resource, 2);
	switch (resourceName) {
		case "init":
			console.log(`Event: ${JSON.stringify(event)}`);
			console.log("init API");
			return await initController.handleRequest(event);
		// case "part":
		// 	console.log("upload API");
		// 	return await partsMngController.handleRequest(event);
		case "complete":
			console.log(`Event: ${JSON.stringify(event)}`);
			console.log("complete API");
			return await completeController.handleRequest(event);
		// case "test":
		// 	console.log("test API");
		// 	return await partsMngController.handleRequest(event);
		default:
			throw new Error("Invalid resource");
	}
};
