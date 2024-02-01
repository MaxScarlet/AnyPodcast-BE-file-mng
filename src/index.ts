import { APIGatewayProxyEvent } from "aws-lambda";
import { FileMngService } from "./services/filemngService";
import { FileMngController } from "./controllers/filemngController";
import MongoDbHelper from "./helpers/mongoHelper";
import { StatRecordDoc, StatRecordSchema } from "./models/StatRecord";
import { GenericApiController } from "./controllers/genericApiController";
import { PartsMngController } from "./controllers/partsmngController";
import { PartsMngService } from "./services/partsmngService";

const tableName = process.env.DB_TABLE!;

const dbHelper = new MongoDbHelper<StatRecordDoc>("StatRecord", StatRecordSchema, tableName);
// const statsService = new FileMngService(dbHelper);
const fileMngService = new FileMngService(dbHelper);
const fileMngController = new FileMngController(fileMngService);

const partsMngService = new PartsMngService(dbHelper);
const partsMngController = new PartsMngController(partsMngService);
export const handler = async (event: APIGatewayProxyEvent) => {
	console.log(`Event: ${JSON.stringify(event)}`);
	await dbHelper.connect();

	const resourceName = GenericApiController.getRootResource(event.resource, 1);
	switch (resourceName) {
		case "init":
		case "complete":
			console.log("init/complete");
			return await fileMngController.handleRequest(event);
		case "upload":
			console.log("upload");
			return await partsMngController.handleRequest(event);
		default:
			throw new Error("Invalid resource");
	}
};
