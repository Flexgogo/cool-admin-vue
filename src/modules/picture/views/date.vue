<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<!-- 新增按钮 -->
			<cl-add-btn />
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
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: "picture-date",
});

import { useCrud, useTable, useUpsert, useSearch } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";
import { reactive } from "vue";

const { service } = useCool();
const { t } = useI18n();

// 选项
const options = reactive({
	status: [
		{ label: t("禁用"), value: 0, type: "danger" },
		{ label: t("启用"), value: 1, type: "success" },
	],
});

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
					placeholder: "请选择日期"
				} 
			},
			span: 12,
			required: true,
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
});

// cl-table
const Table = useTable({
	columns: [
		{ type: "selection" },
		{ label: t("日期"), prop: "date", minWidth: 120, component: { name: "cl-date-text", props: { format: "YYYY-MM-DD" } } },
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
</script>
