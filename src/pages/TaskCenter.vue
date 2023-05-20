<template>
    <div class="task-center-wrap">
        <div class="task-center-head">
            <div class="head-user">
                <img class="avatar" :src="avatar || avatarImg" alt="头像" @click="isMenu = !isMenu" />
                <span @click="isMenu = !isMenu">{{deviceID}}</span>
                <ul class="menu-wrap" v-if="isMenu">
                    <li>{{orgName}}({{isAdmin ? '管理员' : '拍机员'}})</li>
                    <li v-for="(item, index) in memuList" :key="index" @click="changeMenu(item)">{{item.name}}</li>
                    <li @click="logout">退出</li>
                </ul>
            </div>
            <h3 class="head-title">任务中心</h3>
            <div class="head-msg">
                <button class="btn marginR10 samll" @click="openInitCamera">打开初始化程序</button>
                <img class="msg" src="../assets/msg.svg" alt="消息" @click="isShow = 5" />
                <i v-if="notReadMsgNumber">{{notReadMsgNumber}}</i>
            </div>
        </div>
        <div class="task-center-content">
            <ul class="step-wrap">
                <li :class="{active: stage === item.stage}" v-for="(item,index) in stageList" :key="index" @click="changeStage(item.stage)">
                    <img class="img" :src="item.img" alt="" />
                    <p>{{item.name}}({{statisticsDataO[item.i] || 0}})</p>
                </li>
            </ul>
        </div>
        <div v-if="stage === 9" class="create-bill-wrap">
            <div class="bill-search"></div>
            <button class="create-bill-btn" @click="createBill">创建发票</button>
        </div>
		<div class="jiapu-search">
			<input type="text" v-model="gcKey" @keyup.enter="getTaskList" placeholder="谱ID" />
			<input type="text" v-model="genealogyName" @keyup.enter="getTaskList" placeholder="谱名" />
			<input type="text" v-model="hall" @keyup.enter="getTaskList" placeholder="堂号" />
			<input type="text" v-model="publish" @keyup.enter="getTaskList" placeholder="出版时间" />
			<input type="text" v-model="fileName" @keyup.enter="getTaskList" placeholder="文件标题" />
			<input v-if="stage >= 3" type="text" v-model="volumeNumber" @keyup.enter="getTaskList" placeholder="卷名" />
			<input class="w150" type="text" v-model="keyWord" @keyup.enter="getTaskList" placeholder="作者、谱籍地、始迁祖、一世祖" />
			<SelectModule v-if="stage == 1" class="width130" :list="claimList" :defaultValue="claim" v-on:get-value="changeClaim" />
			<button class="btn marginL10" @click="getTaskList">检索</button>
			<button v-if="stage == 1" class="btn marginL10" @click="patchClaimBatchConfirm">批量认领</button>
            <button v-if="stage == 2" class="btn marginL10" @click="createOfflineCatalog">创建直拍家谱</button>
			<button v-if="stage == 4" class="btn marginL10" @click="patchStatusBatch(3)">一键自检完成</button>
			<button v-if="stage == 5" class="btn marginL10" @click="patchStatusBatch(4)">一键提交审阅</button>
			
		</div>
        <div class="task-center-foot style1" :class="{active: true}">
            <div class="table-wrap">
                <table class="table">
                    <thead class="thead">
                        <tr>
                            <th v-for="(item, index) in thead" :key="index">
                                <i class="check" :class="{active: checkAllList.length == taskList.length && checkAllList.length, some: checkAllList.length && checkAllList.length < taskList.length}" @click="handleCheckAll" v-if="item === 'checkAll'"></i>
                                <i v-else>{{item}}</i>
                            </th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr :class="{orange: item.isOrange, red: item.isRed}" v-for="(item, index) in taskList" :key="index">
                            <td v-for="(item2, index2) in parameter" :key="index+''+index2">
                                <i class="check" :class="{active: checkAllList.indexOf(item._key) > -1, disabled: item.takeStatus >= 8}" @click="handleCheck(item)" v-if="item2 === 'check'"></i>
                                <i v-else>{{item[item2]}}</i>
                            </td>
                            <td v-if="parameter.length != thead.length">
								<div class="stage-2" v-if="stage === 1">
									<i class="btn-i" v-if="stage === 1 && !item.takeStatus" @click="taskClaimConfirm(item._key)">认领</i>
									<i class="i-claim" v-if="stage === 1 && item.takeStatus">已认领</i>
								</div>
                                <div class="stage-2" v-if="stage === 2">
									<i class="btn-i" @click="handleEditCatalog(item)">编辑</i>
									<i class="btn-i" @click="handleAddVolume(item)">卷册</i>
									<i class="btn-i" @click="goCamera(item._key)">详情</i>
                                    <i v-if="!item.totalPages" class="btn-i" @click="taskGiveUp(item._key)">放弃</i>
                                </div>
                                <div class="stage-2" v-if="stage === 3">
                                    <i class="btn-i" @click="goImage(item)">{{item.takeDoneTime ? '查看' : '拍摄'}}</i>
									<i class="btn-i" @click="openVolumeDialog(item)">定位</i>
									<i class="btn-i" @click="initImageJsonConfirm(item, 5)">初始化</i>
                                    <i v-if="item.takePages" class="btn-i" @click="patchVolumeStatus(item.volumeKey, 3)">完成</i>
									<i class="btn-i" @click="handleEditVolume(item)">编辑</i>
									<i class="btn-i" @click="handleDeleteVolume(item)">删除</i>
                                </div>
                                <div class="stage-2" v-if="stage === 4">
                                    <i class="btn-i" @click="goImage(item)">查看</i>
									<i class="btn-i" @click="patchVolumeStatus(item.volumeKey, 2)">返回</i>
                                    <i class="btn-i" v-if="item.directTakeImage != 1" @click="patchVolumeStatus(item.volumeKey, 4)">自检</i>
									<i class="btn-i" @click="openVolumeDialog(item)">定位</i>
                                </div>
                                <div class="stage-2" v-if="stage === 5">
									<i class="btn-i" @click="goImage(item)">查看</i>
									<i class="btn-i" @click="patchVolumeStatus(item.volumeKey, 2)">返回</i>
                                    <i class="btn-i" @click="patchVolumeStatus(item.volumeKey, 5)">审阅</i>
									<i v-if="item.reason" :title="item.reason" class="btn-i" @click="patchUpdateReason(item.volumeKey)">异常</i>
									<i class="btn-i" @click="openVolumeDialog(item)">定位</i>
                                </div>
								<div class="stage-2" v-if="stage == 6">
								    <i class="btn-i" @click="goImage(item)">查看</i>
									<i class="btn-i" @click="openVolumeDialog(item)">定位</i>
								</div>
                                <div class="stage-2" v-if="stage == 12">
                                    <i class="btn-i" @click="goCamera(item._key)">审核</i>
									<i class="btn-i" @click="openVolumeDialog(item)">定位</i>
                                </div>
                                <div class="stage-2" v-if="stage == 7">
                                    <i class="btn-i" @click="goImage(item)">补拍</i>
									<i class="btn-i disabled" @click="initImageJsonConfirm(item, 4)">初始化</i>
									<i class="btn-i" @click="openVolumeDialog(item)">定位</i>
                                </div>
								<div class="stage-2" v-if="stage >= 8 && stage != 12">
								    <i class="btn-i" @click="goImage(item)">查看</i>
									<i class="btn-i" @click="openVolumeDialog(item)">定位</i>
								</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
		<div class="foot-wrap">
			<div class="label"><i>小技巧:</i> Ctrl+Shift+R 强制刷新</div>
			<PaginationModule :defaultPage="page" :pages="pages" :total="total" v-on:change-page="changePage" />
		</div>
        <DiskManage v-if="isShow == 1" v-on:close="closeDisk" />
        <ChildDevice v-if="isShow == 2" v-on:close="isShow = 0" />
        <BillModule v-if="isShow == 4" v-on:close="isShow = 0" />
        <MessageModule v-if="isShow == 5" v-on:close="isShow = 0" />
		<LogModule v-if="isShow == 6" v-on:close="isShow = 0" />
		<!-- 谱目编辑 -->
		<CatalogModule v-if="isShow == 7" :catalog="catalogDetail" :isCatalog="isCatalog" v-on:close="closeCatalog" />
		<!-- 卷册编辑 -->
		<EditVolume v-if="isShow == 8 || isShow == 9" :volume="volumeDetail" :catalog="catalogDetail" :n="internalSerialNumber" v-on:close="closeVolume" />
		<WinBar />
		<!-- 确认框 -->
		<ConfirmModule v-if="isConfirm" v-on:change-confirm="changeConfirm" />
		<!-- 加载页 -->
		<Loading v-if="loading" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs, inject, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState, changePropertyValue } from '../store';
