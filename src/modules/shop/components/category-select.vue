<template>
	<cl-select-table
		v-model="value"
		:title="t('选择商品分类')"
		:service="service.shop.category"
		:columns="columns"
		:multiple="multiple"
		:dict="{ img: 'pic', text: 'name' }"
	/>
</template>

<script setup lang="ts">
defineOptions({
	name: "shop-category-select",
});

import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";
import { CrudProps } from "/#/crud";
import { ref, computed } from "vue";

const props = defineProps({
	...CrudProps,
	modelValue: null,
	multiple: Boolean,
});

const emit = defineEmits(['update:modelValue']);

const { service } = useCool();
const { t } = useI18n();

const value = computed({
	get: () => props.modelValue,
	set: (val) => emit('update:modelValue', val)
});

const columns = ref([
	{
		label: t("图片"),
		prop: "pic",
		minWidth: 100,
		component: { name: "cl-image", props: { size: 60 } },
	},
	{ label: t("分类名称"), prop: "name", minWidth: 140 },
	{
		label: t("状态"),
		prop: "status",
		minWidth: 80,
		dict: [
			{
				label: t("上架"),
				value: 1,
				type: "success"
			},
			{
				label: t("下架"),
				value: 0,
				type: "danger"
			}
		],
		dictColor: true
	},
	{
		label: t("描述"),
		prop: "description",
		showOverflowTooltip: true,
		minWidth: 200,
	},
	{ label: t("排序"), prop: "orderNum", minWidth: 140, sortable: "custom" },
]);
</script>
