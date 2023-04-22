<template>
    <div class="edit-volume-wrap">
        <div class="edit-volume-box">
            <div class="edit-head">
                <h3 class="title">{{volumeO._key ? '编辑' : '新增'}}</h3>
                <img class="close" @click="close('')" src="../assets/close.svg" alt="">
            </div>
            <ul class="edit-content">
				<li class="w50">
				    <span class="label">内部序号</span>
					<input type="Number" v-model="volumeO.internalSerialNumber" placeholder="内部序号" />
				</li>
                <li class="w50">
                    <span class="label">卷册名</span>
                    <input type="text" v-model="volumeNumber" />
                </li>
				<li class="w50">
				    <span class="label">ProjectID</span>
				    <input type="text" v-model="volumeO.DorProjectID" />
				</li>
				<li class="w50">
				    <span class="label">MediaID</span>
				    <input type="text" v-model="volumeO.DorMediaID" />
				</li>
				<li class="w50">
				    <span class="label">电子谱</span>
				    <div class="radio-box">
						<div class="radio" @click="volumeO.isLeadImages = item.value" :class="{active: volumeO.isLeadImages == item.value}" v-for="(item, index) in leadImages" :key="index">
							<i></i>
							<span>{{item.label}}</span>
						</div>
					</div>
				</li>
				<!-- <li>
				    <span class="label">复印件</span>
				    <div class="radio-box">
						<div class="radio" @click="volumeO.electronicCopy = item.value" :class="{active: volumeO.electronicCopy == item.value}" v-for="(item, index) in leadImages" :key="index">
							<i></i>
							<span>{{item.label}}</span>
						</div>
					</div>
				</li> -->
				<li class="w50">
				    <span class="label">单双拍</span>
				    <div class="radio-box">
						<div class="radio" @click="volumeO.singleOrTwo = item.value" :class="{active: volumeO.singleOrTwo == item.value}" v-for="(item, index) in singleOrTwoList" :key="index">
							<i></i>
							<span>{{item.label}}</span>
						</div>
					</div>
				</li>
				<li>
					<span class="label">影像来源</span>
					<SelectModule class="width120" :list="imageSourceList" :defaultValue="volumeO.imageSource" v-on:get-value="changeImageSource" />
				</li>
				<li>
					<span class="label">实体书状态</span>
					<SelectModule class="width120" :list="catalogStatusList" :defaultValue="catalogStatus" v-on:get-value="changeCatalogStatus" />
				</li>
				<li>
					<span class="label">备注</span>
					<textarea class="memo memoStyle" v-model="volumeO.memo"></textarea>
				</li>
				<li>
					<div class="memo">
						<h3>新建卷填写规范:</h3>
						<p>1.卷（册）名：依Familysearch 录入标准；</p>
						<p>2.电子谱：非经拍摄直接导入系统的谱书；</p>
						<p>3.单双拍：单页一拍为“单拍”，双页一拍为“双拍”；</p>
						<p>4.实体谱书状态：依谱书实际状态选择说明；</p>
					</div>
				</li>
            </ul>
            <div class="edit-foot">
                <button class="btn" @click="close({'_key': volumeO._key, 'volumeNumber': volumeNumber, 'internalSerialNumber': Number(volumeO.internalSerialNumber), 'isLeadImages': volumeO.isLeadImages, 'electronicCopy': volumeO.electronicCopy, 'singleOrTwo': volumeO.singleOrTwo, 'memo': volumeO.memo, 'imageSource': volumeO.imageSource, 'DorProjectID': volumeO.DorProjectID, 'DorMediaID': volumeO.DorMediaID})">保存</button>
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
        volume: Object,
		catalog: Object,
        n: Number,
    },
    emits: ['close'],
    setup(props, context) {
        const { userKey, siteKey, code, drive, device } = useState();
        const router = useRouter();
		const volumeNumber = ref('');
        const volumeO = ref({
				'_key': '', 
				'internalSerialNumber': 1, 
				'isLeadImages': '0', 
				'electronicCopy': '0', 
				'singleOrTwo': '2', 
				'memo': '',
				'imageSource': '1',
				'DorProjectID': '',
				'DorMediaID': '',
			});

        onMounted(() => {
			volumeNumber.value = props.volume.volumeNumber || '';
            if(!props.volume._key){
				volumeNumber.value = '';
				volumeO.value.isLeadImages = props.catalog.isLeadImages || '0';
				volumeO.value.singleOrTwo = props.catalog.singleOrTwo || '2';
				volumeO.value.internalSerialNumber = props.n+1;
				volumeO.value.memo = '谱书正常';
				volumeO.value.imageSource = '1';
				volumeO.value.DorProjectID = '';
				volumeO.value.DorMediaID = '';
            }else{
				volumeO.value._key = props.volume._key;
				volumeO.value.isLeadImages = props.volume.isLeadImages || '0';
				volumeO.value.singleOrTwo = props.volume.singleOrTwo;
				volumeO.value.internalSerialNumber = props.volume.internalSerialNumber;
				volumeO.value.memo = props.volume.memo || props.volume.volumeMemo || '';
				catalogStatus.value = props.volume.memo || props.volume.volumeMemo || '';
				volumeO.value.imageSource = props.volume.imageSource || '1';
				volumeO.value.DorProjectID = props.volume.DorProjectID || '';
				volumeO.value.DorMediaID = props.volume.DorMediaID || '';
				if(catalogStatus.value){
					if(['谱书正常', '原稿模糊', '原稿破损', '装订紧密'].indexOf(catalogStatus.value) > -1){
						
					}else{
						catalogStatus.value = '其他';
					}
				}
			}
        });
		
		const singleOrTwoList = ref([{'label': '单拍', 'value': '1'}, {'label': '双拍', 'value': '2'}]);
		const leadImages = ref([{'label': '是', 'value': '1'}, {'label': '否', 'value': '0'}]);
		const imageSourceList = ref([
                {"label": '拍摄上传', 'value': '1'},
                {"label": 'DCAM导入', 'value': '5'},
                {"label": '其他影像导入', 'value': '10'},
            ]);
			
		const changeImageSource = (data) => {
			volumeO.value.imageSource = data.value;
		}

        const close = (data) => {
            if(data){
                if(!data.volumeNumber){
                    return createMsg('请输入卷册名');
                }
            }
            context.emit('close', data);
        }
		
		const catalogStatus = ref('谱书正常');
		const catalogStatusList = ref([
		        {'label': '谱书正常', 'value': '谱书正常'},
		        {'label': '原稿模糊', 'value': '原稿模糊'},
		        {'label': '原稿破损', 'value': '原稿破损'},
		        {'label': '装订紧密', 'value': '装订紧密'},
		        {'label': '其他', 'value': '其他'},
		    ]);
		const changeCatalogStatus = (data) => {
			catalogStatus.value = data.value;
			volumeO.value.memo = data.value;
		}

        return {
            volumeO, close, leadImages,
			singleOrTwoList, volumeNumber, catalogStatusList, catalogStatus, changeCatalogStatus, 
			imageSourceList, changeImageSource, 
        }
    }
}
</script>
<style lang="scss" scoped>
.edit-volume-wrap{
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
    .edit-volume-box{
        position: relative;
        padding: 20px;
        background: #fff;
        border-radius: 5px;
        .edit-head{
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
        .edit-content{
            margin-top: 20px;
			display: flex;
			justify-content: space-between;
			flex-wrap: wrap;
			width: 500px;
            li{
                margin-bottom: 20px;
                display: flex;
                align-items: center;
				&.w50{
					width: calc(50% - 10px);
				}
                .label{
                    width: 80px;
                }
				input{
					width: 150px;
					border: 1px solid #86B93F;
				}
            }
        }
        .edit-foot{
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
	// i{
	// 	margin-left: 20px;
	// 	cursor: pointer;
	// 	color: #333;
	// 	&.active{
	// 		color: #86B93F;
	// 	}
	// }
}
.memo{
	max-width: 420px;
	font-size: 12px;
}
.memoStyle{
	width: 388px;
	height: 50px;
	border: 1px solid #86B93F;
	outline: none;
	padding: 10px;
	border-radius: 5px;
}
.width120{
	width: 120px;
	border: 1px solid #ddd;
}
</style>