<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<!-- 新增按钮 -->
			<cl-add-btn />
			<!-- 批量图片上传按钮 -->
			<el-button type="primary" @click="openBatchUpload">
				<el-icon><Upload /></el-icon>
				{{ t("批量图片上传") }}
			</el-button>
			<!-- 删除按钮 -->
			<cl-multi-delete-btn />
			<cl-flex1 />
			<!-- 条件搜索 -->
			<cl-search ref="Search" />
		</cl-row>

		<cl-row>
			<!-- 数据表格 -->
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<!-- 分页控件 -->
			<cl-pagination />
		</cl-row>

		<!-- 新增、编辑 -->
		<cl-upsert ref="Upsert" />

		<!-- 批量图片上传对话框 -->
		<el-dialog
			v-model="batchUpload.visible"
			:title="t('批量图片上传')"
			width="800px"
			:close-on-click-modal="false"
		>
			<div class="batch-upload-container">
				<div class="upload-area">
					<cl-upload
						ref="batchUploadRef"
						v-model="batchUpload.imageUrls"
						:multiple="true"
						:limit="200"
						:auto-upload="false"
						type="image"
						:size="[120, 120]"
						@change="handleUploadChange"
						@success="handleUploadSuccess"
						@error="handleUploadError"
						@remove="handleUploadRemove"
					/>
					<div class="upload-tip">
						{{ t("支持jpg/png格式，最多选择200张图片") }}
					</div>
				</div>

				<!-- 批量设置区域 -->
				<div v-if="batchUpload.imageUrls.length > 0" class="batch-settings">
					<h4>{{ t("批量设置") }}</h4>
					<div class="batch-form">
						<el-form :model="batchUpload.batchSettings" label-width="100px">
							<el-row :gutter="20">
								<el-col :span="12">
									<el-form-item :label="t('选择分类')">
										<CategorySelect v-model="batchUpload.batchSettings.categoryId" />
									</el-form-item>
								</el-col>
								<el-col :span="12">
									<el-form-item :label="t('状态')">
										<el-radio-group v-model="batchUpload.batchSettings.status">
											<el-radio :label="0">{{ t("下架") }}</el-radio>
											<el-radio :label="1">{{ t("上架") }}</el-radio>
										</el-radio-group>
									</el-form-item>
								</el-col>
								<el-col :span="12">
									<el-form-item :label="t('起始排序')">
										<el-input-number
											v-model="batchUpload.batchSettings.startOrderNum"
											:min="0"
											:placeholder="t('请输入起始排序号')"
										/>
									</el-form-item>
								</el-col>
								<el-col :span="12">
									<el-form-item :label="t('排序间隔')">
										<el-input-number
											v-model="batchUpload.batchSettings.orderStep"
											:min="1"
											:placeholder="t('排序递增间隔')"
										/>
									</el-form-item>
								</el-col>
								<el-col :span="24">
									<el-form-item :label="t('统一描述')">
										<el-input
											v-model="batchUpload.batchSettings.description"
											type="textarea"
											:rows="2"
											:placeholder="t('为所有商品设置统一描述')"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="24">
									<el-button type="primary" @click="applyBatchSettings">
										{{ t("应用到所有商品") }}
									</el-button>
									<el-button @click="resetBatchSettings">
										{{ t("重置设置") }}
									</el-button>
								</el-col>
							</el-row>
						</el-form>
					</div>
				</div>

				<div v-if="batchUpload.imageUrls.length > 0" class="goods-preview">
					<h4>{{ t("商品预览") }}</h4>
					<div class="preview-list">
						<div
							v-for="(item, index) in batchUpload.previewList"
							:key="index"
							class="preview-item"
						>
							<div class="preview-image">
								<cl-image :src="item.pic" :size="120" />
								<div class="image-overlay">
									<el-button
										type="danger"
										size="small"
										circle
										@click="removePreviewItem(index)"
									>
										<el-icon><Delete /></el-icon>
									</el-button>
								</div>
							</div>
							<div class="preview-form">
								<el-form :model="item" label-width="80px">
									<el-form-item :label="t('商品名称')" required>
										<el-input
											v-model="item.name"
											:placeholder="t('请输入商品名称')"
											clearable
										/>
									</el-form-item>
									<el-form-item :label="t('选择分类')" required>
										<CategorySelect v-model="item.categoryId" />
									</el-form-item>
									<el-form-item :label="t('状态')">
										<el-radio-group v-model="item.status">
											<el-radio :label="0">{{ t("下架") }}</el-radio>
											<el-radio :label="1">{{ t("上架") }}</el-radio>
										</el-radio-group>
									</el-form-item>
									<el-form-item :label="t('排序')">
										<el-input-number
											v-model="item.orderNum"
											:min="0"
											:placeholder="t('请输入排序号')"
										/>
									</el-form-item>
									<el-form-item :label="t('描述')">
										<el-input
											v-model="item.description"
											type="textarea"
											:rows="2"
											:placeholder="t('请输入商品描述')"
										/>
									</el-form-item>
								</el-form>
							</div>
						</div>
					</div>
				</div>
			</div>

			<template #footer>
				<span class="dialog-footer">
					<el-button @click="batchUpload.visible = false">{{ t("取消") }}</el-button>
					<el-button
						type="primary"
						:loading="batchUpload.loading"
						@click="submitBatchUpload"
						:disabled="batchUpload.imageUrls.length === 0"
					>
						{{ t("确认上传") }}
					</el-button>
				</span>
			</template>
		</el-dialog>
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: "shop-goods",
});

