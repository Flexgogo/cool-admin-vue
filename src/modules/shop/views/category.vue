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
	name: "shop-category",
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
					accept: "image/*",
					size: [150, 150],
					limit: 1
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
			label: t("排序"),
			prop: "orderNum",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
	],
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
		{ label: t("描述"), prop: "description", minWidth: 120 },
		{
			label: t("状态"),
			prop: "status",
			minWidth: 120,
			dict: options.status,
		},
		{ label: t("排序"), prop: "orderNum", minWidth: 120 },
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
</script>