import { createMsg, getQueryVariable, getLocalTime, setValue, getSurplusDays } from '../util/ADS';
import { makeCameraDir, sftpmkdir, sftprmdir, removeDir, openPath, readDirGetFileNames, writeFile, viewProcessMessage, openNikon } from '../composables/readFile';
import Loading from '../components/Loading.vue';
import DiskManage from '../components/DiskManage.vue';
import BillModule from '../components/BillModule.vue';
import MessageModule from '../components/MessageModule.vue';
import PaginationModule from '../components/PaginationModule.vue';
import ChildDevice from '../components/ChildDevice.vue';
import WinBar from '../components/WinBar.vue';
import LogModule from '../components/LogModule.vue';
import img0 from '../assets/icon0.svg';
import img1 from '../assets/icon1.svg';
import img2 from '../assets/icon2.svg';
import img3 from '../assets/icon3.svg';
import img4 from '../assets/icon4.svg';
import img5 from '../assets/icon5.svg';
import img6 from '../assets/icon6.svg';
import img7 from '../assets/icon7.svg';
import img8 from '../assets/icon8.svg';
import avatarImg from '../assets/avatar.svg';
import { camera } from '../util/api';
import ConfirmModule from '../components/ConfirmModule.vue';
import CatalogModule from '../components/CatalogModule.vue';
import EditVolume from '../components/EditVolume.vue';
import SelectModule from '../components/SelectModule.vue';

