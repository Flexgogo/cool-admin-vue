declare namespace Upload {
	interface Rule {
		name: string;
		type: string;
		color: string;
		exts: string[];
	}

	interface Item {
		url?: string;
		uid?: string;
		progress?: number;
		preload?: string;
		error?: string;
		isPlay?: boolean;
		thumbnail?: UploadResult;
		[key: string]: any;
	}

	interface Options {
		prefixPath?: string;
		onProgress?(progress: number): void;
		generateThumbnailOnSuccess?: boolean;
		thumbnailSize?: number;
		thumbnailQuality?: number;
		[key: string]: any;
	}

	interface UploadResult {
		key: string;
		url: string;
		fileId: string;
		thumbnail?: UploadResult;
	}

	type Response = Promise<UploadResult>;

	interface Request {
		host: string;
		preview?: string;
		data?: any;
	}
}
