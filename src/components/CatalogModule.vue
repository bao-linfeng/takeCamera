<template>
    <div class="edit-catalog-wrap">
        <div class="edit-catalog-box">
            <div class="edit-head">
                <h3 class="title">{{isCatalog == 2 ? '编辑' : isCatalog == 1 ? '查看' : '创建'}}家谱</h3>
                <img class="close" @click="close('')" src="../assets/close.svg" alt="">
            </div>
            <ul class="edit-content style1">
                <li>
                    <span class="label">ID</span>
                    <input type="text" v-model="catalogKey" disabled />
                </li>
                <li>
                    <span class="label">谱名</span>
                    <input type="text" v-model="catalogO.genealogyName" :disabled="isCatalog == 1" />
                </li>
                <li>
                    <span class="label">卷(册)说明</span>
                    <input type="text" @input="handleInput" v-model="catalogO.volume" :disabled="isCatalog == 1" />
                </li>
                <li>
                    <span class="label">实拍卷(册)数</span>
                    <input type="text" :class="{red: !catalogO.hasVolume}" v-model="catalogO.hasVolume" :disabled="isCatalog == 1" />
                </li>
                <li>
                    <span class="label">起年</span>
                    <input type="text" v-model="catalogO.startYear" :disabled="isCatalog == 1" />
                </li>
                <li>
                    <span class="label">出版年</span>
                    <input type="text" :class="{red: !catalogO.publish}" v-model="catalogO.publish" :disabled="isCatalog == 1" />
                </li>
                <li>
                    <span class="label">堂号</span>
                    <input type="text" :class="{red: !catalogO.hall}" v-model="catalogO.hall" :disabled="isCatalog == 1" />
                </li>
				<li>
				    <span class="label">谱籍地(现代)</span>
				    <input type="text" :class="{red: !catalogO.place}" v-model="catalogO.place" :disabled="isCatalog == 1" />
				</li>
                <li>
                    <span class="label">版本</span>
                    <input type="text" v-model="catalogO.version" :disabled="isCatalog == 1" />
                </li>
                <li>
                    <span class="label">作者</span>
                    <input type="text" :class="{red: !catalogO.authors}" v-model="catalogO.authors" :disabled="isCatalog == 1" />
                </li>
                <li>
                    <span class="label">谱籍地(谱载)</span>
                    <input type="text" v-model="catalogO.LocalityModern" :disabled="isCatalog == 1" />
                </li>
				<li>
				    <span class="label">作者职务</span>
				    <input type="text" :class="{red: !catalogO.authorJob}" v-model="catalogO.authorJob" :disabled="isCatalog == 1" />
				</li>
				<li>
				    <span class="label">缺卷(册)说明</span>
				    <input type="text" :class="{red: !catalogO.lostVolume}" v-model="catalogO.lostVolume" :disabled="isCatalog == 1" />
				</li>
				<li>
				    <span class="label">一世祖</span>
				    <input type="text" v-model="catalogO.firstAncestor" :disabled="isCatalog == 1" />
				</li>
				<li>
				    <span class="label">始迁祖</span>
				    <input type="text" v-model="catalogO.migrationAncestor" :disabled="isCatalog == 1" />
				</li>
				<li>
				    <span class="label">备注</span>
				    <input type="text" v-model="catalogO.memo" :disabled="isCatalog == 1" />
				</li>
				<li>
					<span class="label">单双拍</span>
					<div class="radio-box">
						<div class="radio" @click="catalogO.singleOrTwo = item.value" :class="{active: catalogO.singleOrTwo == item.value}" v-for="(item, index) in singleOrTwoList" :key="index">
							<i></i>
							<span>{{item.label}}</span>
						</div>
					</div>
				</li>
				<li>
					<span class="label">电子谱</span>
					<div class="radio-box">
						<div class="radio" @click="catalogO.isLeadImages = item.value" :class="{active: catalogO.isLeadImages == item.value}" v-for="(item, index) in leadImages" :key="index">
							<i></i>
							<span>{{item.label}}</span>
						</div>
					</div>
				</li>
            </ul>
            <div class="edit-foot" v-if="isCatalog == 2 || isCatalog == 3">
                <button v-if="isCatalog == 2" class="btn" @click="saveData">保存</button>
				<button v-if="isCatalog == 3" class="btn" @click="saveData">创建</button>
            </div>
        </div>
		<!-- 确认框 -->
		<ConfirmModule v-if="isConfirm == 1" :msg="isCatalog == 2 ? '编辑谱目堂号、谱籍地、出版时间会影响该家谱的状态，确认修改吗？' : '确认要创建离线家谱吗？'" v-on:change-confirm="changeConfirm" />
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { createMsg, getQueryVariable } from '../util/ADS';
import ConfirmModule from './ConfirmModule.vue';