export default {
    components: {
        DiskManage, BillModule, MessageModule, PaginationModule, ChildDevice, WinBar, LogModule, ConfirmModule, Loading, 
		CatalogModule, EditVolume, SelectModule, 
    },
    name: 'taskCenter',
    props: ['id'],
    setup(props, context) {
        const { notReadMsgNumber, orgName } = toRefs(useState());
        const { isAdmin, code, siteKey, userKey, deviceID, deviceKey, device, drive, userName, avatar } = useState();
        const router = useRouter();
        const id = props.id;
        let status = getQueryVariable('s');
        const socket = inject('socket');

        const loginIO = () => {
            socket.emit("login", {'userKey': userKey,'siteKey': siteKey, 'role': 4, 'deviceKey': deviceKey ? deviceKey : 'admin'});
        }
        
        const stageList = ref([{'name': '任务池', 'img': img0, 'stage': 1, 'i': '0'},
        {'name': '待拍摄', 'img': img1, 'stage': 2, 'i': 1},
        {'name': '拍摄中', 'img': img2, 'stage': 3, 'i': 2},
        {'name': '自检中', 'img': img3, 'stage': 4, 'i': 3},
        {'name': '同步中', 'img': img4, 'stage': 5, 'i': 4},
        {'name': '机构审阅中', 'img': img5, 'stage': 13, 'i': 12},
        {'name': '微站审阅中', 'img': img5, 'stage': 6, 'i': 5},
        {'name': '打回中', 'img': img6, 'stage': 7, 'i': 6},
        {'name': '完成', 'img': img7, 'stage': 8, 'i': 7},
		{'name': '作废', 'img': img7, 'stage': 17, 'i': 16}]);

        const stage = ref(1);
        const changeStage = (s) => {// 切换状态
			genealogyName.value = '';
			hall.value = '';
			gcKey.value = '';
			publish.value = '';
			fileName.value = '';
			volumeNumber.value = '';
			keyWord.value = '';
			claim.value = '1';
            page.value = 1;
            stage.value = s;
            checkAllList.value = [];
			router.push('/taskCenter?s='+(s-1));
            statisticsData();
            getTaskList();
        }
		
		const claim = ref('1');
		const claimList = ref([
			{'label': '全部任务', 'value': ''},
			{'label': '未领取', 'value': '1'},
			{'label': '已认领', 'value': '2'},
		]);
		
		const changeClaim = (data) => {
			claim.value = data.value;
			getTaskList();
		}

        const memuList = ref([{'name': '盘符设置', 'path': '1'}, 
        {'name': '账号切换', 'path': '/authentication'},
		{'name': '日志列表', 'path': '6'}, ]);
        const isMenu = ref(false);
        const changeMenu = (data) => {// 切换目录
            isMenu.value = false;
            if(data.path.indexOf('/') > -1){
                router.push(data.path);
            }else{
                isShow.value = data.path;
            }
        }

        // task list
        const page = ref(1);
        const pages = ref(0);
        const total = ref(0);
        const limit = 30;
        const filterDevice = ref('');
        const filterStatus = ref('');
		const genealogyName = ref('');
		const volumeNumber = ref('');
		const keyWord = ref('');
		const fileName = ref('');
		// 家谱检索
		const hall = ref('');
		const gcKey = ref('');
		const publish = ref('');
		
        const taskList = ref([]);
        const stageO = {'null': '未认领', '1': '待拍摄', '2': '拍摄中', '3': '自检完成', '4': '同步完成', '5': '审阅中', '6': '已打回', '7': '完成', '8': '已结算','9': '已结算', '10': '已结算', '11': '已结算', '12': '已结算', '16': '作废'};
        const taskdays = ref(90);

        const changePage = (i) => {
            page.value = i;
            getTaskList();
        }
		
		const loading = ref(false);
        const getTaskList = async () => {// 任务列表
		    loading.value = true;
            taskList.value = [];
            checkAllList.value = [];
            // pages.value = 0;
            // total.value = 0;

            const { result, status } = await camera.taskListV3(stage.value, code, filterDevice.value, filterStatus.value, genealogyName.value, hall.value, gcKey.value, publish.value, fileName.value, keyWord.value, volumeNumber.value, claim.value, page.value, limit);
            loading.value = false;
			if(status == 200){
                result.list.forEach((ele) => {
					ele.volumeSortArrayL = ele.volumeSortArray ? ele.volumeSortArray.length : 0;
					ele.publicTaskO = ele.publicTask ? '公开' : '私有';
                    ele.takeStatusO = stageO[ele.takeStatus];
                    
                    ele.clientUser = ele.deviceInfo ? ele.deviceInfo.device+'('+(ele.deviceInfo.userName || '')+')' : '';
                    // 剩余天数
                    ele.checkDoneTimeO = ele.takeStatus >= 7 && ele.takeStatus != 12 ? '' : ele.checkDoneTime ? Math.ceil(taskdays.value - getSurplusDays(ele.checkDoneTime)) : '';
                    // 剩余天数少于10天 橘色标志，少于3天 红色标识 (待拍摄-已打回)
                    if(ele.checkDoneTimeO !== '' && ele.takeStatus >= 1 && ele.takeStatus <= 6){
                        if(ele.checkDoneTimeO <= 10){
                            ele.isOrange = true;
                        }
                        if(ele.checkDoneTimeO <= 3){
                            ele.isRed = true;
                        }
                    }
					if(ele.reason){
						ele.isRed = true;
					}
					ele.beginTakeTimeO = ele.beginTime ? getLocalTime(ele.beginTime) : '';
					ele.doneTimeO = ele.doneTime ? getLocalTime(ele.doneTime) : '';
                    ele.checkDoneTimeL = getLocalTime(ele.checkDoneTime);
                    ele.claimTimeO = getLocalTime(ele.claimTime);
                    ele.syncDoneTimeO = getLocalTime(ele.syncDoneTime);
                    ele.submitTimeO = getLocalTime(ele.submitTime);
                    ele.returnTimeO = ele.returnTime ? getLocalTime(ele.returnTime) : '';
					ele.toVoidTimeO = ele.toVoidTime ? getLocalTime(ele.toVoidTime) : '';
                    // 任务耗时
                    ele.passTimeL = ele.passTime ? ((ele.passTime - ele.claimTime)/1000/60/60/24).toFixed(2) : '';
                    // 审阅时间
                    ele.passTimeO = ele.passTime ? getLocalTime(ele.passTime) : '';
                    ele.payTimeO = ele.payTime ? getLocalTime(ele.payTime) : '';
                    ele.price = ele.totalPages ? (ele.totalPages*0.18).toFixed(2) : '';
                    ele.bill = ele.takeStatus >= 8 ? '是' : '';
                    ele.balance = ele.takeStatus >= 9 ? '是' : '';
                    ele.pay = ele.takeStatus >= 10 ? '是' : '';
                    ele.file = ele.takeStatus >= 11 ? '是' : '';
                    // 拍摄耗时 未完成 当前时间 - 领取时间  已完成 完成时间 - 领取时间
                    ele.shootTime = ele.claimTime ? (((ele.takeDoneTime || Date.now()) - ele.claimTime)/1000/60/60/24).toFixed(2) : '';
                });
                taskList.value = result.list;
                pages.value = result.pageNum;
                total.value = result.total;
            }else{

            }
        }

        const statisticsDataO = ref({});
        const statisticsData = async () => {// 统计数据
            const result = await camera.statisticsData(code);
            if(result.status == 200){
                statisticsDataO.value = result.data;
            }
        }
        // 多选列表
        const checkAllList = ref([]);
        // 是否多选
        const handleCheck = (data) => {
            let i = checkAllList.value.indexOf(data._key);
            if(i > -1){
                checkAllList.value.splice(i, 1);
            }else{
                checkAllList.value.push(data._key);
            }
        }
        // 全部、取消全部
        const handleCheckAll = () => {
            if(checkAllList.value.length){
                checkAllList.value = [];
            }else{
                let checkAllL = [];
                taskList.value.forEach((ele) => {
					checkAllL.push(ele._key);
                });
                checkAllList.value = checkAllL;
            }
        }
        // 创建发票 => 操作
        const createBill = () => {
            if(checkAllList.value.length){
                addCameraBill(checkAllList.value);
            }else{
                createMsg('请勾选任务');
            }
        }
        // 创建发票 => api
        const addCameraBill = async (catalogKeyArr) => {
            const result = await camera.addCameraBill(code, catalogKeyArr);
            if(result.status == 200){
                getTaskList();
            }else{
                createMsg(result.msg);
            }
        }

        // table
        const thead = ref(['checkAll', 'ID', '文件标题', '谱名', '谱籍地', '堂号', '出版时间', '应有卷数', '查重完成日', '剩余天数', '谱目类型', '操作']);
        const parameter = ref(['check', '_key', 'fileName', 'genealogyName', 'place', 'hall', 'publish', 'volume', 'checkDoneTimeL', 'checkDoneTimeO', 'publicTaskO']);

        watch(stage, (nv, ov) => {
            console.log(nv);
            switch(nv){
                case 1:
                    thead.value = ['checkAll', 'ID', '文件标题', '谱名', '谱籍地', '堂号', '出版时间', '应有卷数', '查重完成日', '剩余天数', '谱目类型', '操作'];
                    parameter.value = ['check', '_key', 'fileName', 'genealogyName', 'place', 'hall', 'publish', 'volume', 'checkDoneTimeL', 'checkDoneTimeO', 'publicTaskO'];
                    break;
                case 2:
                    thead.value = ['ID', '文件标题', '谱名', '谱籍地', '堂号', '出版时间', '应有卷数', '剩余天数', '认领时间', '谱目类型', '已建卷册', '操作'];
                    parameter.value = ['_key', 'fileName', 'genealogyName', 'place', 'hall', 'publish', 'volume', 'checkDoneTimeO', 'claimTimeO', 'publicTaskO', 'volumeSortArrayL'];
                    break;
                case 3:// 拍摄中
                    thead.value = ['谱ID', '文件标题', '谱名', '应有卷数', '卷ID', '卷名', '实拍页数', '拍摄时间', '操作'];
                    parameter.value = ['_key', 'fileName', 'genealogyName', 'volume', 'volumeKey', 'volumeNumber', 'takePages', 'beginTakeTimeO'];
                    break;
                case 4: // 自检中
                    thead.value = ['谱ID', '文件标题', '谱名', '应有卷数', '卷ID', '卷名', '实拍页数', '拍摄完成时间', '操作'];
                    parameter.value = ['_key', 'fileName', 'genealogyName', 'volume', 'volumeKey', 'volumeNumber', 'takePages', 'doneTimeO'];
                    break;  
                case 5: // 同步中
                    thead.value = ['谱ID', '文件标题', '谱名', '应有卷数', '卷ID', '卷名', '实拍页数', '同步页数', '自检完成时间', '操作'];
                    parameter.value = ['_key', 'fileName', 'genealogyName', 'volume', 'volumeKey', 'volumeNumber', 'takePages', 'syncPages', 'claimTimeO'];
                    break;
                case 13: // 机构审核
                    thead.value = ['谱ID', '文件标题', '谱名', '应有卷数', '卷ID', '卷名', '实拍页数', '同步页数', '拍机提交日期', '操作'];
                    parameter.value = ['_key', 'fileName', 'genealogyName', 'volume', 'volumeKey', 'volumeNumber', 'takePages', 'syncPages', 'submitTimeO'];
                    break;
                case 6:// 微站审核
				    thead.value = ['谱ID', '文件标题', '谱名', '应有卷数', '卷ID', '卷名', '实拍页数', '同步页数', '机构提交日期', '操作'];
				    parameter.value = ['_key', 'fileName', 'genealogyName', 'volume', 'volumeKey', 'volumeNumber', 'takePages', 'syncPages', 'submitTimeO'];
                    break;
                case 7: // 打回
                    thead.value = ['谱ID', '文件标题', '谱名', '应有卷数', '卷ID', '卷名', '实拍页数', '同步页数', '打回原因', '打回时间', '操作'];
                    parameter.value = ['_key', 'fileName', 'genealogyName', 'volume', 'volumeKey', 'volumeNumber', 'takePages', 'syncPages', 'returnReason', 'returnTimeO'];
                    break;  
                case 8: // 完成
                    thead.value = ['谱ID', '文件标题', '谱名', '应有卷数', '卷ID', '卷名', '实拍页数', '同步页数', '通过时间', '操作'];
                    parameter.value = ['_key', 'fileName', 'genealogyName', 'volume', 'volumeKey', 'volumeNumber', 'takePages', 'syncPages', 'passTimeO'];
                    break;   
                case 9: // 发票
                    thead.value = ['checkAll', 'ID', '文件标题', '资料名', '谱籍地', '应有卷数', '实拍卷数', '实拍页数', '通过页数', '拍摄者', '结算金额', '付款日期', '已开发票', '已结算', '已收款', '已归档'];
                    parameter.value = ['check', '_key', 'fileName', 'genealogyName', 'place', 'volume', 'actualVolumes', 'totalPages', 'totalPages', 'clientUser', 'price', 'payTimeO', 'bill', 'balance', 'pay', 'file'];
                    break;   
				case 17: // 作废
				    thead.value = ['谱ID', '文件标题', '谱名', '应有卷数', '卷ID', '卷名', '实拍页数', '同步页数', '作废时间', '作废人', '操作'];
				    parameter.value = ['_key', 'fileName', 'genealogyName', 'volume', 'volumeKey', 'volumeNumber', 'takePages', 'syncPages', 'toVoidTimeO', 'toVoidUserName'];
				    break;
            }
        });
		
		// 确认删除
		const isConfirm = ref(0);
		const changeConfirm = (f) => {
		    if(f){
				if(isConfirm.value == 1){
					patchClaimBatch();
				}else if(isConfirm.value == 4){
					initImageJson(4);
				}else if(isConfirm.value == 5){
					initImageJson(5);
				}else if(isConfirm.value == 6){// 删除卷册确认
					deleteVolume();
				}else{
					taskClaim(isConfirm.value);
				}
		    }
			isConfirm.value = 0;
		}
		
		const taskClaimConfirm = (key) => {
			isConfirm.value = key;
		};

        const taskClaim = async (catalogKey) => {// 领取
		    const result = await camera.taskClaim(code, catalogKey);
			if(result.status == 200){
				page.value = 1;
				makeCameraDir(drive+'/'+device+'/'+catalogKey);
				// sftpmkdir(device+'/'+catalogKey);
				getTaskList();
				statisticsData();
			}else{
				createMsg(result.msg);
			}
        }
		
		const patchStatusBatch = async (status) => {// 一键提交审阅
			const result = await camera.patchStatusBatch(code, status);
			if(result.status == 200){
				page.value = 1;
				getTaskList();
				statisticsData();
				if(status == 3){
					getVolumeNotTotalSync();
				}
				
			}else{
				createMsg(result.msg);
			}
		}
		
		const patchClaimBatchConfirm = () => {
			if(!checkAllList.value.length){
				return createMsg('请勾选任务！');
			}
			isConfirm.value = 1;
		}
		
		const patchClaimBatch = async () => {// 批量领取
			const result = await camera.patchClaimBatch(code, checkAllList.value);
			if(result.status == 200){
			    page.value = 1;
				checkAllList.value.forEach((ele) => {
					makeCameraDir(drive+'/'+device+'/'+ele);
				});
				checkAllList.value = [];
			    getTaskList();
			    statisticsData();
			}else{
			    createMsg(result.msg);
			}
        }

        const taskGiveUp = async (catalogKey) => {// 放弃、拍摄
            const result = await camera.taskGiveUp(code, catalogKey);
            if(result.status == 200){
                getTaskList();
                statisticsData();
            }else{
                createMsg(result.msg);
            }
        }
		
		// 更新卷册状态信息
		const patchVolumeStatus = async (volumeKey, status) => {
			const result = await camera.patchVolumeStatus(code, volumeKey, status);
			if(result.status == 200){
				if(status == 4){
					getVolumeNotTotalSync();
				}
				statisticsData();
				getTaskList();
			}else{
				createMsg(result.msg);
			}
		}
		
        const taskstatus = async (catalogKey, status) => {// 更改状态
            const result = await camera.taskstatus(code, catalogKey, status);
            if(result.status == 200){
                if(stage.value == 5){
                    stage.value = 13;
                }else{
                    stage.value++;
                }
                statisticsData();
                getTaskList();
            }else{
                createMsg(result.msg);
            }
        }

        const notReadMessageNumberHandle = async () => {// 未读消息统计
            const result = await camera.notReadMessageNumber(code);
            if(result.status == 200){
                changePropertyValue('notReadMsgNumber', result.result);
            }else{
                createMsg(result.msg);
            }
        }

        const goCamera = (key) => {// 进入拍摄中心
            router.push('/cameraCenter?id='+key);
        }
		
		const goImage = (data) => {// 进入影像中心
			router.push('/imageCenter?g='+data._key+'&v='+data.volumeKey+'&s='+data.volumeTakeStatus+'&n='+data.genealogyName);
		}

        const isShow = ref('');

        const closeDisk = (s) => {
            isShow.value = 0;
            console.log(s,device);
            if(s){
                makeCameraDir(s+'/'+device);
            }
        }

        const logout = () => {
            setValue('token', '');
            changePropertyValue('token', '');
			setValue('deviceKey', '');
			setValue('deviceID', '');
			setValue('device', '');
            nextTick(() => {
                router.push('/');
            });
        }
		
		// 获取未上传卷册列表
		const getVolumeNotTotalSync = async () => {
			const result = await camera.getVolumeNotTotalSync(code);
			if(result.status == 200){
				changePropertyValue('uploadVolumeTotal', result.total);
				changePropertyValue('uploadVolumeList', result.data);
			}
		}

        onMounted(() => {
            loginIO();
            status === 'undefined' ? status = 0 : null; 
            stage.value = Number(status)+1;
            if(isAdmin){
                thead.value = ['ID', '资料名', '谱籍地', '应有卷数', '查重完成日', '剩余天数', '状态', '认领人'];
                parameter.value = ['_key', 'genealogyName', 'place', 'volume', 'checkDoneTimeL', 'checkDoneTimeO', 'takeStatusO', 'clientUser'];
                stageList.value = [{'name': '任务池', 'img': img0, 'stage': 1, i: '0'},
                    {'name': '待拍摄', 'img': img1, 'stage': 2, i: 1},
                    {'name': '拍摄中', 'img': img2, 'stage': 3, i: 2},
                    {'name': '自检完成', 'img': img3, 'stage': 4, i: 3},
                    {'name': '同步完成', 'img': img4, 'stage': 5, i: 4},
                    {'name': '机构审阅', 'img': img5, 'stage': 13, i: 12},
                    {'name': '微站审阅', 'img': img5, 'stage': 6, i: 5},
                    {'name': '已打回', 'img': img6, 'stage': 7, i: 6},
                    {'name': '完成', 'img': img7, 'stage': 8, i: 7},
                    {'name': '结算', 'img': img8, 'stage': 9, i: 9},
					{'name': '作废', 'img': img8, 'stage': 17, i: 16}];
                memuList.value = [{'name': '拍摄者切换', 'path': '/authentication'},
                    {'name': '拍摄者管理', 'path': '2'},
                    {'name': '付款', 'path': '4'}];
            }else{
                // 选择盘符 才可以创建文件夹
                if(drive){
                    makeCameraDir(drive+'/'+device);
                }else{
                    createMsg('请选择空间大的盘符');
                    changeMenu({'name': '设置', 'path': '1'});
                }
            }
            notReadMessageNumberHandle();
            getTaskList();
            statisticsData();
			getVolumeNotTotalSync();
			
			// testOverTime();
        });
		
		const testOverTime = async () => {
			try{
				const result = await camera.testOverTime();
			}catch(e){
				console.log(e);
			}
		}
		
		// 打开文件夹
		const openVolumeDialog = (data) => {
			openPath(drive+'\\'+device+'\\'+data._key+'\\'+data.volumeKey);
		}
		
		let catalogKey = '', volumeKey = '';
		const initImageJsonConfirm = (data, f = 4) => {
			console.log(f);
			if(f == 4){
				return;
			}
			volumeKey = data.volumeKey;
			catalogKey = data._key;
			isConfirm.value = f;
		}
		
		const initImageJson = (data) => {// 初始化卷册文件夹里面的图片，生成json;并且拍摄完成改卷册
		    // data => 4: 打回 影像初始化；5:拍摄中 影像初始化
			loading.value = true;
			
			readDirGetFileNames(drive+'/'+device+'/'+catalogKey+'/'+volumeKey, (res) => {
				console.log(res);
				if(res == 'error'){
					loading.value = false;
					return createMsg('初始化失败，请稍后再试');
				}else{
					let imageList = [], list = [];
					res.forEach((ele, i) => {
						if(ele.indexOf('jpg') > -1){
							if(ele.indexOf('merge') > -1){
								list.push({'name': ele, 'i': Number(ele.substring(ele.lastIndexOf('_')+1, ele.lastIndexOf('.')))});
							}else{
								// 'nail': '/'+device+'/'+catalogKey+'/'+volumeKey+'_nail/'+ele, 
								imageList.push({'name': '/'+device+'/'+catalogKey+'/'+volumeKey+'/'+ele, 'success': '', 'outside': 1});
							}
						}
					});
					// 部分影像编号0、1、2、10初始化顺序错误
					if(list && list.length){
						list = list.sort((a, b) => {return a.i - b.i});
						list.forEach((ele) => {
							imageList.push({'name': '/'+device+'/'+catalogKey+'/'+volumeKey+'/'+ele.name, 'success': '', 'outside': 1});
						})
					}
					
					// console.log(imageList);
					if(!imageList.length){
						loading.value = false;
						return createMsg('请在相应卷册目录导入家谱');
					}
					writeFile(drive+'/'+device+'/'+catalogKey+'/'+volumeKey+'/image.json', JSON.stringify(imageList), 'w', () => {});
					// 更新卷册实拍页数
					loading.value = false;
					patchVolumeInfo(volumeKey, imageList.length, '', data);
				}
			});
		}
		
		// 更新卷册信息=>实拍页数、同步累计时间
		const patchVolumeInfo = async (vid, takePages, syncTime, f = 0) => {
			const result = await camera.patchVolumeInfo(code, vid, takePages, syncTime);
			loading.value = false;
			if(result.status == 200){
				if(f == 4){
					createMsg('初始化成功', true);
					patchVolumeStatus(vid, 4);
				}
				if(f == 5){
					createMsg('影像初始化成功', true);
					patchVolumeStatus(vid, 3);
				}
			}else{
				createMsg(result.msg);
			}
		}
		
		// 谱目编辑
		const catalogDetail = ref({});
		const handleEditCatalog = (data) => {
            isCatalog.value = 2;
			isShow.value = 7;
			data['isLeadImages'] = data['GCIsLeadImages'] || '0';
			data['singleOrTwo'] = data['GCSingleOrTwo'] || '2';
			catalogDetail.value = data;
		}
		
		const closeCatalog = (O) => {
			isShow.value = 0;
            console.log(O);
			if(O.data){
                if(O._key){
                    updateCatalog(O.data);
                }else{
                    directTakeCatalog(O.data);
                }
			}
		}
		
		const updateCatalog = async (patchData) => {// 编辑家谱 -> 关键字有变化，查重
		    loading.value = true;
		    const result = await camera.updateCatalog(code, catalogDetail.value._key, patchData);
			loading.value = false;
		    if(result.status == 200){
		        getTaskList();
		    }else{
		        createMsg(result.msg);
		    }
		}

        const directTakeCatalog = async (catalogData) => {
            loading.value = true;
		    const result = await camera.directTakeCatalog(code, catalogData);
			loading.value = false;
		    if(result.status == 200){
		        getTaskList();
		    }else{
		        createMsg(result.msg);
		    }
        }
		
		// 新增卷册
		const internalSerialNumber = ref(0);
		const volumeDetail = ref({});
		const handleAddVolume = (data) => {
			data['isLeadImages'] = data['GCIsLeadImages'] || '0';
			data['singleOrTwo'] = data['GCSingleOrTwo'] || '2';
			catalogDetail.value = data;
			volumeDetail.value = {};
			internalSerialNumber.value = catalogDetail.value.volumeSortArray ? catalogDetail.value.volumeSortArray.length : 0;
		    isShow.value = 8;
		}
		
		const closeVolume = (data) => {
			isShow.value = 0;
			console.log(data);
			if(data && !data._key){
				loading.value = true;
			    addVolume(data.volumeNumber, data.internalSerialNumber, data.isLeadImages, data.electronicCopy, data.singleOrTwo, data.memo, data.imageSource, data.DorProjectID, data.DorMediaID);
			}
			if(data && data._key){
				loading.value = true;
				editVolume(data._key, data.volumeNumber, data.internalSerialNumber, data.isLeadImages, data.electronicCopy, data.singleOrTwo, data.memo, data.imageSource, data.DorProjectID, data.DorMediaID);
			}
		}
		
		const addVolume = async (volumeNumber, internalSerialNumber, isLeadImages, electronicCopy, singleOrTwo, memo, imageSource, DorProjectID, DorMediaID) => {// 新增卷册
		    const result = await camera.addVolume(code, catalogDetail.value._key, volumeNumber, internalSerialNumber, isLeadImages, electronicCopy, singleOrTwo, memo, imageSource, DorProjectID, DorMediaID);
		    if(result.status == 200){
		        makeCameraDir(drive+'/'+device+'/'+catalogDetail.value._key+'/'+result.data);
				makeCameraDir(drive+'/'+device+'/'+catalogDetail.value._key+'/'+result.data+'_nail');
		        // sftpmkdir(device+'/'+catalogDetail.value._key+'/'+result.data);
		
				let volumeSortArray = catalogDetail.value.volumeSortArray || [];
				volumeSortArray.push(result.data);
				// console.log(volumeSortArray, catalogDetail.value._key);
		        sortGCVolume(volumeSortArray);
				patchVolumeStatus(result.data, 2);
				
				router.push('/imageCenter?g='+catalogDetail.value._key+'&v='+result.data+'&s=2');
		    }else{
		        createMsg(result.msg);
		    }
		}
		
		const sortGCVolume = async (volumeSortArray, f = true) => {//卷册排序
		    const result = await camera.sortGCVolume(code, catalogDetail.value._key, volumeSortArray);
		    if(result.status == 200){
		        // createMsg('新建卷册成功', true);
				loading.value = false;
		    }else{
		        createMsg(result.msg);
		    }
		}
		
		// 编辑卷册 - 打开
		const handleEditVolume = (data) => {
			isShow.value = 9;
			catalogDetail.value = data;
			volumeDetail.value = {
				'_key': data.volumeKey,
				'volumeNumber': data.volumeNumber,
				'isLeadImages': data.isLeadImages,
				'singleOrTwo': data.singleOrTwo,
				'internalSerialNumber': data.internalSerialNumber,
				'memo': data.volumeMemo,
				'imageSource': data.imageSource,
				'DorProjectID': data.DorProjectID,
				'DorMediaID': data.DorMediaID,
			};
			// volumeDetail.value._key = data.volumeKey;
		}
		// 编辑卷册
		const editVolume = async (volumeKey, volumeNumber, internalSerialNumber, isLeadImages, electronicCopy, singleOrTwo, memo, imageSource, DorProjectID, DorMediaID) => {// 编辑卷册
		    loading.value = true;
			const result = await camera.editVolumeNumber(code, volumeKey, volumeNumber, internalSerialNumber, isLeadImages, electronicCopy, singleOrTwo, memo, imageSource, DorProjectID, DorMediaID);
		    if(result.status == 200){
		        createMsg('编辑卷册成功', true);
		        loading.value = false;
				getTaskList();
		    }else{
		        createMsg(result.msg);
		    }
		}
		
		// 删除卷册确认
		const handleDeleteVolume = (data) => {
			if(data.takePages){
				return createMsg('该卷册已拍摄影像，需要先手动删除影像才可以删除卷册！');
			}
			isConfirm.value = 6;
			catalogDetail.value = data;
		}
		
		const deleteVolume = async () => {// 删除卷册
		    loading.value = true;
		    const result = await camera.deleteVolume(code, catalogDetail.value.volumeKey);
			loading.value = false;
		    if(result.status == 200){
				// 删除本地卷册文件夹
				removeDir(drive+'/'+device+'/'+catalogDetail.value._key+'/'+catalogDetail.value.volumeKey);
				// 删除本地卷册缩略图文件夹
				removeDir(drive+'/'+device+'/'+catalogDetail.value._key+'/'+catalogDetail.value.volumeKey+'_nail');
				// 删除服务器卷册文件夹
				// sftprmdir(device+'/'+catalogDetail.value._key+'/'+catalogDetail.value.volumeKey);
						
				let volumeSortArray = [];
				catalogDetail.value.volumeSortArray.forEach((ele) => {
					if(ele != catalogDetail.value.volumeKey){
						volumeSortArray.push(ele);
					}
				});
				sortGCVolume(volumeSortArray);
				getTaskList();
				statisticsData();
		    }else{
		        createMsg(result.msg);
		    }
		}
		
		// 上传原因更新
		const patchUpdateReason = async (volumeKey) => {
			loading.value = true;
			const result = await camera.patchUpdateReason(volumeKey, '');
			loading.value = false;
			if(result.status == 200){
				getVolumeNotTotalSync();
				getTaskList();
			}else{
			    createMsg(result.msg);
			}
		}

        // 创建离线家谱 不需要查重可直接拍摄 无法自检完成
        const isCatalog = ref(1);
        const createOfflineCatalog = () => {
            isCatalog.value = 3;
            isShow.value = 7;
            catalogDetail.value = {};
        }

        // 初始化程序打开
        const openInitCamera = () => {
            // viewProcessMessage('demo_capture.exe');
            window.NikonClip = '';
            window.initCamera = openNikon('/initCamera/InitCamera2', (data) => {
			    console.log(`stdout: ${data}`);
				// changePropertyValue('NikonData', data);
			});
        }

        return {
            isShow, stageList, stage, changeStage, memuList, isMenu, changeMenu, orgName, device, initImageJsonConfirm, 
            thead, parameter, taskList, stageO, taskClaim, taskGiveUp, goCamera, goImage, deviceID, isAdmin, 
            taskstatus, userName, checkAllList, handleCheck, handleCheckAll, createBill, closeDisk, volumeNumber,
            avatarImg, avatar, notReadMsgNumber, logout, page, pages, total, changePage, statisticsDataO, 
			patchVolumeStatus, genealogyName, hall, publish, getTaskList, patchClaimBatch, fileName, loading, 
			keyWord, patchStatusBatch, isConfirm, changeConfirm, taskClaimConfirm, patchClaimBatchConfirm, openVolumeDialog,
			handleEditCatalog, catalogDetail, closeCatalog, handleAddVolume, closeVolume, handleAddVolume, internalSerialNumber, 
			handleEditVolume, volumeDetail, handleDeleteVolume, patchUpdateReason, claimList, claim, changeClaim,
			gcKey, createOfflineCatalog, isCatalog, openInitCamera, 
        }
    }
}
</script>