import { useCrud, useTable, useUpsert, useSearch } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";
import { reactive, ref, watch, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Upload, Plus, Delete } from "@element-plus/icons-vue";
import CategorySelect from "/$/shop/components/category-select.vue";

const { service } = useCool();
const { t } = useI18n();

// 批量上传引用
const batchUploadRef = ref();

// 批量上传状态
const batchUpload = reactive({
	visible: false,
	loading: false,
	imageUrls: [] as string[], // 存储上传成功的图片URL
	previewList: [] as any[], // 商品预览列表
	batchSettings: {
		categoryId: null,
		status: 1,
		startOrderNum: 10,
		orderStep: 10,
		description: "",
	},
});

// 选项
const options = reactive({
	status: [
		{ label: t("下架"), value: 0, type: "danger" },
		{ label: t("上架"), value: 1, type: "success" },
	],
});

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			label: t("图片"),
			prop: "pic",
			component: { 
				name: "cl-upload",
				props: {
					onSuccess: (result: any) => {
						try {
							// 处理上传成功事件，支持多种返回格式
							let url = '';
							
							// 根据不同的返回格式提取URL
							if (typeof result === 'string') {
								url = result;
							} else if (result && typeof result === 'object') {
								// 可能的格式：{ url: string } 或 { data: { url: string } }
								url = result.url || result.data?.url || result.response?.url || '';
							}
							
							// 当图片上传成功后，自动设置商品名称
							if (url && Upsert.value?.form) {
								const fileName = getFileNameFromUrl(url);
								// 只有当名称字段为空时才自动设置，避免覆盖用户已输入的内容
								if (!Upsert.value.form.name) {
									Upsert.value.form.name = fileName;
									console.log('自动设置商品名称:', fileName);
								}
							}
							
							return url;
						} catch (error) {
							console.error('处理上传成功事件失败:', error);
							ElMessage.error(t('处理上传结果失败'));
							return '';
						}
					},
					onError: (error: any) => {
						try {
							console.error('图片上传失败:', error);
							ElMessage.error(t('图片上传失败，请重试'));
						} catch (e) {
							console.error('处理上传错误事件失败:', e);
						}
					}
				}
			},
			required: true,
		},
		{
			label: t("名称"),
			prop: "name",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("选择分类"),
			prop: "categoryId",
			component: { 
				name: "shop-category-select",
				vm: CategorySelect
			},
			span: 12,
			required: true,
		},
		{
			label: t("状态"),
			prop: "status",
			component: { name: "el-radio-group", options: options.status },
			value: 0,
			required: true,
		},
		{
			label: t("描述"),
			prop: "description",
			component: {
				name: "el-input",
				props: { type: "textarea", rows: 4 },
			},
		},
		{
			label: t("排序"),
			prop: "orderNum",
			hook: "number",
			component: { name: "el-input-number", props: { min: 0 } },
			span: 12,
			required: true,
		},
	],
	
	// 添加事件处理
	onOpen() {
		try {
			console.log('商品表单打开');
		} catch (error) {
			console.error('表单打开事件处理失败:', error);
		}
	},
	
	onOpened(data) {
		try {
			console.log('商品表单已打开，数据：', data);
		} catch (error) {
			console.error('表单已打开事件处理失败:', error);
		}
	},
	
	onSubmit(data, { next }) {
		return new Promise((resolve, reject) => {
			try {
				console.log('提交商品数据：', data);
				
				// 数据验证
				if (!data.name || !data.categoryId || !data.pic) {
					ElMessage.error(t('请填写必填字段'));
					reject(new Error('必填字段缺失'));
					return;
				}
				
				// 继续执行默认的提交逻辑
				next(data)
					.then(resolve)
					.catch((error) => {
						console.error('提交商品数据失败:', error);
						ElMessage.error(t('提交失败，请检查数据格式'));
						reject(error);
					});
			} catch (error) {
				console.error('提交商品数据失败:', error);
				ElMessage.error(t('提交失败，请检查数据格式'));
				reject(error);
			}
		});
	},
	
	onClose(action, done) {
		try {
			console.log('关闭商品表单，操作类型：', action);
			
			// 确保正确关闭
			if (typeof done === 'function') {
				done();
			}
		} catch (error) {
			console.error('关闭表单时出错:', error);
			// 强制关闭
			if (typeof done === 'function') {
				done();
			}
		}
	},
	
	onClosed() {
		try {
			console.log('商品表单已关闭');
		} catch (error) {
			console.error('表单已关闭事件处理失败:', error);
		}
	}
});

