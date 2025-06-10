import { ElMessage } from 'element-plus';
import { module, service } from '/@/cool';
import { extname, filename, uuid } from '/@/cool/utils';
import { pathJoin, generateThumbnail, isImageFile } from '../utils';
import { useBase } from '/$/base';
import { type AxiosProgressEvent } from 'axios';
import { merge } from 'lodash-es';
import { useI18n } from 'vue-i18n';

export function useUpload() {
	const { options } = module.get('upload');
	const { user } = useBase();
	const { t } = useI18n();

	// 上传
	async function toUpload(file: File, opts: Upload.Options = {}): Upload.Response {
		return new Promise((resolve, reject) => {
			const executor = async () => {
				// 合并配置
				const { 
					prefixPath, 
					onProgress, 
					generateThumbnailOnSuccess = true,
					thumbnailSize = 512,
					thumbnailQuality = 0.8
				} = merge({}, options, opts);

				// 文件id
				const fileId = uuid('');

				try {
					// 上传模式、类型
					const { mode, type } = await service.base.comm.uploadMode();

					// 本地上传
					const isLocal = mode == 'local';

					// 文件扩展名
					const ext = extname(file.name);

					// 文件名
					const name = filename(file.name) + '_' + fileId + '.' + ext;

					// Key
					let key = isLocal ? name : pathJoin(prefixPath!, name);

					// 多种上传请求
					const next = async ({ host, preview, data }: Upload.Request) => {
						const fd = new FormData();

						// key
						fd.append('key', key);

						// 签名数据
						for (const i in data) {
							if (!fd.has(i)) {
								fd.append(i, data[i]);
							}
						}

						// 文件
						fd.append('file', file);

						// 上传进度
						let progress = 0;

						const reqData = {
							url: host,
							method: 'POST',
							headers: {
								'Content-Type': 'multipart/form-data',
								Authorization: isLocal ? user.token : null,
								language: null
							},
							timeout: 600000,
							data: fd as any,
							onUploadProgress(e: AxiosProgressEvent) {
								progress = e.total ? Math.floor((e.loaded / e.total) * 100) : 0;
								onProgress?.(progress);
							},
							proxy: isLocal
						};

						if (type == 'minio') {
							reqData.headers['Content-Type'] = file.type;
							reqData.method = 'PUT';
							reqData.data = file;
						}

						// 上传
						await service
							.request(reqData as any)
							.then(async res => {
								if (progress != 100) {
									onProgress?.(100);
								}

								key = encodeURIComponent(key);

								let url = '';

								if (isLocal) {
									url = res;
								} else {
									url = pathJoin(preview || host, key);
								}

								const result: Upload.UploadResult = {
									key,
									url,
									fileId
								};

								// 如果是图片文件且启用了缩略图生成，则生成并上传缩略图
								if (generateThumbnailOnSuccess && isImageFile(file)) {
									try {
										console.log('开始生成缩略图...');
										const thumbnailFile = await generateThumbnail(file, thumbnailSize, thumbnailQuality);
										console.log('缩略图生成成功，开始上传缩略图...');
										
										// 上传缩略图
										const thumbnailResult = await toUpload(thumbnailFile, {
											...opts,
											generateThumbnailOnSuccess: false, // 避免递归生成缩略图
											onProgress: undefined // 缩略图上传不显示进度
										});
										
										console.log('缩略图上传成功:', thumbnailResult);
										
										// 将缩略图信息添加到结果中
										result.thumbnail = thumbnailResult;
									} catch (thumbnailError) {
										console.warn('缩略图生成或上传失败:', thumbnailError);
										// 缩略图失败不影响原图上传成功
									}
								}

								resolve(result);
							})
							.catch(err => {
								ElMessage.error(err.message);
								reject(err);
							});
					};

					if (isLocal) {
						next({
							host: 'admin/base/comm/upload'
						});
					} else {
						service.base.comm
							.upload(
								['aws', 'minio'].includes(type)
									? {
											key
										}
									: {}
							)
							.then(res => {
								switch (type) {
									// 腾讯
									case 'cos':
										next({
											host: res.url,
											data: res.credentials
										});
										break;
									// 阿里
									case 'oss':
										next({
											host: res.host,
											preview: res.publicDomain,
											data: {
												OSSAccessKeyId: res.OSSAccessKeyId,
												policy: res.policy,
												signature: res.signature
											}
										});
										break;
									// 七牛
									case 'qiniu':
										next({
											host: res.uploadUrl,
											preview: res.publicDomain,
											data: {
												token: res.token
											}
										});
										break;
									// aws
									case 'aws':
										next({
											host: res.url,
											data: res.fields
										});
										break;

									default:
										next({
											host: res.url,
											preview: res.previewUrl
										});
										break;
								}
							})
							.catch(reject);
					}
				} catch (err) {
					ElMessage.error(t('文件上传失败'));
					console.error('[upload]', err);
					reject(err);
				}
			};

			executor();
		});
	}

	return {
		options,
		toUpload
	};
}
