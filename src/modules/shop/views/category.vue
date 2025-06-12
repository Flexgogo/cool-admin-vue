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
			minWidth: 200,
			formatter(row) {
				const isTop = row.orderNum === 0;
				return (
					<div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
						<div style="display: flex; align-items: center; gap: 6px;">
							{isTop && (
								<el-tag type="danger" size="small" effect="dark">
									<el-icon style="margin-right: 2px;"><Top /></el-icon>
									置顶
								</el-tag>
							)}
							<el-tag 
								type={isTop ? "danger" : "info"} 
								size="small"
								effect={isTop ? "light" : "plain"}
							>
								{row.orderNum}
							</el-tag>
						</div>
						{!isTop && (
							<el-button 
								type="primary" 
								size="small" 
								plain
								onClick={() => setTop(row)}
								style="padding: 4px 8px; font-size: 12px; margin-left: 8px;"
								title="点击置顶"
							>
								<el-icon style="margin-right: 2px;"><Top /></el-icon>
								置顶
							</el-button>
						)}
					</div>
				);
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
		{ type: "op", buttons: ["edit", "delete"] },
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
		// 确认对话框
		await ElMessageBox.confirm(
			`确定要将分类"${row.name}"置顶吗？置顶后该分类将显示在列表最前面。`,
			t("确认置顶"),
			{
				confirmButtonText: t("确定"),
				cancelButtonText: t("取消"),
				type: "warning",
				confirmButtonClass: "el-button--primary",
			}
		);

		// 显示加载提示
		const loading = ElMessage({
			message: t("正在置顶中..."),
			type: "info",
			duration: 0,
			showClose: false
		});

		// 获取所有分类数据
		const res = await service.shop.category.list();
		
		if (res && Array.isArray(res)) {
			// 批量更新操作数组
			const updatePromises = [];
			
			// 遍历所有数据，除了当前要置顶的数据外，其他数据排序号都加1
			for (const item of res) {
				if (item.id !== row.id) {
					// 其他数据排序号加1
					updatePromises.push(
						service.shop.category.update({
							id: item.id,
							orderNum: (item.orderNum || 0) + 1
						})
					);
				}
			}
			
			// 先更新其他数据的排序号
			await Promise.all(updatePromises);
			
			// 最后将当前数据的排序号设置为0（置顶）
			await service.shop.category.update({
				id: row.id,
				orderNum: 0
			});
		}

		// 关闭加载提示
		loading.close();
		
		// 刷新表格数据
		refresh();
		
		// 显示成功提示
		ElMessage.success(`分类"${row.name}"已成功置顶！`);
		
		console.log(`置顶成功: ID ${row.id} 的排序号已设置为 0，其他数据排序号已加1`);
		
	} catch (error) {
		if (error === 'cancel') {
			// 用户取消操作
			return;
		}
		
		console.error('置顶失败:', error);
		ElMessage.error(t("置顶失败，请重试"));
	}
}
</script>
