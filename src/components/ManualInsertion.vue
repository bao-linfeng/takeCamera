<template>
    <div class="manual-insertion-wrap">
        <div class="manual-insertion-box">
            <div class="head-wrap">
                <h3 class="title">手动补拍</h3>
                <img class="close" @click="close" src="../assets/close.svg" alt="">
            </div>
            <div class="content-wrap">
				<div class="marginB10">
					<div class="radio-box">
						<div class="radio" @click="insertion = item.value" :class="{active: insertion == item.value}" v-for="(item, index) in insertionList" :key="index">
							<i></i>
							<span>{{item.label}}</span>
						</div>
					</div>
				</div>
				<input class="marginB10" type="text" v-model="imageName" placeholder="影像名称" />
				<input class="marginB10" type="text" v-model="page" placeholder="补拍页码, 1开始" />
            </div>
            <div class="foot-wrap">
                <button class="btn" @click="save">保存</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { camera } from '../util/api';
import { createMsg, getQueryVariable, getLocalTime } from '../util/ADS';
import SelectModule from './SelectModule.vue';
export default {
    components: {
        SelectModule, 
    },
    props:{
        
    },
    emits: ['close', 'save'],
    setup(props, context) {
        const { userKey, siteKey, code, drive, device } = useState();
        const router = useRouter();
		
		const insertion = ref('1');
		const insertionList = ref([
			{'label': '前插', 'value': '-1'}, 
			{'label': '后插', 'value': '1'}, 
			{'label': '覆盖', 'value': '0'},
		]);
		const imageName = ref('');
		const page = ref('');
		
		const close = () => {
			context.emit('close', 0);
		}
		
		const save = () => {
			if(!imageName.value){
				return createMsg('请输入图片名称！');
			}
			if(!page.value){
				return createMsg('请输入补拍页码！');
			}
			context.emit('save', {
				'insertion': insertion.value, 
				'imageName': imageName.value, 
				'page': page.value,
			});
		}

        onMounted(() => {
			
        });

        return {
            close, save, insertion, insertionList, imageName, page, 
        }
    }
}
</script>
<style lang="scss" scoped>
.manual-insertion-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    .manual-insertion-box{
        position: relative;
        padding: 20px;
        background: #fff;
        border-radius: 5px;
        .head-wrap{
            position: relative;
            width: 100%;
            text-align: center;
            .close{
                position: absolute;
                top: 50%;
                right: 0;
                transform: translateY(-50%);
                background: #000;
                cursor: pointer;
            }
        }
        .content-wrap{
            margin-top: 20px;
			display: flex;
			justify-content: space-between;
			flex-wrap: wrap;
			width: 500px;
            
        }
        .foot-wrap{
            display: flex;
            justify-content: center;
        }
    }
}
.radio-box{
	display: flex;
	align-items: center;
	.radio{
		display: flex;
		align-items: center;
		cursor: pointer;
		color: #333;
		margin-right: 30px;
		i{
			position: relative;
			width: 14px;
			height: 14px;
			border-radius: 8px;
			border: 1px solid #999;
			background: #f1f1f1;
			margin-right: 5px;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		&.active{
			color: #86B93F;
			i{
				border: 1px solid #86B93F;
				background: #fff;
				&::after{
					content: '';
					position: absolute;
					width: 12px;
					height: 12px;
					border-radius: 6px;
					background: #86B93F;
				}
			}
		}
	}
	
}
.marginB10{
	margin-bottom: 10px;
}
</style>