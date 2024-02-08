 class UploaderSettings {
    public readonly Bucket = "upload.eu-w1.oxymoron-technique.com";
    public readonly BucketRegion = "eu-west-1";
    // public readonly Bucket = "web.il.oxymoron-technique.com";
    // public readonly BucketRegion = "il-central-1";
    public readonly UploadFolder = "upload";
    public GetKey(fileName: string) {
        return `${this.UploadFolder}/${process.env.ENV??"local"}/${fileName}`
    }
}
export const UploaderConfig = new UploaderSettings();