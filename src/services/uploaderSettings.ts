import { Upload } from "../models/Upload";
import { User } from "../models/User";

class UploaderSettings {
	public readonly Bucket = process.env.BUCKET;

	public readonly BucketPath = process.env.BUCKET_PATH;

	public GetKey(upload: Upload) {
		const ext = upload.FileName.split(".").pop()?.toLowerCase();
		const pathPref = `${this.BucketPath}/${upload.User.UserId}/`;
		if (!upload.User.EpisodeId) {
			upload.FileName = `${upload.User.PodcastId}.${ext}`;
		} else {
			upload.FileName = `${upload.User.PodcastId}/${upload.User.EpisodeId}.${ext}`;
		}
		upload.FileName = `${pathPref}${upload.FileName}`;
		return upload.FileName;
	}
}

export const UploaderConfig = new UploaderSettings();
