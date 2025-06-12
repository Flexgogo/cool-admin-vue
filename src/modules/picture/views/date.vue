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
									<el-form-item :label="t('状态')">
										<el-radio-group v-model="batchUpload.batchSettings.status">
											<el-radio :label="0">{{ t("禁用") }}</el-radio>
											<el-radio :label="1">{{ t("启用") }}</el-radio>
										</el-radio-group>
									</el-form-item>
								</el-col>
								<el-col :span="12">
									<el-form-item :label="t('起始日期')">
										<el-date-picker
											v-model="batchUpload.batchSettings.startDate"
											type="date"
											format="YYYY-MM-DD"
											value-format="YYYY-MM-DD"
											:placeholder="t('请选择起始日期')"
										/>
									</el-form-item>
								</el-col>
								<el-col :span="12">
									<el-form-item :label="t('日期间隔')">
										<el-input-number
											v-model="batchUpload.batchSettings.dateStep"
											:min="1"
											:placeholder="t('日期递增间隔（天）')"
										/>
									</el-form-item>
								</el-col>
								<el-col :span="24">
									<el-form-item :label="t('统一备注')">
										<el-input
											v-model="batchUpload.batchSettings.remark"
											type="textarea"
											:rows="2"
											:placeholder="t('为所有图片设置统一备注')"
										/>
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="24">
									<el-button type="primary" @click="applyBatchSettings">
										{{ t("应用到所有图片") }}
									</el-button>
									<el-button @click="resetBatchSettings">
										{{ t("重置设置") }}
									</el-button>
								</el-col>
							</el-row>
						</el-form>
					</div>
				</div>

				<div v-if="batchUpload.imageUrls.length > 0" class="pictures-preview">
					<h4>{{ t("图片预览") }}</h4>
					<div class="preview-list">
						<div
							v-for="(item, index) in batchUpload.previewList"
							:key="index"
							class="preview-item"
						>
							<div class="preview-image">
								<cl-image :src="item.picture" :size="120" />
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
									<el-form-item :label="t('名称')" required>
										<el-input
											v-model="item.name"
											:placeholder="t('请输入图片名称')"
											clearable
										/>
									</el-form-item>
									<el-form-item :label="t('日期')" required>
										<el-date-picker
											v-model="item.date"
											type="date"
											format="YYYY-MM-DD"
											value-format="YYYY-MM-DD"
											:placeholder="t('请选择日期')"
											@change="validatePreviewDate(item, index)"
											:class="{ 'date-error': item.dateError }"
										/>
										<div v-if="item.dateError" class="date-error-message">
											{{ item.dateErrorMessage }}
										</div>
									</el-form-item>
									<el-form-item :label="t('状态')">
										<el-radio-group v-model="item.status">
											<el-radio :label="0">{{ t("禁用") }}</el-radio>
											<el-radio :label="1">{{ t("启用") }}</el-radio>
										</el-radio-group>
									</el-form-item>
									<el-form-item :label="t('备注')">
										<el-input
											v-model="item.remark"
											type="textarea"
											:rows="2"
											:placeholder="t('请输入备注')"
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
	name: "picture-date",
});

import { useCrud, useTable, useUpsert, useSearch } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";
import { reactive, ref, watch, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Upload, Delete } from "@element-plus/icons-vue";

const { service } = useCool();
const { t } = useI18n();

// 批量上传引用
const batchUploadRef = ref();

// 批量上传状态
const batchUpload = reactive({
	visible: false,
	loading: false,
	imageUrls: [] as string[], // 存储上传成功的图片URL
	previewList: [] as any[], // 图片预览列表
	batchSettings: {
		status: 1,
		startDate: "",
		dateStep: 1,
		remark: "",
	},
});

// 选项
const options = reactive({
	status: [
		{ label: t("禁用"), value: 0, type: "danger" },
		{ label: t("启用"), value: 1, type: "success" },
	],
});

