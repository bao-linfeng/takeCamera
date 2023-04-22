<template>
    <div class="win-box">
		<div class="win-box-content">
			<h3 class="title">DCam(v1.0.5.20230331)</h3>
		</div>
		<div class="win-box-foot">
			<div class="win" @click="minimizeWin('min')">
			    <img src="../assets/min.svg" alt="">
			</div>
			<div class="win" @click="minimizeWin('max')">
			    <img src="../assets/max.svg" alt="">
			</div>
			<div class="win active" @click="minimizeWin('close')">
			    <img src="../assets/close_g.svg" alt="">
			</div>
		</div>
		<!-- 确认框 -->
		<!-- <ConfirmModule v-if="isConfirm" :msg="msg" v-on:change-confirm="changeConfirm" /> -->
		<div class="upload-wrap" v-if="isConfirm">
			<div class="head-box">
				<h3 class="title">关闭提示</h3>
				<img class="close" @click="cancle" src="../assets/close.svg" alt="">
			</div>
			<div class="content-box" :class="{active: uploadVolumeTotal}">
				<p v-if="!uploadVolumeTotal">确认要关闭拍机程序吗？</p>
				<p v-if="uploadVolumeTotal">还有如下卷册未上传，确认要关闭拍机程序吗？</p>
				<div v-if="uploadVolumeTotal" class="volume-box style1">
					<p v-for="(item, index) in uploadVolumeList" :key="index">{{item.genealogyName}}-{{item.volumeNumber}}</p>
				</div>
			</div>
			<div class="foot-box">
				<button class="btn active" @click="cancle">取消</button>
				<button class="btn" @click="close">关闭</button>
			</div>
		</div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { sendWin } from '../composables/readFile';
import ConfirmModule from './ConfirmModule.vue';
import { camera } from '../util/api';

export default {
	components: {
		ConfirmModule, 
	},
    props:{
        
    },
    setup(props, context) {
		const { uploadVolumeList, userKey, siteKey, code, drive, device, uploadVolumeTotal } = toRefs(useState());
        const router = useRouter();

        const minimizeWin = (t) => {
			if(t == 'close'){
				isConfirm.value = 1;
				getVolumeNotTotalSync();
			}else{
				sendWin(t);
			}
        }
		
		const closeNikon = () => {
		    if(window.NikonClip){
		        window.NikonClip.stdin.write(`close\n`, error => {
		            if (error) {
		                console.log(error);
		            }
		            window.NikonClip = null;
		        });
		    }
		}
		
		const isConfirm = ref(0);
		const msg = ref('确认要关闭应用程序吗？');
		const changeConfirm = (f) => {
			if(f){
				closeNikon();
				sendWin('close');
			}
			isConfirm.value = 0;
		};
		
		const cancle = () => {
			isConfirm.value = 0;
		}
		
		const close = () => {
			sendWin('close');
			closeNikon();
		}
		
		// 获取未上传卷册列表
		const getVolumeNotTotalSync = async () => {
			try{
				const result = await camera.getVolumeNotTotalSync(code.value);
				if(result.status == 200){
					changePropertyValue('uploadVolumeTotal', result.total);
					changePropertyValue('uploadVolumeList', result.data);
				}else{
					
				}
			}catch(e){
				
			}
		}

        return {
            minimizeWin, isConfirm, changeConfirm, msg, cancle, close, uploadVolumeTotal, uploadVolumeList,
        }
    }
}
</script>
<style lang="scss" scoped>
.win-box{
    position: absolute;
    top: 0;
    right: 0;
	width: calc(100% - 20px);
	height: 20px;
	padding: 0 10px;
    display: flex;
	justify-content: flex-end;
    align-items: center;
	font-size: 14px;
	background: #fff;
	z-index: 100;
	-webkit-app-region: drag;
	cursor: pointer;
	.win-box-content{
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		.title{
			font-size: 12px;
		}
	}
	.win-box-foot{
		display: flex;
		align-items: center;
		-webkit-app-region: no-drag;
	}
    .win{
        width: 18px;
        height: 18px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
		margin-left: 20px;
		img{
			height: 10px;
		}
		
        &:hover{
            background: #ddd;
        }
        &.active{
            &:hover{
                background: #f00;
            }
        }
    }
}
.upload-wrap{
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background: #fff;
	padding: 20px 40px;
	border-radius: 5px;
	border: 1px solid #ddd;
	.head-box{
		position: relative;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		.close{
			position: absolute;
			top: 50%;
			right: 0;
			transform: translateY(-50%);
			cursor: pointer;
			background: #000;
		}
	}
	.content-box{
		position: relative;
		height: 100px;
		display: flex;
		justify-content: center;
		align-items: center;
		&.active{
			height: 200px;
			display: block;
		}
		p{
			margin-bottom: 10px;
		}
		.volume-box{
			height: 100%;
			overflow-y: auto;
		}
	}
	.foot-box{
		display: flex;
		justify-content: center;
		align-items: center;
		.btn{
			width: 120px;
			height: 40px;
			line-height: 40px;
			border-radius: 5px;
			margin: 0 20px;
			&.active{
				background: #fff;
				border: 1px solid #ddd;
				color: #333;
			}
		}
	}
}
</style>