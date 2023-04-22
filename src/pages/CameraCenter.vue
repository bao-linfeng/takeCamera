<template>
    <div class="camera-center-wrap">
		<WinBar />
        <div class="camera-center-head">
            <h3 class="head-title">拍摄中心</h3>
            <img class="close" title="返回" src="../assets/left.svg" alt="" @click="goBack(status)" />
        </div>
        <div class="camera-center-content">
            <h3 class="content-title">拍摄中</h3>
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in thead" :key="index">{{item}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in taskList" :key="index">
                        <td v-for="(item2, index2) in parameter" :key="index+''+index2">{{item[item2]}}</td>
                        <td v-if="parameter.length != thead.length">
                            <div class="stage-2" v-if="isAdmin">
                                <button class="btn marginR10" @click="adminVerify('pass')">提交审核</button>
                                <button class="btn marginR10" @click="adminVerify('return')">打回</button>
                            </div>
                            <div class="stage-2" v-else>
                                <button class="btn marginR10" @click="isCatalog = 1">详情</button>
                                <button class="btn marginR10" @click="isCatalog = 2">编辑</button>
								<button v-if="!catalog.isCameraDone" class="btn marginR10" @click="cameraDoneConfirm(item)">完成拍摄</button>
								<button v-if="item.takeStatus != 8" class="btn marginR10" @click="taskDoneConfirm(item)">完结任务</button>
                                <!-- <button v-if="!item.takeDoneTime" class="btn marginR10" @click="taskDone">完成拍摄</button> -->
                                <!-- <button class="btn marginR10" v-if="item.takeStatus == 6" @click="taskstatus(item._key, 5)">提交审核</button> -->
                                <button class="btn" @click="openDialog">打开所在位置</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="camera-center-foot">
            <div class="foot-nav">
				<div class="nav-left">
					<h3 class="nav-title">卷册({{volumList.length}})</h3>
					<SelectModule class="width120" :list="volumeStatusList" :defaultValue="volumeStatus" v-on:get-value="changeVolumeStatus" />
				</div>
                <button v-if="taskList.length && !taskList[0].takeDoneTime" class="btn" @click="handleVolume({}, 1)">新建卷册</button>
            </div>
            <div class="table-wrap style1">
                <table class="table">
                    <thead class="thead">
                        <tr>
                            <th v-for="(item, index) in theadV" :key="index">{{item}}</th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(item, index) in volumList" :key="index">
                            <td v-for="(item2, index2) in parameterV" :key="index+''+index2">{{item[item2]}}</td>
                            <td class="drag">
                                <div class="drag-box up" :class="{active: index === 0}" @click="changeVolumeIndex(index, -1)"></div>
                                <div class="drag-box down" :class="{active: index === volumList.length - 1}" @click="changeVolumeIndex(index, 1)"></div>
                            </td>
                            <td v-if="parameterV.length != theadV.length">
                                <div class="stage-2" v-if="isAdmin">
                                    <button class="btn marginR10" :class="{disabled: item.reviewStatus >= 2}" @click="goImage(item, 'imageCheck')">审核</button>
                                    <button class="btn" :class="{disabled: item.reviewStatus >= 2}" @click="volumeReturn(item)">打回</button>
                                </div>
                                <div class="stage-2" v-else>
                                    <button class="btn marginR10" @click="goImage(item)">{{item.hasCheckSelf ? '查看' : '拍摄'}}</button>
                                    <button class="btn marginR10" v-if="item.reviewStatus == 3 && item.takeStatus == 6" @click="goImage(item)">{{item.hasCheckSelf ? '查看' : '补拍'}}</button>
                                    <button class="btn marginR10" @click="handleVolume(item, 2)">编辑</button>
									<button class="btn marginR10" v-if="(item.takeStatus == 6 || item.takeStatus <= 3) && item.isLeadImages == 1" @click="initImageJsonConfirm(item)">初始化</button>
                                    <button v-if="!item.doneTime && item.takeStatus != 6 && !item.takePages" class="btn marginR10" @click="deleteData(item._key)">删除</button>
									<button class="btn" @click="openVolumeDialog(item)">打开文件夹</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <EditVolume v-if="isVolume" :volume="volumeO" :catalog="catalog" :n="internalSerialNumber" v-on:close="closeVolume" />
        <ConfirmModule v-if="isConfirm" v-on:change-confirm="changeConfirm" />
        <CatalogModule v-if="isCatalog" :catalog="catalog" :isCatalog="isCatalog" v-on:close="closeCatalog" />
		<!-- 加载页 -->
		<Loading v-if="loading" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState } from '../store';