// cl-table
const Table = useTable({
	columns: [
		{ type: "selection" },
		{ label: t("分类ID"), prop: "categoryId", minWidth: 100 },
		{ label: t("分类名称"), prop: "categoryName", minWidth: 140 },
		{
			label: t("图片"),
			prop: "pic",
			minWidth: 100,
			component: { name: "cl-image", props: { size: 60 } },
		},
		{ label: t("名称"), prop: "name", minWidth: 140 },
		{
			label: t("状态"),
			prop: "status",
			minWidth: 100,
			component: { name: "cl-switch" },
			dict: options.status,
		},
		{
			label: t("描述"),
			prop: "description",
			showOverflowTooltip: true,
			minWidth: 200,
		},
		{
			label: t("排序"),
			prop: "orderNum",
			minWidth: 140,
			sortable: "custom",
		},
		{
			label: t("创建时间"),
			prop: "createTime",
			minWidth: 170,
			sortable: "desc",
			component: { name: "cl-date-text" },
		},
		{
			label: t("更新时间"),
			prop: "updateTime",
			minWidth: 170,
			sortable: "custom",
			component: { name: "cl-date-text" },
		},
		{ type: "op", buttons: ["edit", "delete"] },
	],
});

// cl-search
const Search = useSearch({
	items: [
		{
			label: t("图片名称"),
			prop: "name",
			component: { name: "el-input", props: { clearable: true, placeholder: t("请输入图片名称") } },
		},
		{
			label: t("分类"),
			prop: "categoryId",
			component: { 
				name: "shop-category-select",
				vm: CategorySelect,
				props: { clearable: true, placeholder: t("请选择分类") }
			},
		},
		{
			label: t("状态"),
			prop: "status",
			component: { name: "el-select", options: options.status, props: { clearable: true, placeholder: t("请选择状态") } },
		},
	],
});

// cl-crud
const Crud = useCrud(
	{
		service: service.shop.goods,
	},
	(app) => {
		app.refresh();
	},
);

