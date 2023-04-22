<template>
    <div class="upload-image-wrap" v-show="true || uploadVolumeTotal" :class="{active: isShow}">
		<div class="upload-image-box" v-show="!isShow">
			<div class="head-box">
				<button class="btn" @click="startUpload">上传</button>
				<h3 class="title">卷册上传目录({{uploadVolumeTotal}})</h3>
				<img class="close" @click="isShow = true" src="../assets/close.svg" alt="">
			</div>
			<div class="content-box style2">
				<div class="upload-volume-box" v-for="(item, index) in uploadVolumeList" :key="index">
					<p class="name">{{item.genealogyName}}-{{item.volumeNumber}}</p>
					<div class="process-box">
						<i class="process" :style="{width: (vid == item._key ? uploadProcess : 0)+'%'}"></i>
						<i class="process-i" v-if="vid == item._key">{{uploadIndex}}</i>
					</div>
				</div>
			</div>
		</div>
		
		<div class="process-box" v-show="isShow" @click="isShow = false" title="上传进度">
			<i class="process" :style="{width: uploadProcess+'%'}"></i>
		</div>
	</div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { editDeviceApi } from '../composables/request';
import { camera } from '../util/api';
import { writeFile, readFile, readFile2, createReadStream } from '../composables/readFile';
import { createMsg, getLocalTime, getQueryVariable, setValue, createPromptBox } from '../util/ADS';