export default {
	components: {
	    ConfirmModule, 
	},
    props:{
        catalog: Object,
        isCatalog: Number,
    },
    setup(props, context) {
        const { userKey, siteKey, code } = useState();
        const router = useRouter();
        const catalogKey = ref('');
		const codeSubmit = ref('');
        const catalogO = ref({
				'singleOrTwo': '2', 
				'isLeadImages': '0', 
				'lostVolume': '', 
				'firstAncestor': '', 
				'migrationAncestor': '', 
				'memo': '', 
				'authorJob': '', 
				'genealogyName':'', 
				'volume': '', 
				'hasVolume': '', 
				'startYear': '', 
				'publish': '', 
				'hall': '', 
				'place': '', 
				'version': '', 
				'authors': '', 
				'LocalityModern': '',
			});

        onMounted(() => {
            catalogKey.value = props.catalog._key || '';
			codeSubmit.value = props.catalog.codeSubmit || '';
            catalogO.value = {
                'genealogyName': props.catalog.genealogyName || '',
                'volume': props.catalog.volume || '',
                'hasVolume': props.catalog.hasVolume || '', 
                'startYear': props.catalog.startYear || '', 
                'publish': props.catalog.publish || '', 
                'hall': props.catalog.hall || '', 
				'place': props.catalog.place || '',
                'version': props.catalog.version || '', 
                'authors': props.catalog.authors || '', 
                'LocalityModern': props.catalog.LocalityModern || '',
				'authorJob': props.catalog.authorJob || '',
				'memo': props.catalog.memo || '',
				'migrationAncestor': props.catalog.migrationAncestor || '',
				'firstAncestor': props.catalog.firstAncestor || '',
				'lostVolume': props.catalog.lostVolume || '',
				'singleOrTwo': props.catalog.singleOrTwo || '2',
				'isLeadImages': props.catalog.isLeadImages || '0'
            };
        });
		
		const handleInput = (e) => {
			// if(/^([1-9][0-9]*)$/.test(e.target.value)){
				
			// }else{
			// 	catalogO.value.volume = 1;
			// }
		}
		
		const isConfirm = ref(0);
		const changeConfirm = (f) => {
			f ? close(catalogO.value) : null;
			isConfirm.value = 0;
		}

        const saveData = () => {
			if(!catalogO.value.lostVolume){
				return createMsg('缺卷必填');
			}
			if(!catalogO.value.authorJob){
				return createMsg('作者职务必填');
			}
			if(!catalogO.value.hasVolume){
				return createMsg('实拍册数必填');
			}
			if(!catalogO.value.authors){
				return createMsg('作者必填');
			}
			if(!catalogO.value.publish){
				return createMsg('出版时间必填');
			}
			if(!catalogO.value.hall){
				return createMsg('堂号必填');
			}
			if(!catalogO.value.place){
				return createMsg('谱籍地必填');
			}
			isConfirm.value = 1;
        }

        const close = (data) => {
            context.emit('close', {'data': data, '_key': catalogKey.value});
        }
		
		const singleOrTwoList = ref([{'label': '单拍', 'value': '1'}, {'label': '双拍', 'value': '2'}]);
		const leadImages = ref([{'label': '是', 'value': '1'}, {'label': '否', 'value': '0'}]);

        return {
            catalogO, saveData, close, catalogKey, handleInput, codeSubmit, singleOrTwoList, leadImages,
			isConfirm, changeConfirm,
        }
    }
}
</script>
<style lang="scss" scoped>
.edit-catalog-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    .edit-catalog-box{
        position: relative;
        max-height: calc(100% - 60px);
        padding: 0 20px 20px 20px;
        background: #fff;
        border-radius: 5px;
        .edit-head{
            position: relative;
            text-align: center;
            height: 40px;
            line-height: 40px;
            .close{
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 0;
                background: #000;
                cursor: pointer;
            }
        }
        .edit-content{
            position: relative;
            height: 550px;
            overflow-y: auto;
			display: flex;
			justify-content: space-between;
			flex-wrap: wrap;
			width: 840px;
            li{
                margin-top: 10px;
                display: flex;
                align-items: center;
                .label{
                    width: 80px;
					text-align: right;
					padding-right: 20px;
                }
				input{
					&.red{
						border-color: #f00;
					}
				}
            }
        }
        .edit-foot{
            height: 40px;
            line-height: 40px;
            display: flex;
            justify-content: center;
        }
    }
}
.radio-box{
	height: 42px;
	width: 302px;
	display: flex;
	align-items: center;
}
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
</style>