// 检查日期是否已存在的函数
async function checkDateExists(date: string, excludeId?: number): Promise<boolean> {
	try {
		if (!date) return false;
		
		console.log('检查日期是否存在:', { date, excludeId, mode: excludeId ? '编辑模式' : '新增模式' });
		
		// 调用后端接口检查日期是否已存在
		const result = await service.picture.date.page({
			page: 1,
			size: 1,
			date: date
		});
		
		// 如果是编辑模式，排除当前记录
		if (excludeId && result.list && result.list.length > 0) {
			const exists = result.list.some((item: any) => item.id !== excludeId);
			console.log('编辑模式检查结果:', { exists, totalFound: result.list.length });
			return exists;
		}
		
		// 新增模式：任何存在的记录都算冲突
		const exists = result.list && result.list.length > 0;
		console.log('新增模式检查结果:', { exists, totalFound: result.list?.length || 0 });
		return exists;
	} catch (error) {
		console.error('检查日期是否存在失败:', error);
		return false;
	}
}

// 判断当前是否为新增模式
function isAddMode(): boolean {
	return !Upsert.value?.form?.id;
}

// 验证预览列表中的日期
async function validatePreviewDate(item: any, currentIndex: number) {
	try {
		// 清除之前的错误状态
		item.dateError = false;
		item.dateErrorMessage = '';
		
		if (!item.date) {
			return;
		}
		
		// 检查在当前预览列表中是否有重复日期
		const duplicateIndex = batchUpload.previewList.findIndex((previewItem, index) => 
			index !== currentIndex && previewItem.date === item.date
		);
		
		if (duplicateIndex !== -1) {
			item.dateError = true;
			item.dateErrorMessage = t('该日期在当前批次中重复');
			return;
		}
		
		// 检查数据库中是否已存在该日期
		const exists = await checkDateExists(item.date);
		if (exists) {
			item.dateError = true;
			item.dateErrorMessage = t('该日期已存在于数据库中');
			return;
		}
		
		// 如果没有错误，确保错误状态被清除
		item.dateError = false;
		item.dateErrorMessage = '';
		
	} catch (error) {
		console.error('验证预览日期失败:', error);
		item.dateError = true;
		item.dateErrorMessage = t('验证日期失败，请重试');
	}
}

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			label: t("日期"),
			prop: "date",
			component: { 
				name: "el-date-picker", 
				props: { 
					clearable: true,
					type: "date",
					format: "YYYY-MM-DD",
					valueFormat: "YYYY-MM-DD",
					placeholder: "请选择日期",
					// 添加实时验证
					onChange: async (value: string) => {
						if (value && Upsert.value?.form) {
							try {
								console.log('日期选择变化，开始验证:', value);
								
								// 获取当前记录ID（编辑模式下）
								const currentId = Upsert.value.form.id;
								const exists = await checkDateExists(value, currentId);
								
								if (exists) {
									// 显示警告但不阻止用户继续操作
									ElMessage.warning(t('该日期已存在，请选择其他日期'));
								}
							} catch (error) {
								console.error('实时验证日期失败:', error);
							}
						}
					}
				} 
			},
			span: 12,
			required: true,
			// 添加自定义验证规则
			rules: [
				{
					required: true,
					message: t('请选择日期')
				},
				{
					validator: async (rule: any, value: string, callback: Function) => {
						if (!value) {
							callback();
							return;
						}
						
						try {
							// 获取当前编辑的记录ID（如果是编辑模式）
							const currentId = Upsert.value?.form?.id;
							const mode = currentId ? '编辑' : '新增';
							
							console.log(`${mode}模式日期验证:`, { value, currentId });
							
							const exists = await checkDateExists(value, currentId);
							
							if (exists) {
								const message = currentId 
									? t('该日期已被其他记录使用，请选择其他日期')
									: t('该日期已存在，请选择其他日期');
								console.log(`${mode}模式验证失败:`, message);
								callback(new Error(message));
							} else {
								console.log(`${mode}模式验证通过`);
								callback();
							}
						} catch (error) {
							console.error('验证日期唯一性失败:', error);
							callback(new Error(t('验证日期失败，请重试')));
						}
					},
					trigger: 'blur'
				}
			]
		},
		{
			label: t("图片"),
			prop: "picture",
			component: { 
				name: "cl-upload",
				props: {
					// 只接受图片文件
					accept: "image/*",
					// 上传成功后的回调
					onSuccess:  (result: any) => {
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
							
							// 当图片上传成功后，自动设置名称
							if (url && Upsert.value?.form) {
								const fileName = getFileNameFromUrl(url);
								// 只有当名称字段为空时才自动设置，避免覆盖用户已输入的内容
								if (!Upsert.value.form.name) {
									Upsert.value.form.name = fileName;
									console.log('自动设置图片名称:', fileName);
								}
							}
							
							return url;
						} catch (error) {
							console.error('处理上传成功事件失败:', error);
							ElMessage.error(t('处理上传结果失败'));
							return '';
						}
					}
				}
			},
			span: 12,
			required: true,
		},
		{
			label: t("名称"),
			prop: "name",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("状态"),
			prop: "status",
			component: { name: "el-radio-group", options: options.status },
			value: 1,
			required: true,
		},
		{
			label: t("备注"),
			prop: "remark",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
	],
	
	// 添加提交前的最终验证
	onSubmit: async (data, { next, done, close }) => {
		try {
			// 在提交前再次验证日期唯一性
			if (data.date) {
				const currentId = Upsert.value?.form?.id;
				const mode = currentId ? '编辑' : '新增';
				
				console.log(`${mode}模式提交前最终验证:`, { date: data.date, currentId });
				
				const exists = await checkDateExists(data.date, currentId);
				
				if (exists) {
					const message = currentId 
						? t('该日期已被其他记录使用，无法保存')
						: t('该日期已存在，无法新增');
					
					console.log(`${mode}模式提交验证失败:`, message);
					ElMessage.error(message);
					done(); // 关闭加载状态但不关闭窗口
					return;
				}
				
				console.log(`${mode}模式提交验证通过，继续保存`);
			}
			
			// 验证通过，继续提交
			next(data);
			
		} catch (error) {
			console.error('提交前验证失败:', error);
			ElMessage.error(t('验证失败，请重试'));
			done(); // 关闭加载状态但不关闭窗口
		}
	}
});

