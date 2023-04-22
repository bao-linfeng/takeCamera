<template>
    <div class="disk-manage-wrap">
        <div class="disk-manage-head">
            <h3 class="title">付款单</h3>
            <img class="close" @click="close" src="../assets/close.svg" alt="">
        </div>
        <div class="disk-manage-content">
            <h3 class="title">发票记录</h3>
            <table class="table">
                <thead class="thead">
                    <tr>
                        <th v-for="(item, index) in theadV" :key="'thead_'+index">{{item}}</th>
                    </tr>
                </thead>
                <tbody class="tbody">
                    <tr v-for="(item, index) in tbody" :key="'tbody_'+index">
                        <td v-for="(item2, index2) in parameterV" :key="'parameter_'+index2" @click="singleClick($event, item, item2)">
                            <div v-if="item2 === 'action'">
                                <button v-if="item.status == 1" class="btn" @click="updateCollection(item._key)">收款</button>
                                <button v-if="item.status == 2" class="btn" @click="updateCollection(item._key)">归档</button>
                            </div>
                            <i :class="{active: item2 === 'gcNum'}" v-else>{{item[item2]}}</i>
                            <table class="task-table" v-if="item2 === 'gcNum' && billKeyActive == item._key" @click.stop="">
                                <thead>
                                    <tr>
                                        <td>ID</td>
                                        <td>谱名<img class="task-close" @click="taskClose" src="../assets/close.svg" alt=""></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item3, index3) in billDetailList" :key="index3">
                                        <td>{{item3._key}}</td>
                                        <td>{{item3.genealogyName}}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <ConfirmModuleVue v-if="billKey" v-on:change-confirm="changeConfirm" />
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { camera } from '../util/api';
import { createMsg, getLocalTime } from '../util/ADS';
import ConfirmModuleVue from './ConfirmModule.vue';

export default {
    components: {
        ConfirmModuleVue, 
    },
    props:{
        device: Object
    },
    emits: ['close'],
    setup(props, context) {
        const { userKey, siteKey, code } = useState();
        const router = useRouter();
        
        const theadV = ref(['创建日期', '谱数', '卷册', '页册', '金额', '状态', '操作']);
        const parameterV = ref(['timeO', 'gcNum', 'volumeNum', 'imageNum', 'fee', 'statusO', 'action']);

        const tbody = ref([]);
        const getCameraBill = async () => {
            const result = await camera.getCameraBill(code);
            if(result.status == 200){
                tbody.value = result.data.map((ele) => {
                    ele.fee = (ele.fee).toFixed(2);
                    ele.timeO = getLocalTime(ele.time);
                    ele.statusO = ele.status == 3 ? '已归档' : ele.status == 2 ? '已收款' : ele.status == 1 ? '已结算' : '已开发票';
                    return ele;
                });
            }else{
                createMsg(result.msg);
            }
        }

        const billDetailList = ref([]);
        const billKeyActive = ref('');
        const getBillDetail = async (key) => {
            const result = await camera.getBillDetail(code, key);
            if(result.status == 200){
                billDetailList.value = result.data.catalogList;
            }else{
                createMsg(result.msg);
            }
        }

        const taskClose = () => {
            billKeyActive.value = '';
            billDetailList.value = [];
        }

        const singleClick = (e, item, item2) => {
            if(billKeyActive.value == item._key){
                billKeyActive.value = '';
                billDetailList.value = [];
            }else{
                if(item2 === 'gcNum'){
                    billKeyActive.value = item._key;
                    getBillDetail(item._key);
                }
            }
        }
        // 更新批次列表状态
        const updateBillCollection = async (key) => {
            const result = await camera.updateBillCollection(code, key);
            if(result.status == 200){
                getCameraBill();
            }else{
                createMsg(result.msg);
            }
        }

        const billKey = ref('');
        const updateCollection = (key) => {
            billKey.value = key;
        }
        const changeConfirm = (isC) => {
            if(isC){
                updateBillCollection(billKey.value);
            }
            billKey.value = '';
        }

        const close = () => {
            context.emit('close', false);
        }

        onMounted(() => {
            getCameraBill();
        });

        return {
            theadV, parameterV, tbody, singleClick, close, billDetailList, 
            changeConfirm, billKey, updateCollection, billKeyActive, taskClose, 
        }
    }
}
</script>
<style lang="scss" scoped>
.disk-manage-wrap{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 500px;
    padding: 0 30px 30px 30px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 1px 10px 0px rgba(114,114,114,0.50); 
    z-index: 100;
    .disk-manage-head{
        position: relative;
        height: 40px;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        .close{
            position: absolute;
            top: 50%;
            right: 0;
            cursor: pointer;
            transform: translateY(-50%);
            background: #000;
        }
    }
    .disk-manage-content{
        position: relative;
        width: 100%;
    }
    .disk-manage-foot{
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
    .title{
        height: 40px;
        line-height: 40px;
        font-size: 14px;
    }
}
.table{
    position: relative;
    width: 100%;
    max-height: 400px;
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
                position: relative;
                padding: 5px 0;
                min-width: 80px;
                i{
                    color: #333;
                    &.active{
                        cursor: pointer;
                        color: #85B83E;
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
    }
    .marginR10{
        margin-right: 10px;
    }
}
.task-table{
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    width: 350px;
    background: rgba(216,216,216,0.70);
    box-shadow: 0px 0px 7px 0px rgba(27,27,27,0.50); 
    backdrop-filter: blur(10px);
    z-index: 100;
    &::before{
        content: '';
        position: absolute;
        top: 50%;
        left: -30px;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-top: 15px solid transparent;
        border-right: 15px solid rgba(216,216,216,0.70);
        border-bottom: 15px solid transparent;
        border-left: 15px solid transparent;
    }
    thead{
        font-weight: bold;
        tr{
            td{
                position: absolute;
                .task-close{
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    right: 10px;
                    background: #000;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>