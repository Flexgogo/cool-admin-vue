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

<script lang="tsx" setup>
defineOptions({
	name: "shop-category",
});

import { useCrud, useTable, useUpsert, useSearch } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";
import { reactive } from "vue";
import { Top } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

const { service } = useCool();
const { t } = useI18n();

// 选项
const options = reactive({
	status: [
		{ label: t("下架"), value: 0, type: "danger" },
		{ label: t("上架"), value: 1, type: "success" },
	],
	type: [
		{ label: t("category"), value: 0, type: "danger" },
		{ label: t("collection"), value: 1, type: "success" },
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
					accept: "image/*",
					size: [150, 150],
					limit: 1,
					// 禁用缩略图生成
					generateThumbnail: false
				}
			},
			span: 12,
			required: true,
		},
		{
			label: t("分类名称"),
			prop: "name",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("描述"),
			prop: "description",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
		},
		{
			label: t("状态"),
			prop: "status",
			component: { name: "el-radio-group", options: options.status },
			value: 0,
			required: true,
		},
		{
			label: t("类型"),
			prop: "type",
			component: { name: "el-radio-group", options: options.type },
			value: 0,
			required: true,
		},
		{
			label: t("排序"),
			prop: "orderNum",
			component: { name: "el-input-number", props: { clearable: true, min: 0 } },
			span: 12,
			required: true,
		},
	],

	// 打开表单时的事件处理
	async onOpen() {
		// 只在新增模式下自动设置排序号
		if (Upsert.value?.mode === 'add') {
			try {
				// 获取所有分类数据以找到最大排序号
				const res = await service.shop.category.list();
				
				// 找到最大的排序号
				let maxOrderNum = 0;
				if (res && Array.isArray(res)) {
					maxOrderNum = res.reduce((max, item) => {
						const orderNum = item.orderNum || 0;
						return orderNum > max ? orderNum : max;
					}, 0);
				}
				
				// 设置新的排序号为最大值加1（新增的数据排在最后）
				const newOrderNum = maxOrderNum + 1;
				
				// 设置表单的排序字段值
				if (Upsert.value?.form) {
					Upsert.value.form.orderNum = newOrderNum;
				}
				
				console.log(`自动设置排序号: ${newOrderNum} (当前最大排序号: ${maxOrderNum})`);
			} catch (error) {
				console.error('获取最大排序号失败:', error);
				// 如果获取失败，设置默认值为1
				if (Upsert.value?.form) {
					Upsert.value.form.orderNum = 1;
				}
			}
		}
	}
});