import { createMsg, getQueryVariable, getLocalTime, getSurplusDays } from '../util/ADS';
import { getDeviceListApi } from '../composables/request';
import { camera } from '../util/api';
import { makeCameraDir, removeDir, openPath, sftprmdir, readDirGetFileNames, writeFile } from '../composables/readFile';
import EditVolume from '../components/EditVolume.vue';
import ConfirmModule from '../components/ConfirmModule.vue';
import CatalogModule from '../components/CatalogModule.vue';
import WinBar from '../components/WinBar.vue';
import SelectModule from '../components/SelectModule.vue';
import Loading from '../components/Loading.vue';

export default {
    components: {
        EditVolume, ConfirmModule, CatalogModule, WinBar, SelectModule, Loading, 
    },
    name: 'cameraCenter',
    props: ['id'],
    setup(props, context) {
        const { isAdmin, userKey } = toRefs(useState());
        const { code, siteKey, deviceKey, device, drive } = useState();
        const router = useRouter();
        const catalogKey = getQueryVariable('id');
        const status = ref('');

        // task list
        const taskList = ref([]);
        const isCatalog = ref(0);
        const catalog = ref({});
        const taskdays = ref(90);

        const getTaskDetail = async () => {// 谱目详情
            const { data } = await camera.taskDetail(code, catalogKey);
            data.checkDoneTimeO = data.checkDoneTime ? (taskdays.value - getSurplusDays(data.checkDoneTime)) : '';
            data.takeDoneTimeO = getLocalTime(data.takeDoneTime);
            catalog.value = data;
            taskList.value = [data];
            status.value = data.takeStatus;

            if(data.takeStatus == 6 || data.takeStatus == 12){// 打回卷册列表更新 => 打回时间、审核状态、打回原因 
                theadV.value = ['ID', '卷册', '内部序号', '开拍日期', '实拍页数', '同步页数', '拍完日期', '打回时间', '审核状态', '打回原因', '自查完成', '同步耗时(分钟)', '排序', '操作'];
                parameterV.value = ['_key', 'volumeNumber', 'internalSerialNumber', 'beginTimeO', 'takePages', 'syncPages', 'doneTimeO', 'returnTimeO', 'submitStatus', 'returnReason', 'hasCheckSelfO', 'syncTimeO'];
            }
        }

        const closeCatalog = (O) => {
            isCatalog.value = 0;
            if(O.data){
                updateCatalog(O.data);
            }
        }

        const updateCatalog = async (patchData) => {// 编辑家谱 -> 关键字有变化，查重
            const result = await camera.updateCatalog(code, catalogKey, patchData);
            if(result.status == 200){
                getTaskDetail();
            }else{
                createMsg(result.msg);
            }
        }
		
		const taskDoneConfirm = () => {
			isConfirm.value = 2;
		}

        const taskDone = async (data) => {// 拍摄完成
		    console.log(data);
			const result = await camera.patchCatalogPass(code, catalogKey, 7, siteKey);
			if(result.status == 200){
			    getTaskDetail();
			}else{
			    createMsg(result.msg);
			}
        }
		
		const cameraDoneConfirm = () => {
			isConfirm.value = 3;
		}
		
		const cameraDone = async () => {
			const result = await camera.patchCatalog(code, catalogKey, {'isCameraDone': 1});
			if(result.status == 200){
				createMsg('拍摄完成设置成功', true);
			    getTaskDetail();
			}else{
			    createMsg(result.msg);
			}
		}

        const taskstatus = async (catalogKey, status) => {// 更改状态
            const result = await camera.taskstatus(code, catalogKey, status);
            if(result.status == 200){
                getTaskDetail();
            }else{
                createMsg(result.msg);
            }
        }

        // table => task 
        const thead = ref(['ID', '资料名', '谱籍地', '缺卷补充', '应有卷数', '实拍卷数', '实拍页数', '同步页数', '剩余天数', '拍完日期', '操作']);
        const parameter = ref(['_key', 'genealogyName', 'place', 'missVolumeSupplement', 'volume', 'actualVolumes', 'totalPages', 'syncPages', 'checkDoneTimeO', 'takeDoneTimeO']);
        // table => volume
        const theadV = ref(['ID', '卷册', '内部序号', '开拍日期', '实拍页数', '同步页数', '拍完日期', '状态', '同步耗时(分钟)', '排序', '操作']);
        const parameterV = ref(['_key', 'volumeNumber', 'internalSerialNumber', 'beginTimeO', 'takePages', 'syncPages', 'doneTimeO', 'takeStatusO', 'syncTimeO']);

        // 卷册
        const volumList = ref([]);
        const volumeO = ref({});
        const isVolume = ref(0);

        const closeVolume = (data) => {
            // console.log(data);
			isVolume.value = 0;
            if(data && !data._key){
                addVolume(data.volumeNumber, data.internalSerialNumber, data.isLeadImages, data.electronicCopy, data.singleOrTwo, data.memo, data.imageSource, data.DorProjectID, data.DorMediaID);
            }
            if(data && data._key){
                editVolume(data._key, data.volumeNumber, data.internalSerialNumber, data.isLeadImages, data.electronicCopy, data.singleOrTwo, data.memo, data.imageSource, data.DorProjectID, data.DorMediaID);
            }
        }

        const handleVolume = (data, i) => {
			// 暂时不做限制
			// if(i == 1){
			// 	if(!volumList.value.length && !catalog.value.codeSubmit){
			// 		isCatalog.value = 2;
			// 		return createMsg('请优先编辑家谱信息，然后拍摄！');
			// 	}
			// }
            volumeO.value = data;
            isVolume.value = i;
        }
		
		const loading = ref(false);
        const addVolume = async (volumeNumber, internalSerialNumber, isLeadImages, electronicCopy, singleOrTwo, memo, imageSource, DorProjectID, DorMediaID) => {// 新增卷册
            loading.value = true;
			const result = await camera.addVolume(code, catalogKey, volumeNumber, internalSerialNumber, isLeadImages, electronicCopy, singleOrTwo, memo, imageSource, DorProjectID, DorMediaID);
			if(result.status == 200){
                isVolume.value = 0;
                makeCameraDir(drive+'/'+device+'/'+catalogKey+'/'+result.data);
				makeCameraDir(drive+'/'+device+'/'+catalogKey+'/'+result.data+'_nail');
                // sftpmkdir(device+'/'+catalogKey+'/'+result.data);

                let volumeID = volumList.value.map((ele) => {
                    return ele._key;
                });
                volumeID.push(result.data);
                sortGCVolume(volumeID);
				patchVolumeStatus(result.data, 2);
            }else{
                createMsg(result.msg);
            }
        }

        const editVolume = async (volumeKey, volumeNumber, internalSerialNumber, isLeadImages, electronicCopy, singleOrTwo, memo, imageSource, DorProjectID, DorMediaID) => {// 编辑卷册
            loading.value = true;
			const result = await camera.editVolumeNumber(code, volumeKey, volumeNumber, internalSerialNumber, isLeadImages, electronicCopy, singleOrTwo, memo, imageSource, DorProjectID, DorMediaID);
            if(result.status == 200){
                isVolume.value = 0;
				let volumeID = volumList.value.map((ele) => {
				    return ele._key;
				});
				sortGCVolume(volumeID);
                // getVolume();
            }else{
                createMsg(result.msg);
            }
        }
		
		const internalSerialNumber = ref(0);
        let reviewStatusO = {'1': '', '2': '通过', '3': '打回'};
		let takeStatusOO = {'1': '待拍摄', '2': '拍摄中', '3': '自检中', '4': '同步中', '5': '微站审阅中', '6': '打回中', '7': '完成', '8': '开发票中', '12': '机构审核中'};
        const getVolume = async () => {// 卷册列表
            const result = await camera.getVolume(code, catalogKey, volumeStatus.value);
            if(result.status == 200){
                volumList.value = result.data.map((ele, i) => {
                    ele.beginTimeO = getLocalTime(ele.beginTime);
                    ele.doneTimeO = getLocalTime(ele.doneTime);
                    ele.syncTimeO = ele.syncTime ? (ele.syncTime/1000/60).toFixed(2) : '';
                    ele.takeStatusO = takeStatusOO[ele.takeStatus];
                    ele.returnTimeO = ele.returnTime ? getLocalTime(ele.returnTime) : '';
                    ele.submitStatus = reviewStatusO[ele.reviewStatus];
                    return ele;
                });
				if(getQueryVariable('isAdd') == 1){
					handleVolume({}, 1);
				}
				if(volumList.value.length){
					internalSerialNumber.value = Number(volumList.value[volumList.value.length - 1].internalSerialNumber);
				}
            }else{
                createMsg(result.msg);
            }
        }

        const volumeReturn = async (row) => {// 卷册打回
            if(row.reviewStatus >= 2){
                return;
            }
            let result = await camera.reviewVolumeReturn(row._key, userKey.value, 1);
            if(result.status == 200){
                getVolume();
            }else{
                createMsg(result.msg)
            }
        }

        const sortGCVolume = async (volumeSortArray, f = true) => {//卷册排序
            const result = await camera.sortGCVolume(code, catalogKey, volumeSortArray);
			loading.value = false;
            if(result.status == 200){
                f ? getVolume() : null;
            }else{
                createMsg(result.msg);
            }
        }

        // 拖动切换卷册排序
        const changeVolumeIndex = (i, f) => {
            let volumeEle, volumeID = [];
            if(isAdmin.value == 1){
                return createMsg('你无权操作');
            }
            if(f == 1){
                if(i === volumList.value.length - 1){
                    return createMsg('最后一卷了，无法向下移动');
                }else{
                    volumeEle = volumList.value[i];
                    volumList.value.splice(i, 1);
                    volumList.value.splice(i+1, 0, volumeEle);
                }
            }else{
                if(i === 0){
                    return createMsg('第一卷了，无法向上移动');
                }else{
                    volumeEle = volumList.value[i];
                    volumList.value.splice(i, 1);
                    volumList.value.splice(i-1, 0, volumeEle);
                }
            }
            volumeID = volumList.value.map((ele) => {
                return ele._key
            });
            sortGCVolume(volumeID, false);
        }

        // 确认删除
        const isConfirm = ref(0);
        const changeConfirm = (f) => {
            if(f){
				if(isConfirm.value == 1){
					deleteVolume();
				}else if(isConfirm.value == 2){
					taskDone();
				}else if(isConfirm.value == 3){
					cameraDone();
				}else if(isConfirm.value == 4){
					initImageJson();
				}
            }
			isConfirm.value = 0;
        }
        const volumeKey = ref('');
        const deleteData = (key) => {
            volumeKey.value = key;
            isConfirm.value = 1;
        }

        const deleteVolume = async () => {// 删除卷册
            const result = await camera.deleteVolume(code, volumeKey.value);
            if(result.status == 200){
                // sftprmdir(device+'/'+catalogKey+'/'+volumeKey.value);
                removeDir(drive+'/'+device+'/'+catalogKey+'/'+volumeKey.value);
                
                let volumeID = []; 
                volumList.value.map((ele) => {
                    if(ele._key != volumeKey.value){
                        volumeID.push(ele._key);
                    }
                });
                sortGCVolume(volumeID);
                volumeKey.value = '';
            }else{
                createMsg(result.msg);
            }
        }

        const goBack = (s) => {
            router.push('/taskCenter?s='+s);
        }

        const adminVerify = async (operate) => {// 家谱提交审核 或 打回
            let result = await camera.adminVerify(code, catalogKey, operate);
            if(result.status == 200){
                goBack(operate == 'pass' ? 5 : 6);
            }else{
                createMsg(result.msg)
            }
        }

        const goImage = (data, f = 'imageCenter') => {
            if(data.reviewStatus >= 2 && status.value != 6){
                return;
            }
            router.push('/'+f+'?g='+catalogKey+'&v='+data._key+'&s='+data.takeStatus);
        }

        const openDialog = () => {// 打开目标文件夹
            openPath(drive+'\\'+device+'\\'+catalogKey);
        }
		
		const openVolumeDialog = (data) => {
			openPath(drive+'\\'+device+'\\'+catalogKey+'\\'+data._key);
		}

        onMounted(() => {
            makeCameraDir(drive+'/'+device+'/'+catalogKey);
			// sftpmkdir(device+'/'+catalogKey);
			
            getTaskDetail();
            getVolume();
        });
		
		// 更新卷册状态信息
		const patchVolumeStatus = async (vid, status, f = false) => {
			const result = await camera.patchVolumeStatus(code, vid, status);
			if(result.status == 200){
				if(f){
					createMsg('初始化成功', true);
					getVolume();
				}
			}else{
				// createMsg(result.msg);
			}
		}
		
		// 更新卷册信息=>实拍页数、同步累计时间
		const patchVolumeInfo = async (vid, takePages, syncTime) => {
			const result = await camera.patchVolumeInfo(code, vid, takePages, syncTime);
			if(result.status == 200){
				if(detail.value.takeStatus == 6){
					createMsg('初始化成功', true);
					getVolume();
				}else{
					patchVolumeStatus(vid, 3, true);
				}
			}else{
				createMsg(result.msg);
			}
		}
		
		const detail = ref({'takeStatus': ''});
		const initImageJsonConfirm = (data) => {
			volumeKey.value = data._key;
			detail.value = data;
			isConfirm.value = 4;
		}
        
		const initImageJson = (data) => {// 初始化卷册文件夹里面的图片，生成json;并且拍摄完成改卷册
			// console.log(data);
			readDirGetFileNames(drive+'/'+device+'/'+catalogKey+'/'+volumeKey.value, (res) => {
				console.log(res);
				if(res == 'error'){
					createMsg('初始化失败，请稍后再试');
				}else{
					let imageList = [], list = [];
					res.forEach((ele, i) => {
						if(ele.indexOf('jpg') > -1){
							if(ele.indexOf('merge') > -1){
								list.push({'name': ele, 'i': Number(ele.substring(ele.lastIndexOf('_')+1, ele.lastIndexOf('.')))});
							}else{
								imageList.push({'name': '/'+device+'/'+catalogKey+'/'+volumeKey.value+'/'+ele, 'success': '', 'outside': 1});
							}
						}
					});
					// 部分影像编号0、1、2、10初始化顺序错误
					if(list && list.length){
						list = list.sort((a, b) => {return a.i - b.i});
						list.forEach((ele) => {
							imageList.push({'name': '/'+device+'/'+catalogKey+'/'+volumeKey.value+'/'+ele.name, 'success': '', 'outside': 1});
						})
					}
					
					if(!imageList.length){
						return createMsg('请在相应卷册目录导入家谱');
					}
					writeFile(drive+'/'+device+'/'+catalogKey+'/'+volumeKey.value+'/image.json', JSON.stringify(imageList), 'w', () => {});
					// 更新卷册实拍页数
					patchVolumeInfo(volumeKey.value, imageList.length, '');
				}
			});
		}
		
		// 卷册状态选择
		const volumeStatusList = ref([{'label': '全部状态', 'value': ''},
		{'label': '待拍摄', 'value': '1'},
		{'label': '拍摄中', 'value': '2'},
		{'label': '自检中', 'value': '3'},
		{'label': '同步中', 'value': '4'},
		{'label': '机构审核中', 'value': '12'},
		{'label': '微站审核中', 'value': '5'},
		{'label': '打回中', 'value': '6'},
		{'label': '完成', 'value': '7'}]);
		const volumeStatus = ref('');
		const changeVolumeStatus = (data) => {
			// console.log(data);
			volumeStatus.value = data.value;
			getVolume();
		}
		
        return {
            thead, parameter, goBack, taskList, theadV, parameterV, volumList,
            volumeO, isVolume, addVolume, deleteVolume, goImage, deleteData, changeConfirm, isConfirm, 
            openDialog, taskDone, taskstatus, status, isCatalog, catalog, closeVolume, handleVolume,
            closeCatalog, changeVolumeIndex, isAdmin, volumeReturn, adminVerify, initImageJson, cameraDone,
			volumeStatusList, volumeStatus, changeVolumeStatus, taskDoneConfirm, cameraDoneConfirm, initImageJsonConfirm, 
			openVolumeDialog, internalSerialNumber, loading, 
        }
    }
}
</script>