// 刷新
function refresh(params?: any) {
	try {
		Crud.value?.refresh(params);
	} catch (error) {
		console.error('刷新商品列表失败:', error);
		ElMessage.error(t('刷新失败，请重试'));
	}
}

// 打开批量上传对话框
function openBatchUpload() {
	try {
		batchUpload.visible = true;
		batchUpload.imageUrls = [];
		batchUpload.previewList = [];
		batchUpload.loading = false;
		
		// 重置批量设置
		batchUpload.batchSettings = {
			categoryId: null,
			status: 1,
			startOrderNum: 10,
			orderStep: 10,
			description: "",
		};
		
		// 确保上传组件引用被正确重置
		if (batchUploadRef.value) {
			try {
				// 如果组件有clear方法，调用它
				if (typeof batchUploadRef.value.clear === 'function') {
					batchUploadRef.value.clear();
				}
			} catch (error) {
				console.warn('重置上传组件状态失败:', error);
			}
		}
		
		console.log('批量上传对话框已打开');
	} catch (error) {
		console.error('打开批量上传对话框失败:', error);
		ElMessage.error(t('打开上传对话框失败，请重试'));
	}
}

// 处理上传变化
function handleUploadChange(urls: string[]) {
	try {
		console.log('上传变化事件:', urls);
		
		// 参数验证
		if (!Array.isArray(urls)) {
			console.warn('上传变化事件接收到非数组数据:', urls);
			// 尝试转换为数组
			if (urls) {
				urls = [urls].flat();
			} else {
				urls = [];
			}
		}
		
		// 更新图片URL数组
		batchUpload.imageUrls = [...urls];
		
		// 当图片URL数组发生变化时，更新预览列表
		updatePreviewList(urls);
		
		console.log('上传变化处理完成，当前图片数量:', urls.length);
	} catch (error) {
		console.error('处理上传变化失败:', error);
		ElMessage.error(t('处理上传文件失败，请重试'));
	}
}

// 处理上传成功
function handleUploadSuccess(result: any) {
	try {
		console.log('上传成功事件:', result);
		
		// 处理不同格式的返回结果
		let url = '';
		if (typeof result === 'string') {
			url = result;
		} else if (result && typeof result === 'object') {
			url = result.url || result.data?.url || result.response?.url || '';
		}
		
		if (url) {
			console.log('上传成功，获得URL:', url);
			// 可以在这里添加额外的成功处理逻辑
		} else {
			console.warn('上传成功但未获得有效URL:', result);
		}
	} catch (error) {
		console.error('处理上传成功事件失败:', error);
		ElMessage.error(t('处理上传结果失败'));
	}
}

// 处理上传错误
function handleUploadError(error: any) {
	try {
		console.error('上传错误:', error);
		ElMessage.error(t('上传失败，请检查网络连接或联系管理员'));
	} catch (e) {
		console.error('处理上传错误事件失败:', e);
	}
}

// 处理上传移除
function handleUploadRemove(index: number) {
	try {
		// 边界检查
		if (index < 0 || index >= batchUpload.imageUrls.length) {
			console.warn('移除预览项索引越界:', index);
			return;
		}
		
		// 从图片URL数组中移除
		if (index < batchUpload.imageUrls.length) {
			batchUpload.imageUrls.splice(index, 1);
		}
		
		// 从预览列表中移除
		batchUpload.previewList.splice(index, 1);
		
		// 手动调用cl-upload组件的remove方法（如果组件存在且有remove方法）
		if (batchUploadRef.value && typeof batchUploadRef.value.remove === 'function') {
			try {
				batchUploadRef.value.remove(index);
			} catch (error) {
				console.warn('调用cl-upload组件remove方法失败:', error);
				// 不抛出错误，因为主要的移除操作已经完成
			}
		}
		
		ElMessage.success(t('已移除图片'));
	} catch (error) {
		console.error('移除预览项失败:', error);
		ElMessage.error(t('移除图片失败，请重试'));
	}
}

