<template>
    <ul class="image-set-wrap">
		<li v-if="(takeStatus >= 1 && takeStatus <= 3) || takeStatus == 6">
		    <span @click="autoFocus">自动对焦</span>
		</li>
		<li v-if="(takeStatus >= 1 && takeStatus <= 3) || takeStatus == 6">
		    <span @click="manualInsertion">手动补拍</span>
		</li>
		<li v-if="(takeStatus >= 1 && takeStatus <= 3) || takeStatus == 6">
		    <span @click="multipleDelete">一键删除</span>
		</li>
        <li>
            <span class="marginR10">拍摄完成</span>
            <img @click="changeImage" :src="toggleImage ? on : off" alt="">
        </li>
		<li v-if="takeStatus == 3" @click="startCamera">
		    <span class="marginR10">重新拍摄</span>
		</li>
		<li v-if="(takeStatus == 2 || takeStatus == 3) || takeStatus == 6" @click="startCheck(5)">
		    <span class="marginR10">开始自检</span>
		</li>
		<li v-if="(takeStatus == 2 || takeStatus == 3) || takeStatus == 6" @click="startCheck(1)">
		    <span class="marginR10">逐拍自检</span>
		</li>
		<li v-if="takeStatus == 3 || takeStatus == 6">
		    <span @click="rename">一键命名</span>
		</li>
        <li v-if="takeStatus >= 3">
            <span class="marginR10">自检完成</span>
            <img @click="changeCheck" :src="toggleCheck ? on : off" alt="">
        </li>
		<!-- 确认框 -->
		<ConfirmModule v-if="isConfirm" v-on:change-confirm="changeConfirm" />
    </ul>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { editDeviceApi } from '../composables/request';
import on from '../assets/on.svg';
import off from '../assets/off.svg';
import SelectModule from './SelectModule.vue';
import ConfirmModule from './ConfirmModule.vue';
import { createMsg, getLocalTime, getQueryVariable, setValue } from '../util/ADS';

export default {
	components: {
	    SelectModule, ConfirmModule, 
	},
    props:{
		takeStatus: Number,
		syncSuccess: Boolean,
    },
    emits: ['manual-insertion', 're-name', 'start-camera', 'multiple-delete', 'start-check', 'change-image', 'change-check', 'change-fabric'],
    setup(props, context) {
        const { userKey, siteKey, code } = useState();
        const router = useRouter();
		
		const isConfirm = ref(0);
		const changeConfirm = (f) => {
			if(f){
				if(isConfirm.value == 1){
					toggleImage.value = !toggleImage.value;
					context.emit('change-image', 3);
				}
				if(isConfirm.value == 2){
					toggleCheck.value = !toggleCheck.value;
					context.emit('change-check', 4);
				}
				if(isConfirm.value == 3){
					toggleImage.value = false;
					context.emit('start-camera', '');
				}
				if(isConfirm.value == 4){
					toggleImage.value = false;
					context.emit('re-name', '');
				}
			}
			
			isConfirm.value = 0;
		}
        const toggleImage = ref(props.takeStatus > 2 ? true : false);
        const changeImage = () => {
			if(props.takeStatus == 2){
				isConfirm.value = 1;
			}
        }
        const toggleCheck = ref(props.takeStatus > 3 && props.takeStatus != 6 ? true : false);
        const changeCheck = () => {
			if(props.takeStatus == 3 || props.takeStatus == 6){
				isConfirm.value = 2;
			}
        }
		
		const startCheck = (i) => {
			context.emit('start-check', i);
		}
		
		const multipleDelete = () => {
			context.emit('multiple-delete', '');
		}
		
		const shutterSpeed = ref('40');
		const sendShutterSpeed = () => {
			// console.log(shutterSpeed.value);
			if(window.NikonClip){
				window.NikonClip.stdin.write('shutterSpeed:'+shutterSpeed.value+'\n', error => {
				    if (error) {
				        console.log(error);
				    }
					createMsg('亮度设置成功，请继续拍摄！', true);
				});
			}
		}
		
		// 重新拍摄
		const startCamera = () => {
			isConfirm.value = 3;
		}
		
		// 一键重命名
		const rename = () => {
			isConfirm.value = 4;
		}
		
		// 手动补拍
		const manualInsertion = () => {
			context.emit('manual-insertion', 1);
		}

		// 自动对焦
		const autoFocus = () => {
			if(window.NikonClip){
                window.NikonClip.stdin.write(`focus\n`, error => {
                    if(error){
                        console.log(error);
                    }
                });
				createMsg('对焦成功', true);
            }
		}

        return {
            on, off, toggleImage, toggleCheck, changeImage, changeCheck, startCamera, 
			startCheck, multipleDelete, shutterSpeed, sendShutterSpeed, changeConfirm, isConfirm, rename,
			manualInsertion, autoFocus,
        }
    }
}
</script>
<style lang="scss" scoped>
.image-set-wrap{
    position: absolute;
    top: 60px;
    right: 0px;
    width: 120px;
    padding: 10px;
    background: #d8d8d8;
    font-size: 12px;
    &::before{
        content: '';
        position: absolute;
        right: 20px;
        top: -20px;
        width: 0;
        height: 0;
        border-top: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 10px solid #d8d8d8;
        border-left: 10px solid transparent;
    }
    li{
        height: 30px;
        line-height: 30px;
        display: flex;
        align-items: center;
        cursor: pointer;
        .marginR10{
            margin-right: 10px;
        }
        img{
            cursor: pointer;
        }
        span{
            &.active{
                color: #85b83e;
            }
        }
    }
}
.shutterSpeed{
	width: 60px;
	height: 20px;
	line-height: 20px;
	margin-left: 10px;
	font-size: 12px;
}
</style>