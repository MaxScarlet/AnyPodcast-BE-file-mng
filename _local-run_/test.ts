import merge from "deepmerge";
import { handler } from "../src/index";

import * as apiRequestEmpty from "./data/API_Event_empty.json";
let apiRequest;

//GET apiRequest
import * as apiRequestGetList from "./data/API_Event_GET.json";
import { APIGatewayProxyEvent } from "../src/controllers/genericApiController";
// import * as apiRequestGetList from "./test.json";

//POST apiRequest
// import * as apiRequestGetList from './data/API_Event_POST.json';
apiRequest = merge(apiRequestEmpty, apiRequestGetList) as APIGatewayProxyEvent;
apiRequest.resource = '/test';
apiRequest.queryStringParameters = { fileName: "Myth-08.mp3" };
 
// apiRequest.body = JSON.stringify({
//     "PodcastID": "123123",
//     "Title": "Ep-2",
//     "Description": "Descr-2",
//     "IsVisible": true,
//     "Media": {
//       "CustomName": "somefile.mp3",
//       "MediaID": "29393728119"
//     }
//   });

(async () => {
	const resp = await handler(apiRequest);
	console.log(resp);
})();