// 更新预览列表
function updatePreviewList(urls: string[]) {
	try {
		// 参数验证
		if (!Array.isArray(urls)) {
			console.warn('updatePreviewList 接收到非数组参数:', urls);
			urls = [];
		}
		
		// 保留现有的用户输入数据
		const existingData = new Map();
		if (Array.isArray(batchUpload.previewList)) {
			batchUpload.previewList.forEach((item, index) => {
				if (item && item.pic) {
					existingData.set(item.pic, {
						name: item.name || '',
						categoryId: item.categoryId || null,
						status: item.status !== undefined ? item.status : 1,
						orderNum: item.orderNum || ((index + 1) * 10),
						description: item.description || '',
					});
				}
			});
		}

		// 根据新的URL列表重新生成预览列表
		batchUpload.previewList = urls.map((url, index) => {
			try {
				// 验证URL
				if (!url || typeof url !== 'string') {
					console.warn('无效的图片URL:', url);
					return null;
				}
				
				const existing = existingData.get(url);
				const fileName = getFileNameFromUrl(url);
				
				return {
					pic: url,
					name: existing?.name || fileName || `商品${index + 1}`,
					categoryId: existing?.categoryId || null,
					status: existing?.status !== undefined ? existing.status : 1,
					orderNum: existing?.orderNum || ((index + 1) * 10),
					description: existing?.description || "",
				};
			} catch (error) {
				console.error('处理预览项失败:', error, url);
				return null;
			}
		}).filter(item => item !== null); // 过滤掉无效项
		
		console.log('预览列表已更新，项目数量:', batchUpload.previewList.length);
	} catch (error) {
		console.error('更新预览列表失败:', error);
		ElMessage.error(t('更新预览列表失败，请重试'));
		
		// 确保预览列表至少是一个空数组
		if (!Array.isArray(batchUpload.previewList)) {
			batchUpload.previewList = [];
		}
	}
}

// 从URL中提取文件名（去除扩展名）
function getFileNameFromUrl(url: string): string {
	try {
		// 参数验证
		if (!url || typeof url !== 'string') {
			console.warn('getFileNameFromUrl 接收到无效URL:', url);
			return '未命名商品';
		}
		
		// 移除查询参数和锚点
		const cleanUrl = url.split('?')[0].split('#')[0];
		
		// 提取文件名
		const fileName = cleanUrl.split('/').pop() || '';
		
		if (!fileName) {
			console.warn('无法从URL提取文件名:', url);
			return '未命名商品';
		}
		
		// 移除扩展名和时间戳前缀
		let cleanName = fileName.replace(/\.[^/.]+$/, ''); // 移除扩展名
		cleanName = cleanName.replace(/^\d+_/, ''); // 移除时间戳前缀
		cleanName = cleanName.replace(/^[a-f0-9]{32}_?/i, ''); // 移除MD5哈希前缀
		
		// 如果清理后的名称为空，使用默认名称
		if (!cleanName || cleanName.length < 2) {
			return '未命名商品';
		}
		
		// 限制名称长度
		if (cleanName.length > 50) {
			cleanName = cleanName.substring(0, 50) + '...';
		}
		
		return cleanName;
	} catch (error) {
		console.error('提取文件名失败:', error, url);
		return '未命名商品';
	}
}

// 移除预览项（从预览列表中手动删除）
function removePreviewItem(index: number) {
	try {
		// 边界检查
		if (index < 0 || index >= batchUpload.previewList.length) {
			console.warn('移除预览项索引越界:', index);
			return;
		}
		
		// 获取要删除的图片URL
		const itemToRemove = batchUpload.previewList[index];
		if (!itemToRemove || !itemToRemove.pic) {
			console.warn('要删除的预览项无效:', itemToRemove);
			return;
		}
		
		// 从图片URL数组中找到对应的索引并移除
		const urlIndex = batchUpload.imageUrls.findIndex(url => url === itemToRemove.pic);
		if (urlIndex !== -1) {
			batchUpload.imageUrls.splice(urlIndex, 1);
		}
		
		// 从预览列表中移除
		batchUpload.previewList.splice(index, 1);
		
		// 通知cl-upload组件更新（如果组件支持）
		if (batchUploadRef.value && typeof batchUploadRef.value.removeByUrl === 'function') {
			try {
				batchUploadRef.value.removeByUrl(itemToRemove.pic);
			} catch (error) {
				console.warn('通知cl-upload组件移除失败:', error);
			}
		}
		
		ElMessage.success(t('已移除图片'));
		console.log('成功移除预览项，剩余数量:', batchUpload.previewList.length);
	} catch (error) {
		console.error('移除预览项失败:', error);
		ElMessage.error(t('移除图片失败，请重试'));
	}
}

