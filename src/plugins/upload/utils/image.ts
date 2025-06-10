/**
 * 图片处理工具函数
 */

/**
 * 生成图片缩略图
 * @param file 原始图片文件
 * @param size 缩略图尺寸，默认512x512
 * @param quality 图片质量，0-1之间，默认0.8
 * @returns Promise<File> 缩略图文件
 */
export function generateThumbnail(
	file: File,
	size: number = 512,
	quality: number = 0.8
): Promise<File> {
	return new Promise((resolve, reject) => {
		// 检查是否为图片文件
		if (!file.type.startsWith('image/')) {
			reject(new Error('文件不是图片格式'));
			return;
		}

		// 创建图片对象
		const img = new Image();
		
		img.onload = () => {
			try {
				// 创建canvas
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				
				if (!ctx) {
					reject(new Error('无法创建canvas上下文'));
					return;
				}

				// 计算缩放比例，保持宽高比
				const { width, height } = img;
				let targetWidth = size;
				let targetHeight = size;

				// 如果原图是矩形，按比例缩放
				if (width !== height) {
					const aspectRatio = width / height;
					if (width > height) {
						targetHeight = size / aspectRatio;
					} else {
						targetWidth = size * aspectRatio;
					}
				}

				// 设置canvas尺寸
				canvas.width = size;
				canvas.height = size;

				// 填充白色背景
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(0, 0, size, size);

				// 计算居中位置
				const x = (size - targetWidth) / 2;
				const y = (size - targetHeight) / 2;

				// 绘制缩放后的图片
				ctx.drawImage(img, x, y, targetWidth, targetHeight);

				// 转换为Blob
				canvas.toBlob(
					(blob) => {
						if (!blob) {
							reject(new Error('生成缩略图失败'));
							return;
						}

						// 生成新的文件名，添加_512后缀
						const originalName = file.name;
						const lastDotIndex = originalName.lastIndexOf('.');
						const nameWithoutExt = originalName.substring(0, lastDotIndex);
						const ext = originalName.substring(lastDotIndex);
						const thumbnailName = `${nameWithoutExt}_512${ext}`;

						// 创建新的File对象
						const thumbnailFile = new File([blob], thumbnailName, {
							type: file.type,
							lastModified: Date.now()
						});

						resolve(thumbnailFile);
					},
					file.type,
					quality
				);
			} catch (error) {
				reject(error);
			}
		};

		img.onerror = () => {
			reject(new Error('图片加载失败'));
		};

		// 加载图片
		img.src = URL.createObjectURL(file);
	});
}

/**
 * 检查文件是否为图片
 * @param file 文件对象
 * @returns boolean
 */
export function isImageFile(file: File): boolean {
	return file.type.startsWith('image/');
}

/**
 * 获取图片尺寸
 * @param file 图片文件
 * @returns Promise<{width: number, height: number}>
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		if (!isImageFile(file)) {
			reject(new Error('文件不是图片格式'));
			return;
		}

		const img = new Image();
		
		img.onload = () => {
			resolve({
				width: img.naturalWidth,
				height: img.naturalHeight
			});
		};

		img.onerror = () => {
			reject(new Error('图片加载失败'));
		};

		img.src = URL.createObjectURL(file);
	});
} 