<style lang="scss" scoped>
.camera-center-wrap{
    position: relative;
    width: 100%;
    height: calc(100% - 20px);
    color: #333;
    font-size: 14px;
	padding-top: 20px;
}
.camera-center-head{
    position: relative;
    width: calc(100% - 40px);
    height: 40px;
    padding: 0 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #333;
    color: #fff;
    .close{
        position: absolute;
        top: 12px;
        left: 20px;
        cursor: pointer;
    }
}
.camera-center-content{
    position: relative;
    width: 100%;
    height: 160px;
    .content-title{
        height: 30px;
        line-height: 30px;
        text-indent: 55px;
        font-size: 16px;
    }
}
.camera-center-foot{
    position: relative;
    width: calc(100% - 60px);
    padding: 0 30px;
    height: calc(100% - 200px);
    .foot-nav{
        width: 100%;
        height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
		.nav-left{
			display: flex;
			align-items: center;
			.width120{
				margin-left: 20px;
				border: 1px solid #ddd;
			}
		}
        .btn{
            height: 30px;
            line-height: 30px;
            width: 120px;
        }
    }
    .table-wrap{
        position: relative;
        width: 100%;
        max-height: calc(100% - 40px);
        overflow: auto;
    }
}

.table{
    position: relative;
    width: 100%;
    max-height: 100%;
    text-align: center;
    border: none;
    border-collapse: collapse;
    color: #000;
    .thead{
        position: relative;
        width: 100%;
        height: 40px;
        background: #D1D1D1;
        position: sticky;
        top: 0;
        z-index: 2;
        tr{
            th{
                // height: 40px;
                // line-height: 40px;
                padding: 5px 0;
                min-width: 80px;
            }
        }
    }
    .tbody{
        position: relative;
        width: 100%;
        height: calc(100% - 42px);
        tr{
            &:nth-of-type(even){
                background: #F2F2F2;
            }
            &:hover{
                background: #DBE6CC;
            }
            td{
                padding: 5px 0;
                min-width: 80px;
                &.drag{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    .drag-box{
                        width: 30px;
                        height: 30px;
                        cursor: pointer;
                        // background: rgba(0,0,0,0.3) 50% 50% no-repeat;
                        margin: 0 5px;
                        &:hover{
                            background-color: rgba(255, 255, 255, 0.6);
                        }
                        &.up{
                            background-image: url('../assets/up.svg');
                            &.active{
                                // background-color: rgba(0,0,0,0.3);
                                background-image: url('../assets/up_active.svg');
                            }
                        }
                        &.down{
                            background-image: url('../assets/down.svg');
                            &.active{
                                // background-color: rgba(0,0,0,0.3);
                                background-image: url('../assets/down_active.svg');
                            }
                        }
                    }
                }
            }
        }
    }
    .btn{
        padding: 0 10px;
        width: auto;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        &.disabled{
            background: #ddd;
            cursor: default;
        }
    }
    .marginR10{
        margin: 0 5px;
    }
}
</style>