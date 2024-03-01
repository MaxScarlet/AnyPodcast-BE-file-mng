import { User } from "../models/User";

class UploaderSettings {
	public readonly Bucket = process.env.BUCKET;

	// public readonly Project = "AnyPodcast";
	// public readonly UploadFolder = "upload";
	public readonly BucketPath = process.env.BUCKET_PATH;

	public GetKey(fileName: string, user: User) {
		// return `${this.UploadFolder}/${projectName}/${process.env.ENV ?? "local"}/${fileName}`;
		return `${this.BucketPath}/${user.UserId}/${user.PodcastId}/${fileName}`;
	}
}

export const UploaderConfig = new UploaderSettings();