// 应用批量设置
function applyBatchSettings() {
	const settings = batchUpload.batchSettings;
	
	// 确认对话框
	ElMessageBox.confirm(
		t("确定要将批量设置应用到所有商品吗？这将覆盖当前的个别设置。"),
		t("批量设置确认"),
		{
			confirmButtonText: t("确定"),
			cancelButtonText: t("取消"),
			type: "warning",
		}
	).then(() => {
		// 应用设置到所有预览项
		batchUpload.previewList.forEach((item, index) => {
			// 如果设置了分类，则应用
			if (settings.categoryId) {
				item.categoryId = settings.categoryId;
			}
			
			// 应用状态设置
			if (settings.status !== null && settings.status !== undefined) {
				item.status = settings.status;
			}
			
			// 应用排序设置（起始排序 + 索引 * 间隔）
			if (settings.startOrderNum !== null && settings.startOrderNum !== undefined) {
				item.orderNum = settings.startOrderNum + (index * settings.orderStep);
			}
			
			// 如果设置了统一描述，则应用
			if (settings.description) {
				item.description = settings.description;
			}
		});
		
		ElMessage.success(t("批量设置已应用到所有商品"));
	}).catch(() => {
		// 用户取消操作
	});
}

// 重置批量设置
function resetBatchSettings() {
	batchUpload.batchSettings = {
		categoryId: null,
		status: 1,
		startOrderNum: 10,
		orderStep: 10,
		description: "",
	};
	ElMessage.success(t("批量设置已重置"));
}

// 提交批量上传
async function submitBatchUpload() {
	try {
		// 基础验证
		if (!Array.isArray(batchUpload.previewList) || batchUpload.previewList.length === 0) {
			ElMessage.error(t("请先上传图片"));
			return;
		}
		
		// 验证必填字段
		const invalidItems = batchUpload.previewList.filter(
			(item) => !item || !item.name || !item.categoryId || !item.pic
		);
		
		if (invalidItems.length > 0) {
			ElMessage.error(t(`请填写所有商品的名称和分类，还有 ${invalidItems.length} 个商品信息不完整`));
			return;
		}

		// 设置加载状态
		batchUpload.loading = true;
		
		console.log('开始批量创建商品，数量:', batchUpload.previewList.length);
		
		// 批量创建商品（图片已经上传完成）
		const createPromises = batchUpload.previewList.map((item, index) => {
			return service.shop.goods.add({
				name: item.name,
				categoryId: item.categoryId,
				pic: item.pic,
				status: item.status,
				orderNum: item.orderNum,
				description: item.description,
			}).catch(error => {
				console.error(`创建第 ${index + 1} 个商品失败:`, error);
				return { error: true, index, item, message: error.message || '创建失败' };
			});
		});
		
		const results = await Promise.all(createPromises);
		
		// 统计成功和失败的数量
		const successCount = results.filter(result => !result.error).length;
		const failedCount = results.filter(result => result.error).length;
		
		if (failedCount === 0) {
			ElMessage.success(t(`成功创建 ${successCount} 个商品`));
		} else if (successCount === 0) {
			ElMessage.error(t(`所有商品创建失败，请检查网络连接或联系管理员`));
			console.error('批量创建失败的商品:', results.filter(r => r.error));
			return; // 不关闭对话框，让用户可以重试
		} else {
			ElMessage.warning(t(`成功创建 ${successCount} 个商品，${failedCount} 个失败`));
			console.error('部分商品创建失败:', results.filter(r => r.error));
		}
		
		// 关闭对话框并刷新列表
		batchUpload.visible = false;
		
		// 重置批量上传数据
		batchUpload.imageUrls = [];
		batchUpload.previewList = [];
		batchUpload.batchSettings = {
			categoryId: null,
			status: 1,
			startOrderNum: 10,
			orderStep: 10,
			description: "",
		};
		
		// 刷新商品列表
		refresh();
		
		console.log('批量上传完成');
		
	} catch (error) {
		console.error("批量上传失败:", error);
		ElMessage.error(t("批量上传失败，请检查网络连接或联系管理员"));
	} finally {
		batchUpload.loading = false;
	}
}