// cl-table
const Table = useTable({
	columns: [
		{ type: "selection" },
		{ label: t("日期"), prop: "date", minWidth: 120,sortable: "asc", component: { name: "cl-date-text", props: { format: "YYYY-MM-DD" } } },
		{ label: t("图片"), prop: "picture", minWidth: 120, component: { name: "cl-image", props: { size: 60, preview: true } } },
		{
			label: t("状态"),
			prop: "status",
			minWidth: 120,
			dict: options.status,
		},
		{ label: t("名字"), prop: "name", minWidth: 120 },
		{ label: t("备注"), prop: "remark", minWidth: 120 },
		{
			label: t("创建时间"),
			prop: "createTime",
			minWidth: 170,
			sortable: "desc",
			component: { name: "cl-date-text", props: { format: "YYYY-MM-DD" } },
		},
		{
			label: t("更新时间"),
			prop: "updateTime",
			minWidth: 170,
			sortable: "custom",
			component: { name: "cl-date-text", props: { format: "YYYY-MM-DD" } },
		},
		{ type: "op", buttons: ["edit", "delete"] },
	],
});

// cl-search
const Search = useSearch();

// cl-crud
const Crud = useCrud(
	{
		service: service.picture.date,
		
		// 监听删除事件，删除后刷新数据确保日期验证准确性
		onDelete: (selection, { next }) => {
			console.log('删除记录，将刷新数据以确保日期验证准确性');
			next(selection);
		}
	},
	(app) => {
		app.refresh();
	},
);

