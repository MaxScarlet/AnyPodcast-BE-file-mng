import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, CompleteMultipartUploadCommandInput } from "@aws-sdk/client-s3";
import { readFileSync } from 'fs';
// Initialize S3 client
const s3 = new S3Client({ region: "eu-west-1" });

async function multipartUpload(bucketName: string, keyName: string, fileBuffer: Buffer) {
    // Step 1: Start the multipart upload to get an upload ID
    const createMultipartUploadResponse = await s3.send(new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: keyName,
    }));
    const uploadId = createMultipartUploadResponse.UploadId;

    // Step 2: Define part size and calculate the number of parts
    const partSize = 1024 * 1024 * 5; // 5 MB
    const parts: any[] = [];
    for (let start = 0; start < fileBuffer.length; start += partSize) {
        parts.push(fileBuffer.slice(start, Math.min(start + partSize, fileBuffer.length)));
    }

    // Step 3: Upload parts
    // const uploadPartsPromises = parts.map(async (part, index) => {
    //     const partNumber = index + 1;
    //     const uploadPartResponse = await s3.send(new UploadPartCommand({
    //         Bucket: bucketName,
    //         Key: keyName,
    //         PartNumber: partNumber,
    //         UploadId: uploadId,
    //         Body: part,
    //     }));
    //     return { ETag: uploadPartResponse.ETag, PartNumber: partNumber };
    // });

    // const uploadedParts = await Promise.all(uploadPartsPromises);


    const uploadPartsPromises: Promise<{ ETag: string| undefined; PartNumber: number | undefined }>[] = [];

    for (let index = 0; index < parts.length; index++) {
        const partNumber = index + 1;
        const part = parts[index];
    
        // Create a function that returns a promise for uploading a part
        const uploadPartPromise = async () => {
            const uploadPartResponse = await s3.send(new UploadPartCommand({
                Bucket: bucketName,
                Key: keyName,
                PartNumber: partNumber,
                UploadId: uploadId,
                Body: part,
            }));
            return { ETag: uploadPartResponse.ETag, PartNumber: partNumber };
        };
    
        // Add the promise returned by the function to the array
        uploadPartsPromises.push(uploadPartPromise());
    }
    
    // You can later use Promise.all to wait for all uploads to finish, just like in the original code
    const uploadedParts = await Promise.all(uploadPartsPromises);
    
    // Step 4: Complete the multipart upload
    const completeMultipartUploadInput: CompleteMultipartUploadCommandInput = {
        Bucket: bucketName,
        Key: keyName,
        UploadId: uploadId,
        MultipartUpload: {
            Parts: uploadedParts,
        },
    };
    await s3.send(new CompleteMultipartUploadCommand(completeMultipartUploadInput));
}

// Example usage
const bucketName = "upload.eu-w1.oxymoron-technique.com";
const keyName = "Myth-08.mp3";
const data = readFileSync("./_local-run_/" + keyName);
const fileBuffer = Buffer.from(data);

multipartUpload(bucketName, keyName, fileBuffer).then(() => {
    console.log("Upload completed successfully.");
}).catch((error) => {
    console.error("An error occurred:", error);
});
