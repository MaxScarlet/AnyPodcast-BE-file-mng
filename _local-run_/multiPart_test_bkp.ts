// import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, CompleteMultipartUploadCommandInput } from "@aws-sdk/client-s3";
import { readFileSync } from 'fs';

import { FileMngService } from "../src/services/filemngService";
import MongoDbHelper from "../src/helpers/mongoHelper";
import { StatRecordDoc, StatRecordSchema } from "../src/models/StatRecord";
import { PartsMngService } from "../src/services/partsmngService";
// Initialize S3 client
// const s3 = new S3Client({ region: "il-central-1" });

async function multipartUpload(fileName: string, fileBuffer: Buffer) {
    // Step 1: Start the multipart upload to get an upload ID
    // const createMultipartUploadResponse = await s3.send(new CreateMultipartUploadCommand({
    //     Bucket: bucketName,
    //     Key: keyName,
    // }));
    // const uploadId = createMultipartUploadResponse.UploadId;
    const dbHelper = new MongoDbHelper<StatRecordDoc>("StatRecord", StatRecordSchema, 'StatRecord');

    const fileMngService = new FileMngService(dbHelper);
    const uploadService = new PartsMngService(dbHelper);

    const uploadId = await fileMngService.init({fileName});

    // Step 2: Define part size and calculate the number of parts
    const partSize = 1024 * 1024 * 5; // 5 MB
    const parts: any[] = [];
    for (let start = 0; start < fileBuffer.length; start += partSize) {
        parts.push(fileBuffer.slice(start, Math.min(start + partSize, fileBuffer.length)));
    }

    // const uploadPartsPromises: Promise<{ ETag: string| undefined; PartNumber: number | undefined }>[] = [];
    const uploadedParts: any[] = [];
    for (let index = 0; index < parts.length; index++) {
        const partNumber = index + 1;
        const part = parts[index];
        const resp = await uploadService.uploadPart({fileName, uploadId, partNumber}, part);
        uploadedParts.push(resp);
        // // Create a function that returns a promise for uploading a part
        // const uploadPartPromise = async () => {
        //     const uploadPartResponse = await s3.send(new UploadPartCommand({
        //         Bucket: bucketName,
        //         Key: fileName,
        //         PartNumber: partNumber,
        //         UploadId: uploadId,
        //         Body: part,
        //     }));
        //     return { ETag: uploadPartResponse.ETag, PartNumber: partNumber };
        // };
    
        // // Add the promise returned by the function to the array
        // uploadPartsPromises.push(uploadPartPromise());
    }
    
    // // You can later use Promise.all to wait for all uploads to finish, just like in the original code
    // const uploadedParts = await Promise.all(uploadPartsPromises);
    

    // Step 4: Complete the multipart upload
    // const completeMultipartUploadInput: CompleteMultipartUploadCommandInput = {
    //     Bucket: bucketName,
    //     Key: fileName,
    //     UploadId: uploadId,
    //     MultipartUpload: {
    //         Parts: uploadedParts,
    //     },
    // };
    // await s3.send(new CompleteMultipartUploadCommand(completeMultipartUploadInput));
    const resp = await fileMngService.complete({fileName, uploadId}, uploadedParts);
    console.log("Upload completed successfully.");
}

// Example usage
// const bucketName = "upload.eu-w1.oxymoron-technique.com";
const fileName = "Myth-08.mp3";
const data = readFileSync("../_uploads/" + fileName);
const binFile = Buffer.from(data);

multipartUpload(fileName, binFile).then(() => {
    console.log("Upload completed successfully.");
}).catch((error) => {
    console.error("An error occurred:", error);
});