// 刷新
function refresh(params?: any) {
	Crud.value?.refresh(params);
}

// 从URL中提取文件名（去除扩展名）
function getFileNameFromUrl(url: string): string {
	try {
		// 参数验证
		if (!url || typeof url !== 'string') {
			console.warn('getFileNameFromUrl 接收到无效URL:', url);
			return '未命名图片';
		}
		
		// 移除查询参数和锚点
		const cleanUrl = url.split('?')[0].split('#')[0];
		
		// 提取文件名
		const fileName = cleanUrl.split('/').pop() || '';
		
		if (!fileName) {
			console.warn('无法从URL提取文件名:', url);
			return '未命名图片';
		}
		
		// 移除扩展名和时间戳前缀
		let cleanName = fileName.replace(/\.[^/.]+$/, ''); // 移除扩展名
		cleanName = cleanName.replace(/^\d+_/, ''); // 移除时间戳前缀
		cleanName = cleanName.replace(/^[a-f0-9]{32}_?/i, ''); // 移除MD5哈希前缀
		
		// 如果清理后的名称为空，使用默认名称
		if (!cleanName || cleanName.length < 2) {
			return '未命名图片';
		}
		
		// 限制名称长度
		if (cleanName.length > 50) {
			cleanName = cleanName.substring(0, 50) + '...';
		}
		
		return cleanName;
	} catch (error) {
		console.error('提取文件名失败:', error, url);
		return '未命名图片';
	}
}