export default {
	components: {
	    
	},
    props:{
		
    },
    emits: ['change-duplicate'],
    setup(props, context) {
		const { uploadVolumeList, userKey, siteKey, code, drive, device, uploadVolumeTotal } = toRefs(useState());
        const router = useRouter();
		
		const isShow = ref(true);
		
		const uploadProcess = ref(0);
		const uploadIndex = ref(0);
		const imageList = ref([]);
		const uploading = ref(false);
		const vid = ref('');
		const total = ref(0);
		const detail = ref({});
		let gid = '', submitCount = 0;
		
		watch(uploading, (nv, ov) => {
			console.log(nv);
		})
		
		watch(uploadVolumeList, (nv, ov) => {
			console.log(nv);
			console.log(uploading.value);
			if(!uploading.value && nv.length){
				uploading.value = true;
				let volume = nv[0];
				if(!volume){return;}
				gid = volume.gcKey;
				vid.value = volume._key;
				detail.value = nv[0];
				submitCount = volume.submitCount;
				uploadIndex.value = 0;
				uploadProcess.value = 0;
				startTime.value = Date.now();
				initJson();
			}
		})
		
		// 初始化读取json获取影像数据
		const initJson = () => {
			readFile(drive.value+'/'+device.value+'/'+gid+'/'+vid.value+'/image.json', (data) => {
				console.log(data);
				// 本地image.json空的
				if(!data){
					// createPromptBox('本地文件image.json为空，该卷册需要重新初始化', 'error');
					uploading.value = false;
					patchUpdateReason(vid.value, '本地文件image.json为空');
					return;
				}
				// 本地json无数据、打回中
			    if(data == 'error'){
					// createPromptBox('本地文件image.json不存在，请检查影像在哪个拍机！', 'error');
					uploading.value = false;
					patchUpdateReason(vid.value, '本地文件image.json不存在，请检查影像在哪个拍机！');
			        return;
			    }
				// 获取本地json数据
			    if(data && JSON.parse(data).length){
			        imageList.value = JSON.parse(data);
					uploadImage2();
			    }
			});
		}
		
		watch(uploadIndex, (nv, ov) => {
			uploadProcess.value = 100*nv/imageList.value.length;
			// console.log(nv, imageList.value.length, uploadProcess.value);
		})
		
		const uploadTime = ref(Date.now());
		const startTime = ref(Date.now());
		
		// 更新卷册信息=>实拍页数、同步累计时间
		const patchVolumeInfo = async (takePages, syncTime) => {
			try{
				const result = await camera.patchVolumeInfo(code.value, vid.value, takePages, syncTime);
				if(result.status == 200){
					if(syncTime){
						uploading.value = false;
						changePropertyValue('syncCount', vid.value);
						getVolumeNotTotalSync();
					}
				}else{
					// createMsg(result.msg);
					if(syncTime){
						uploading.value = false;
						changePropertyValue('syncCount', vid.value);
						getVolumeNotTotalSync();
					}
				}
			}catch(e){
				if(syncTime){
					uploading.value = false;
					changePropertyValue('syncCount', vid.value);
					getVolumeNotTotalSync();
				}
			}
		}
		
		const uploadImage2 = () => {// 上传影像图片
		    console.log(uploadIndex.value);
		    uploadTime.value = Date.now();
		    if(uploadIndex.value >= imageList.value.length){
		        let timer = setTimeout(() => {
		            clearTimeout(timer);
		            timer = null;
		            // 同步JSON文件
		            uploadJSON2();
		        }, 300);
		        return;
		    }
		    if(imageList.value[uploadIndex.value].success === 1){
		        uploadIndex.value++;
		        uploadImage2();
		    }else{
				readImage(imageList.value[uploadIndex.value].name);
		    }
		}
		
		const uploadJSON2 = () => {
			addUploadLog();
			readImage('/'+device.value+'/'+gid+'/'+vid.value+'/image.json', true);
		}
		
		// 记录上传日志
		const log = ref('');
		const addUploadLog = () => {
			log.value = '';
			readFile(drive.value+'/'+device.value+'/log.json', (data) => {
				log.value = detail.value.genealogyName+' '+detail.value.volumeNumber+',上传耗时：'+(Date.now() - startTime.value)/1000+',拍摄页数：'+detail.value.takePages+',上传时间：'+getLocalTime(Date.now())+';\n';
				writeFile(drive.value+'/'+device.value+'/log.txt', log.value, 'a+', () => {});
			});
		}
		
		const patchUpdateReason = async (volumeKey, msg = '本地文件读取失败') => {
			// 捕获错误 2023.3.8
			try{
				const result = await camera.patchUpdateReason(volumeKey, msg);
				getVolumeNotTotalSync();
			}catch(e){
				getVolumeNotTotalSync();
			}
		}
		
		// 获取未上传卷册列表
		const getVolumeNotTotalSync = async () => {
			changePropertyValue('uploadVolumeTotal', 0);
			changePropertyValue('uploadVolumeList', []);
			try{
				const result = await camera.getVolumeNotTotalSync(code.value);
				if(result.status == 200){
					changePropertyValue('uploadVolumeTotal', result.total);
					changePropertyValue('uploadVolumeList', result.data);
				}else{
					getVolumeNotTotalSync();
				}
			}catch(e){
				//TODO handle the exception
				getVolumeNotTotalSync();
			}
		}
		
		const readImage = (f, i = false) => {// 读取本地图片或json文件
			readFile2(drive.value+f, (data) => {
				if(data == 'error'){
					// createPromptBox('本地文件读取失败，请稍后再同步', 'error');
					uploading.value = false;
					patchUpdateReason(vid.value);
				}else{
					let name = f.replace('/', '').replace(/\//g, '_');// 文件名称 拍机ID+谱ID+卷ID 下划线链接
					if(i){
						name = device.value+'_'+gid+'_'+vid.value+'_image_'+submitCount+'.json';
					}
					// let file = new File([data], name);
					let fd = new FormData();
					fd.append('file', new File([data], name));
					
					uploadApi(fd, i);
				}
			});
		}
		
		const uploadApi = async (fd, i) => {// 上传api
		    try{
		    	let result = await camera.uploadFile(fd);
		    	if(result.statusCode == 200){
		    		if(i){
		    			let isAll = imageList.value.every((ele) => { return ele.success == 1; });
		    			if(isAll){
		    				patchVolumeInfo(imageList.value.length, Date.now() - startTime.value);
		    				createMsg('影像上传成功！', true);
		    			}else{
		    				// createMsg('还有影像未上传成功，请稍后继续上传！');
		    				uploading.value = false;
		    				changePropertyValue('syncCount', vid.value);
		    				getVolumeNotTotalSync();
		    			}
		    		}else{
		    			imageList.value[uploadIndex.value]['success'] = 1;
		    			// 拍照顺序本地保存
		    			writeFile(drive.value+'/'+device.value+'/'+gid+'/'+vid.value+'/image.json', JSON.stringify(imageList.value), 'w', () => {});
		    					
		    			if(uploadIndex.value === imageList.value.length - 1){
		    			    uploadIndex.value++;
		    			    let timer = setTimeout(() => {
		    			        clearTimeout(timer);
		    			        timer = null;
		    			        // 同步JSON文件
		    			        uploadJSON2();
		    			    }, 300);
		    			}else{
		    			    uploadIndex.value++;
		    			    let timer = setTimeout(() => {
		    			        clearTimeout(timer);
		    			        timer = null;
		    			        uploadImage2();
		    			    }, 300);
		    			}
		    		}
		    	}else{
		    		console.log(result.msg);
		    		// createMsg('影像同步失败，请稍后再同步');
		    		uploading.value = false;
		    		if(i){
		    			changePropertyValue('syncCount', vid.value);
		    		}
		    		getVolumeNotTotalSync();
		    	}
		    }catch(e){
		    	//TODO handle the exception
				uploading.value = false;
				if(i){
					changePropertyValue('syncCount', vid.value);
				}
				getVolumeNotTotalSync();
		    }
		}
		
		const startUpload = () => {
			uploading.value = false;
			getVolumeNotTotalSync();
		}

        return {
            uploadVolumeList, uploadProcess, isShow, vid, total, uploadVolumeTotal, uploadIndex, startUpload, 
        }
    }
}
</script>
<style lang="scss" scoped>
.upload-image-wrap{
    position: fixed;
    top: 60px;
    right: 0px;
	bottom: 40px;
    width: 200px;
    padding: 0 10px 10px 10px;
    background: #d8d8d8;
    font-size: 12px;
	z-index: 100000;
	&.active{
		top: auto;
		right: 10px;
		bottom: 120px;
		width: 40px;
		padding: 10px 5px;
	}
	.upload-image-box{
		position: relative;
		width: 100%;
		height: 100%;
		.head-box{
			position: relative;
			width: 100%;
			height: 40px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			.btn{
				width: 40px;
				height: 20px;
				line-height: 20px;
				border-radius: 3px;
				font-size: 10px;
			}
			.close{
				// position: absolute;
				// top: 50%;
				// right: 0;
				// transform: translateY(-50%);
				cursor: pointer;
			}
		}
		.content-box{
			position: relative;
			width: 100%;
			height: calc(100% - 40px);
			overflow-y: auto;
			.upload-volume-box{
				position: relative;
				margin-bottom: 10px;
				.process-box{
					position: relative;
					width: 100%;
					height: 10px;
					background: #fff;
					border-radius: 5px;
					overflow: hidden;
					.process{
						position: absolute;
						top: 0;
						left: 0;
						width: 0;
						height: 100%;
						background: #358acd;
					}
					.process-i{
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
						font-size: 8px;
						color: #358acd;
					}
				}
			}
		}
	}
	.process-box{
		position: relative;
		width: 100%;
		height: 10px;
		background: #fff;
		border-radius: 5px;
		overflow: hidden;
		cursor: pointer;
		.process{
			position: absolute;
			top: 0;
			left: 0;
			width: 0;
			height: 100%;
			background: #358acd;
		}
	}
}
</style>