// import { FileMngService } from "../src/services/filemngService";
// import MongoDbHelper from "../src/helpers/mongoHelper";
// import { UploadDoc, UploadSchema } from "../src/models/Upload";
// import { PartsMngService } from "../src/services/partsmngService";

// const dbHelper = new MongoDbHelper<UploadDoc>("StatRecord", UploadSchema, 'StatRecord');

// const fileMngService = new FileMngService(dbHelper);
// const uploadService = new PartsMngService(dbHelper);

// async function multipartUpload(fileName: string, fileBuffer: Buffer) {
//     // Step 1: Start the multipart upload to get an upload ID
//     const uploadId = await fileMngService.init({ fileName });

//     // Step 2: Define part size and calculate the number of parts
//     const partSize = 1024 * 1024 * 5; // 5 MB
//     const parts: any[] = [];
//     for (let start = 0; start < fileBuffer.length; start += partSize) {
//         parts.push(fileBuffer.slice(start, Math.min(start + partSize, fileBuffer.length)));
//     }

//     const uploadedParts: any[] = [];
//     for (let index = 0; index < parts.length; index++) {
//         const partNumber = index + 1;
//         const part = parts[index];
//         const resp = await uploadService.uploadPart({ fileName, uploadId, partNumber }, part);
//         uploadedParts.push(resp);
//     }

//     const resp = await fileMngService.complete({ fileName, uploadId }, uploadedParts);
//     console.log("Upload completed successfully.");
// }

// (async () => {
//     const fileName = "Myth-08.mp3";
//     // const data = readFileSync("../_uploads/" + fileName);
//     // const binFile = Buffer.from(data);
//     const binFile = await uploadService.downloadFile(fileName);

//     multipartUpload("test_" + fileName, binFile).then(() => {
//         console.log("Upload completed successfully.");
//     }).catch((error) => {
//         console.error("An error occurred:", error);
//     });
// })();