// cl-table
const Table = useTable({
	// 为表格行添加数据属性，用于CSS样式识别置顶分类
	rowProps: ({ row }) => ({
		'data-order-num': row.orderNum
	}),
	columns: [
		{ type: "selection" },
		{ 
			label: t("ID"), 
			prop: "id", 
			minWidth: 80,
			sortable: "custom"
		},
		{ 
			label: t("图片"), 
			prop: "pic", 
			minWidth: 120,
			component: {
				name: "cl-image",
				props: {
					size: 60,
					preview: true
				}
			}
		},
		{ label: t("分类名称"), prop: "name", minWidth: 120 },
		{ label: t("图片数量"), prop: "count", minWidth: 120 },
		{ label: t("描述"), prop: "description", minWidth: 120 },
		{
			label: t("状态"),
			prop: "status",
			minWidth: 120,
			dict: options.status,
		},
		{
			label: t("类型"),
			prop: "type",
			minWidth: 120,
			dict: options.type,
		},
		{ 
			label: t("排序"), 
			prop: "orderNum",
			sortable: "asc", 
			minWidth: 140,
			formatter: (row) => {
				if (row.orderNum === 0) {
					return `🔝 ${row.orderNum} (置顶)`;
				}
				return row.orderNum;
			}
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
		{ 
			type: "op", 
			width: 200,
			buttons: ({ scope }) => [
				{
					label: scope.row.orderNum === 0 ? t("已置顶") : t("置顶"),
					type: scope.row.orderNum === 0 ? "success" : "warning",
					size: "small",
					disabled: scope.row.orderNum === 0,
					onClick: () => setTop(scope.row)
				},
				"edit", 
				"delete"
			] 
		},
	],
});

// cl-search
const Search = useSearch({
	items: [
		{
			label: t("分类ID"),
			prop: "id",
			component: { name: "el-input", props: { clearable: true, placeholder: t("请输入分类ID") } },
		},
		{
			label: t("分类名称"),
			prop: "name",
			component: { name: "el-input", props: { clearable: true, placeholder: t("请输入分类名称") } },
		},
		{
			label: t("状态"),
			prop: "status",
			component: { name: "el-select", options: options.status, props: { clearable: true, placeholder: t("请选择状态") } },
		},
		{
			label: t("类型"),
			prop: "type",
			component: { name: "el-select", options: options.type, props: { clearable: true, placeholder: t("请选择类型") } },
		}
	],
});

// cl-crud
const Crud = useCrud(
	{
		service: service.shop.category,
	},
	(app) => {
		app.refresh();
	},
);

// 刷新
function refresh(params?: any) {
	Crud.value?.refresh(params);
}

// 置顶功能
async function setTop(row: any) {
	try {
		// 参数验证
		if (!row || !row.id) {
			ElMessage.error(t('分类信息不完整，无法置顶'));
			return;
		}
		
		// 如果当前分类已经是排序值为0，提示用户
		if (row.orderNum === 0) {
			ElMessage.info(t('该分类已经是置顶状态'));
			return;
		}
		
		// 确认对话框
		const confirmResult = await ElMessageBox.confirm(
			t('确定要将此分类置顶吗？') + '\n\n' +
			t('置顶后的变化：') + '\n' +
			t('• 该分类排序值将变为 0，显示在列表最前面') + '\n' +
			t('• 排序值小于等于当前分类的其他分类排序值将自动 +1') + '\n' +
			t('• 此操作不可撤销，但可以通过编辑重新调整排序'),
			t('置顶确认'),
			{
				confirmButtonText: t('确定置顶'),
				cancelButtonText: t('取消'),
				type: 'warning',
				dangerouslyUseHTMLString: false,
				customClass: 'move-to-top-confirm'
			}
		).catch(() => false);
		
		if (!confirmResult) {
			return;
		}
		
		console.log('开始执行置顶操作，分类ID:', row.id);

		// 显示加载提示
		const loading = ElMessage({
			message: t("正在置顶分类..."),
			type: "info",
			duration: 0,
			showClose: false
		});

		try {
			// 获取所有分类数据
			const res = await service.shop.category.list();
			
			if (res && Array.isArray(res)) {
				// 筛选出需要调整排序的分类（排序值小于等于当前分类的其他分类）
				const categoriesToUpdate = res.filter(item => 
					item.id !== row.id && item.orderNum <= row.orderNum
				);
				
				console.log('需要调整排序的分类数量:', categoriesToUpdate.length);
				
				// 批量更新这些分类的排序值（每个+1）
				const updatePromises = categoriesToUpdate.map(item => 
					service.shop.category.update({
						id: item.id,
						orderNum: item.orderNum + 1
					}).catch(error => {
						console.error(`更新分类 ${item.id} 排序失败:`, error);
						return { error: true, id: item.id };
					})
				);
				
				// 将当前分类的排序值设为0
				updatePromises.push(
					service.shop.category.update({
						id: row.id,
						orderNum: 0
					}).catch(error => {
						console.error(`置顶分类 ${row.id} 失败:`, error);
						throw error;
					})
				);
				
				// 等待所有更新操作完成
				const results = await Promise.all(updatePromises);
				
				// 检查是否有失败的操作
				const failedUpdates = results.filter(result => result && result.error);
				
				if (failedUpdates.length > 0) {
					console.warn('部分分类排序更新失败:', failedUpdates);
					ElMessage.warning(t(`置顶成功，但有 ${failedUpdates.length} 个分类排序调整失败`));
				} else {
					ElMessage.success(t(`分类"${row.name}"已成功置顶！`));
				}
				
				console.log(`置顶成功: ID ${row.id} 的排序号已设置为 0，其他数据排序号已加1`);
			}
		} catch (error) {
			console.error('置顶操作失败:', error);
			ElMessage.error(t('置顶失败，请检查网络连接或联系管理员'));
		} finally {
			// 关闭加载提示
			loading.close();
		}
		
		// 刷新表格数据
		refresh();
		
		console.log('置顶操作完成');
		
	} catch (error) {
		if (error === 'cancel') {
			// 用户取消操作
			return;
		}
		
		console.error('置顶操作异常:', error);
		ElMessage.error(t("置顶操作异常，请重试"));
	}
}
</script>

<style scoped>
/* 置顶按钮样式优化 */
:deep(.el-table .el-button--warning.is-disabled) {
	background-color: #f0f9ff;
	border-color: #bfdbfe;
	color: #1e40af;
}

:deep(.el-table .el-button--success.is-disabled) {
	background-color: #f0fdf4;
	border-color: #bbf7d0;
	color: #15803d;
	cursor: not-allowed;
}

/* 置顶分类行高亮 */
:deep(.el-table__row[data-order-num="0"]) {
	background-color: #fffbeb;
}

:deep(.el-table__row[data-order-num="0"]:hover) {
	background-color: #fef3c7;
}

/* 置顶确认对话框样式 */
:deep(.move-to-top-confirm) {
	.el-message-box__message {
		white-space: pre-line;
		line-height: 1.6;
		font-size: 14px;
	}
	
	.el-message-box__btns {
		padding-top: 20px;
	}
	
	.el-button--primary {
		background-color: #e6a23c;
		border-color: #e6a23c;
	}
	
	.el-button--primary:hover {
		background-color: #eebe77;
		border-color: #eebe77;
	}
}
</style>