// 打开批量上传对话框
async function openBatchUpload() {
	try {
		batchUpload.visible = true;
		batchUpload.imageUrls = [];
		batchUpload.previewList = [];
		batchUpload.loading = false;
		
		// 重置批量设置
		batchUpload.batchSettings = {
			status: 1,
			startDate: "",
			dateStep: 1,
			remark: "",
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
async function handleUploadChange(urls: string[]) {
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
		await updatePreviewList(urls);
		
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
async function updatePreviewList(urls: string[]) {
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
				if (item && item.picture) {
					existingData.set(item.picture, {
						name: item.name || '',
						date: item.date || '',
						status: item.status !== undefined ? item.status : 1,
						remark: item.remark || '',
					});
				}
			});
		}

		// 根据新的URL列表重新生成预览列表
		const newPreviewList = [];
		
		for (let index = 0; index < urls.length; index++) {
			const url = urls[index];
			
			try {
				// 验证URL
				if (!url || typeof url !== 'string') {
					console.warn('无效的图片URL:', url);
					continue;
				}
				
				const existing = existingData.get(url);
				const fileName = getFileNameFromUrl(url);
				
				// 创建预览项
				const previewItem = {
					picture: url,
					name: existing?.name || fileName || `图片${index + 1}`,
					date: existing?.date || batchUpload.batchSettings.startDate || '',
					status: existing?.status !== undefined ? existing.status : 1,
					remark: existing?.remark || "",
					dateError: false, // 初始化日期错误状态
					dateErrorMessage: '', // 初始化错误消息
				};
				
				// 如果设置了起始日期，自动计算日期
				if (batchUpload.batchSettings.startDate && !existing?.date) {
					const startDate = new Date(batchUpload.batchSettings.startDate);
					const targetDate = new Date(startDate);
					targetDate.setDate(startDate.getDate() + (index * batchUpload.batchSettings.dateStep));
					previewItem.date = targetDate.toISOString().split('T')[0];
				}
				
				newPreviewList.push(previewItem);
			} catch (error) {
				console.error('处理预览项失败:', error, url);
			}
		}
		
		batchUpload.previewList = newPreviewList;
		
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
		if (!itemToRemove || !itemToRemove.picture) {
			console.warn('要删除的预览项无效:', itemToRemove);
			return;
		}
		
		// 从图片URL数组中找到对应的索引并移除
		const urlIndex = batchUpload.imageUrls.findIndex(url => url === itemToRemove.picture);
		if (urlIndex !== -1) {
			batchUpload.imageUrls.splice(urlIndex, 1);
		}
		
		// 从预览列表中移除
		batchUpload.previewList.splice(index, 1);
		
		// 通知cl-upload组件更新（如果组件支持）
		if (batchUploadRef.value && typeof batchUploadRef.value.removeByUrl === 'function') {
			try {
				batchUploadRef.value.removeByUrl(itemToRemove.picture);
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
async function applyBatchSettings() {
	const settings = batchUpload.batchSettings;
	
	try {
		// 如果设置了起始日期，先检查生成的日期是否会有冲突
		if (settings.startDate) {
			const generatedDates = [];
			for (let index = 0; index < batchUpload.previewList.length; index++) {
				const startDate = new Date(settings.startDate);
				const targetDate = new Date(startDate);
				targetDate.setDate(startDate.getDate() + (index * settings.dateStep));
				const dateStr = targetDate.toISOString().split('T')[0];
				generatedDates.push(dateStr);
			}
			
			// 检查生成的日期中是否有重复
			const duplicates = generatedDates.filter((date, index) => generatedDates.indexOf(date) !== index);
			if (duplicates.length > 0) {
				const uniqueDuplicates = [...new Set(duplicates)];
				ElMessage.error(t(`批量设置会产生重复日期: ${uniqueDuplicates.join(', ')}，请调整起始日期或日期间隔`));
				return;
			}
			
			// 检查数据库中是否已存在这些日期
			const existingDatesCheck = await Promise.all(
				generatedDates.map(async (date) => {
					const exists = await checkDateExists(date);
					return { date, exists };
				})
			);
			
			const existingDates = existingDatesCheck.filter(item => item.exists);
			if (existingDates.length > 0) {
				const existingDatesList = existingDates.map(item => item.date).join(', ');
				ElMessage.error(t(`以下日期已存在于数据库中: ${existingDatesList}，请调整起始日期或日期间隔`));
				return;
			}
		}
		
		// 确认对话框
		ElMessageBox.confirm(
			t("确定要将批量设置应用到所有图片吗？这将覆盖当前的个别设置。"),
			t("批量设置确认"),
			{
				confirmButtonText: t("确定"),
				cancelButtonText: t("取消"),
				type: "warning",
			}
		).then(() => {
			// 应用设置到所有预览项
			batchUpload.previewList.forEach((item, index) => {
				// 应用状态设置
				if (settings.status !== null && settings.status !== undefined) {
					item.status = settings.status;
				}
				
				// 应用日期设置（起始日期 + 索引 * 间隔）
				if (settings.startDate) {
					const startDate = new Date(settings.startDate);
					const targetDate = new Date(startDate);
					targetDate.setDate(startDate.getDate() + (index * settings.dateStep));
					item.date = targetDate.toISOString().split('T')[0];
				}
				
				// 如果设置了统一备注，则应用
				if (settings.remark) {
					item.remark = settings.remark;
				}
			});
			
			// 重新验证所有日期
			setTimeout(async () => {
				for (let i = 0; i < batchUpload.previewList.length; i++) {
					await validatePreviewDate(batchUpload.previewList[i], i);
				}
			}, 100);
			
			ElMessage.success(t("批量设置已应用到所有图片"));
		}).catch(() => {
			// 用户取消操作
		});
	} catch (error) {
		console.error('应用批量设置失败:', error);
		ElMessage.error(t('应用批量设置失败，请重试'));
	}
}

// 重置批量设置
function resetBatchSettings() {
	batchUpload.batchSettings = {
		status: 1,
		startDate: "",
		dateStep: 1,
		remark: "",
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
			(item) => !item || !item.name || !item.date || !item.picture
		);
		
		if (invalidItems.length > 0) {
			ElMessage.error(t(`请填写所有图片的名称和日期，还有 ${invalidItems.length} 个图片信息不完整`));
			return;
		}

		// 检查是否有日期验证错误
		const dateErrorItems = batchUpload.previewList.filter(item => item.dateError);
		if (dateErrorItems.length > 0) {
			ElMessage.error(t(`存在日期错误，请修正后重试。共 ${dateErrorItems.length} 个图片的日期有问题`));
			return;
		}

		// 检查批量上传中是否有重复日期
		const dates = batchUpload.previewList.map(item => item.date);
		const duplicateDates = dates.filter((date, index) => dates.indexOf(date) !== index);
		if (duplicateDates.length > 0) {
			const uniqueDuplicates = [...new Set(duplicateDates)];
			ElMessage.error(t(`批量上传中存在重复日期: ${uniqueDuplicates.join(', ')}，请修改后重试`));
			return;
		}

		// 检查数据库中是否已存在相同日期的记录
		const existingDatesCheck = await Promise.all(
			dates.map(async (date, index) => {
				const exists = await checkDateExists(date);
				return { date, index, exists };
			})
		);

		const existingDates = existingDatesCheck.filter(item => item.exists);
		if (existingDates.length > 0) {
			const existingDatesList = existingDates.map(item => item.date).join(', ');
			ElMessage.error(t(`以下日期已存在于数据库中: ${existingDatesList}，请修改后重试`));
			return;
		}

		// 设置加载状态
		batchUpload.loading = true;
		
		console.log('开始批量创建图片记录，数量:', batchUpload.previewList.length);
		
		// 批量创建图片记录（图片已经上传完成）
		const createPromises = batchUpload.previewList.map((item, index) => {
			return service.picture.date.add({
				name: item.name,
				date: item.date,
				picture: item.picture,
				status: item.status,
				remark: item.remark,
			}).catch(error => {
				console.error(`创建第 ${index + 1} 个图片记录失败:`, error);
				return { error: true, index, item, message: error.message || '创建失败' };
			});
		});
		
		const results = await Promise.all(createPromises);
		
		// 统计成功和失败的数量
		const successCount = results.filter(result => !result.error).length;
		const failedCount = results.filter(result => result.error).length;
		
		if (failedCount === 0) {
			ElMessage.success(t(`成功创建 ${successCount} 个图片记录`));
		} else if (successCount === 0) {
			ElMessage.error(t(`所有图片记录创建失败，请检查网络连接或联系管理员`));
			console.error('批量创建失败的图片记录:', results.filter(r => r.error));
			return; // 不关闭对话框，让用户可以重试
		} else {
			ElMessage.warning(t(`成功创建 ${successCount} 个图片记录，${failedCount} 个失败`));
			console.error('部分图片记录创建失败:', results.filter(r => r.error));
		}
		
		// 关闭对话框并刷新列表
		batchUpload.visible = false;
		
		// 重置批量上传数据
		batchUpload.imageUrls = [];
		batchUpload.previewList = [];
		batchUpload.batchSettings = {
			status: 1,
			startDate: "",
			dateStep: 1,
			remark: "",
		};
		
		// 刷新图片列表
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
	async (newUrls) => {
		await updatePreviewList(newUrls);
	},
	{ deep: true }
);

// 组件卸载时的清理逻辑
onBeforeUnmount(() => {
	try {
		console.log('开始清理图片管理组件...');
		
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
			status: 1,
			startDate: "",
			dateStep: 1,
			remark: "",
		};
		
		console.log('图片管理组件清理完成');
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

.pictures-preview h4 {
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

.preview-form .el-form-item:nth-child(4) {
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

/* 日期验证错误样式 */
.date-error :deep(.el-input__wrapper) {
	border-color: var(--el-color-danger) !important;
	box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
}

.date-error-message {
	color: var(--el-color-danger);
	font-size: 12px;
	margin-top: 4px;
	line-height: 1.2;
}
</style>