// 监听图片URL变化
watch(
	() => batchUpload.imageUrls,
	(newUrls) => {
		updatePreviewList(newUrls);
	},
	{ deep: true }
);

// 组件卸载时的清理逻辑
onBeforeUnmount(() => {
	try {
		console.log('开始清理商品管理组件...');
		
		// 清理批量上传相关的引用和数据
		if (batchUploadRef.value) {
			try {
				if (typeof batchUploadRef.value.clear === 'function') {
					batchUploadRef.value.clear();
				}
			} catch (error) {
				console.warn('清理上传组件失败:', error);
			}
		}
		batchUploadRef.value = null;
		
		// 清理CRUD相关引用
		if (Crud.value) {
			Crud.value = null;
		}
		if (Table.value) {
			Table.value = null;
		}
		if (Upsert.value) {
			Upsert.value = null;
		}
		if (Search.value) {
			Search.value = null;
		}
		
		// 清理批量上传数据
		batchUpload.imageUrls = [];
		batchUpload.previewList = [];
		batchUpload.visible = false;
		batchUpload.loading = false;
		batchUpload.batchSettings = {
			categoryId: null,
			status: 1,
			startOrderNum: 10,
			orderStep: 10,
			description: "",
		};
		
		console.log('商品管理组件清理完成');
	} catch (error) {
		console.error('组件清理过程中出现错误:', error);
	}
});
</script>

<style scoped>
.batch-upload-container {
	max-height: 600px;
	overflow-y: auto;
}

.upload-area {
	margin-bottom: 20px;
}

.upload-tip {
	margin-top: 10px;
	color: var(--el-text-color-regular);
	font-size: 14px;
	text-align: center;
}

.batch-settings {
	margin-bottom: 20px;
	padding: 20px;
	background-color: #f8f9fa;
	border-radius: 8px;
	border: 1px solid #e9ecef;
}

.batch-settings h4 {
	margin-bottom: 15px;
	color: #303133;
	font-size: 16px;
}

.batch-form {
	background-color: white;
	padding: 15px;
	border-radius: 6px;
	border: 1px solid #dcdfe6;
}

.goods-preview h4 {
	margin-bottom: 15px;
	color: #303133;
}

.preview-list {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.preview-item {
	display: flex;
	gap: 20px;
	padding: 15px;
	border: 1px solid #ebeef5;
	border-radius: 8px;
	background-color: #fafafa;
}

.preview-image {
	flex-shrink: 0;
	width: 120px;
	height: 120px;
	border-radius: 8px;
	overflow: hidden;
	border: 1px solid #dcdfe6;
	position: relative;
}

.preview-image img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.preview-form {
	flex: 1;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 15px;
}

.preview-form .el-form-item:nth-child(5) {
	grid-column: 1 / -1;
}

.image-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.preview-image:hover .image-overlay {
	opacity: 1;
}

.image-overlay .el-button {
	background-color: rgba(255, 255, 255, 0.9);
	border: none;
	color: #f56c6c;
}

/* cl-upload 组件样式优化 */
:deep(.cl-upload) {
	width: 100%;
}

:deep(.cl-upload__list) {
	justify-content: flex-start;
	gap: 10px;
}

:deep(.cl-upload__item) {
	margin: 0;
}

:deep(.cl-upload__demo) {
	border: 2px dashed var(--el-border-color);
	transition: border-color 0.3s ease;
}

:deep(.cl-upload__demo:hover) {
	border-color: var(--el-color-primary);
}
</style>