<style lang="scss" scoped>
.task-center-wrap{
    position: relative;
    width: 100%;
    height: calc(100% - 20px);
    color: #333;
    font-size: 14px;
	padding-top: 20px;
}
.task-center-head{
    position: relative;
    width: calc(100% - 40px);
    height: 40px;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #333;
    color: #fff;
    z-index: 100;
    .head-user{
        position: relative;
        display: flex;
        align-items: center;
        background: #85B83E;
        color: #fff;
        padding: 2px 5px;
        min-width: 100px;
        cursor: pointer;
        .avatar{
            display: block;
            margin-right: 10px;
            height: 30px;
        }
        .menu-wrap{
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: rgba(216,216,216,0.70);
            backdrop-filter: blur(10px);
            color: #000;
            text-indent: 20px;
            li{
                height: 30px;
                line-height: 30px;
                cursor: pointer;
                &:hover{
                    color: #85B83E;
                }
            }
        }
    }
    .head-title{
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
        font-size: 14px;
    }
    .head-msg{
        position: relative;
        display: flex;
        align-items: center;
        .msg{
            cursor: pointer;
            display: block;
        }
        i{
            position: absolute;
            top: -2px;
            right: -5px;
            color: #fff;
            font-size: 8px;
            padding: 0 2px;
            border-radius: 5px;
            background: #f00;
        }
    }
}
.task-center-content{
    position: relative;
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    .step-wrap{
        width: calc(100% - 40px);
        display: block;
        height: 100%;
        padding: 0 20px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        font-size: 14px;
        li{
            text-align: center;
            cursor: pointer;
            height: 100%;
            &.active{
                color: #85B83E;
                height: calc(100% - 4px);
                border-bottom: 4px solid #85B83E;
            }
            .img{
                height: 40px;
                display: block;
                margin: 15px auto 5px auto;
            }
        }
    }
}
.create-bill-wrap{
    position: relative;
    width: calc(100% - 40px);
    height: 40px;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .create-bill-btn{
        width: 100px;
        height: 30px;
        line-height: 30px;
        border-radius: 15px;
    }
}
.task-center-foot{
    position: relative;
    width: 100%;
    height: calc(100% - 180px);
    overflow-y: auto;
    &.active{
        height: calc(100% - 220px);
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
    i{
        color: #000;
        &.check{
            width: 14px;
            height: 14px;
            display: inline-block;
            border: 1px solid #999;
            border-radius: 3px;
            cursor: pointer;
            &.active{
                width: 16px;
                height: 16px;
                border: none;
                background: #85B83E;
            }
            &.some{
                position: relative;
                width: 14px;
                height: 14px;
                border: 1px solid #999;
                background: #D1D1D1;
                &::after{
                    content: '';
                    position: absolute;
                    top: 3px;
                    right: 3px;
                    bottom: 3px;
                    left: 3px;
                    background: #85B83E;
                }
            }
        }
		&.btn-i{
			color: #85B83E !important;
			margin: 0 2px;
			&.disabled{
				color: #ddd !important;
				background: #fff !important;
			}
		}
    }
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
                padding: 5px 0;
                min-width: 60px;
            }
        }
    }
    .tbody{
        position: relative;
        width: 100%;
        height: calc(100% - 42px);
        tr{
            cursor: pointer;
            &:nth-of-type(even){
                background: #F2F2F2;
            }
            &:hover{
                background: #DBE6CC;
            }
            &.orange{
                i{
                    color: orange;
                }
            }
            &.red{
                i{
                    color: #f00;
                }
            }
            td{
                padding: 5px 0;
                min-width: 60px;
                max-width: 250px;
            }
        }
    }
    .btn{
        padding: 0 10px;
        width: auto;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
    }
    .marginR10{
        margin-right: 10px;
    }
}
.jiapu-search{
	position: relative;
	width: calc(100% - 40px);
	padding: 0 20px;
	height: 40px;
	display: flex;
	align-items: center;
	input{
		width: 100px;
		height: 30px;
		line-height: 30px;
		margin-right: 10px;
		&.w150{
			width: 150px;
		}
	}
	.btn{
		width: 100px;
		height: 30px;
		line-height: 30px;
		border-radius: 15px;
	}
}
.marginL10{
	margin-left: 10px;
}
.foot-wrap{
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	.label{
		width: 250px;
		padding-left: 10px;
		font-weight: bold;
	}
}
.width130{
	width: 110px;
	border: 1px solid #ddd;
}
.disabled{
	background: #ddd;
}
.samll{
    width: 120px;
    height: 30px;
    line-height: 30px;
    border-radius: 15px;
}
.marginR10{
    margin-right: 10px;
}
</style>