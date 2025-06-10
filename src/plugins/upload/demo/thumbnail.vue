<template>
	<div class="demo-thumbnail">
		<h3>图片上传缩略图功能演示</h3>
		
		<div class="demo-section">
			<h4>基础用法（自动生成512x512缩略图）</h4>
			<cl-upload 
				v-model="imageUrl1" 
				type="image" 
				:multiple="false"
				:generate-thumbnail="true"
				@success="onUploadSuccess"
			/>
			<div v-if="imageUrl1" class="result">
				<p>原图地址: {{ imageUrl1 }}</p>
				<p v-if="thumbnailInfo1">缩略图地址: {{ thumbnailInfo1.url }}</p>
			</div>
		</div>

		<div class="demo-section">
			<h4>自定义缩略图尺寸（256x256）</h4>
			<cl-upload 
				v-model="imageUrl2" 
				type="image" 
				:multiple="false"
				:generate-thumbnail="true"
				:thumbnail-size="256"
				@success="onUploadSuccess2"
			/>
			<div v-if="imageUrl2" class="result">
				<p>原图地址: {{ imageUrl2 }}</p>
				<p v-if="thumbnailInfo2">缩略图地址: {{ thumbnailInfo2.url }}</p>
			</div>
		</div>

		<div class="demo-section">
			<h4>禁用缩略图生成</h4>
			<cl-upload 
				v-model="imageUrl3" 
				type="image" 
				:multiple="false"
				:generate-thumbnail="false"
				@success="onUploadSuccess3"
			/>
			<div v-if="imageUrl3" class="result">
				<p>原图地址: {{ imageUrl3 }}</p>
				<p>未生成缩略图</p>
			</div>
		</div>

		<div class="demo-section">
			<h4>多图上传（每张图都生成缩略图）</h4>
			<cl-upload 
				v-model="imageUrls" 
				type="image" 
				:multiple="true"
				:limit="3"
				:generate-thumbnail="true"
				@success="onMultipleUploadSuccess"
			/>
			<div v-if="imageUrls.length > 0" class="result">
				<div v-for="(url, index) in imageUrls" :key="index" class="image-item">
					<p>图片 {{ index + 1 }}:</p>
					<p>原图: {{ url }}</p>
					<p v-if="multipleThumbnails[index]">缩略图: {{ multipleThumbnails[index].url }}</p>
				</div>
			</div>
		</div>

		<div class="demo-section">
			<h4>图片预览对比</h4>
			<div v-if="imageUrl1 && thumbnailInfo1" class="image-preview">
				<div class="preview-item">
					<h5>原图</h5>
					<cl-image :src="imageUrl1" :size="200" />
				</div>
				<div class="preview-item">
					<h5>缩略图</h5>
					<cl-image :src="thumbnailInfo1.url" :size="200" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 单图上传
const imageUrl1 = ref('');
const thumbnailInfo1 = ref<any>(null);

const imageUrl2 = ref('');
const thumbnailInfo2 = ref<any>(null);

const imageUrl3 = ref('');

// 多图上传
const imageUrls = ref<string[]>([]);
const multipleThumbnails = ref<any[]>([]);

// 上传成功回调
function onUploadSuccess(item: any) {
	console.log('上传成功:', item);
	if (item.thumbnail) {
		thumbnailInfo1.value = item.thumbnail;
	}
}

function onUploadSuccess2(item: any) {
	console.log('上传成功2:', item);
	if (item.thumbnail) {
		thumbnailInfo2.value = item.thumbnail;
	}
}

function onUploadSuccess3(item: any) {
	console.log('上传成功3（无缩略图）:', item);
}

function onMultipleUploadSuccess(item: any) {
	console.log('多图上传成功:', item);
	if (item.thumbnail) {
		multipleThumbnails.value.push(item.thumbnail);
	}
}
</script>

<style lang="scss" scoped>
.demo-thumbnail {
	padding: 20px;
	
	.demo-section {
		margin-bottom: 30px;
		padding: 20px;
		border: 1px solid #e4e7ed;
		border-radius: 8px;
		
		h4 {
			margin-top: 0;
			color: #409eff;
		}
		
		.result {
			margin-top: 15px;
			padding: 10px;
			background-color: #f5f7fa;
			border-radius: 4px;
			
			p {
				margin: 5px 0;
				font-size: 14px;
				word-break: break-all;
			}
			
			.image-item {
				margin-bottom: 15px;
				padding-bottom: 15px;
				border-bottom: 1px solid #e4e7ed;
				
				&:last-child {
					border-bottom: none;
					margin-bottom: 0;
					padding-bottom: 0;
				}
			}
		}
	}
	
	.image-preview {
		display: flex;
		gap: 20px;
		margin-top: 15px;
		
		.preview-item {
			text-align: center;
			
			h5 {
				margin-bottom: 10px;
				color: #606266;
			}
		}
	}
}
</style> 