<template>
    <div class="child-device-wrap">
        <div class="child-device-box">
            <div class="child-device-head">
                <h3 class="head-title">拍摄者管理</h3>
                <img class="head-back" @click="goBack" src="../assets/close.svg" alt="关闭" />
            </div>
            <div class="child-device-content style1">
                <table class="table">
                    <thead class="thead">
                        <tr>
                            <th v-for="(item, index) in thead" :key="index">{{item}}</th>
                        </tr>
                    </thead>
                    <tbody class="tbody">
                        <tr v-for="(item, index) in deviceList" :key="index">
                            <td v-for="(item2, index2) in parameter" :key="index+''+index2">
                                <div class="action" v-if="item2 == 'action'">
                                    <button class="btn marginR10" @click="singleClick(item)">编辑</button>
                                    <button class="btn" @click="getSwitchCode(item)">重置密码</button>
                                </div>
                                <i v-else>{{item[item2]}}</i>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <EditDevice v-if="isDevice" :device="device" v-on:close="closeEdit" />
    </div>
</template>

<script>
import { ref, reactive, onMounted, watch, watchEffect, computed, provide,readonly, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useState } from '../store';
import { createMsg, getLocalTime } from '../util/ADS';
import { camera, user } from '../util/api';
import { getDeviceListApi } from '../composables/request';
import QuitModule from '../components/QuitModule.vue';
import TableModule from '../components/TableModule.vue';
import EditDevice from '../components/EditDevice.vue';

export default {
    components: {
        QuitModule, TableModule, EditDevice, 
    },
    name: 'childDevice',
    props: ['id'],
    emits: ['close'],
    setup(props, context) {
        const { userName, userKey, siteKey, orgKey } = useState();
        const router = useRouter();
        const id = props.id;

        const goBack = () => {
            context.emit('close', false);
        }

        const thead = ref(['设备号', '拍摄员', '机构', '最后登录时间', '操作']);
        const parameter = ref(['device', 'userName', 'orgName', 'loginTimeO', 'action']);

        const deviceList = ref([]);
        const getDeviceList = async () => {
            const { data } = await camera.getDeviceList(userKey, siteKey);
            deviceList.value = data.map((ele) => {
                ele.loginTimeO = ele.loginTime ? getLocalTime(ele.loginTime) : '';
                return ele;
            });
        }

        const getDeviceByOrg = async () => {
            const { data } = await camera.getDeviceByOrg(orgKey, siteKey, '');
            deviceList.value = data.map((ele) => {
                ele.loginTimeO = ele.loginTime ? getLocalTime(ele.loginTime) : '';
                return ele;
            });
        }
        onMounted(() => {
            // getDeviceList();
            getDeviceByOrg();
        });

        const getSwitchCode = async (data) => {
            const result = await camera.getSwitchCode(data._key, userKey, siteKey);
            if(result.status == 200){
                createMsg('拍机号 '+data.device+' 密码重置成功', true);
            }else{
                createMsg(result.msg);
            }
        }
        
        const device = ref({});
        const isDevice = ref(false);
        const singleClick = (d) => {
            device.value = d;
            isDevice.value = true;
        }

        const closeEdit = () => {
            isDevice.value = false;
            // getDeviceList();
            getDeviceByOrg();
        }

        return {
            goBack, deviceList, singleClick, device, isDevice, closeEdit,
            thead, parameter, getSwitchCode, 
        }
    }
}
</script>

<style lang="scss" scoped>
.child-device-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    color: #333;
    font-size: 14px;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    .child-device-box{
        position: relative;
        padding: 20px;
        background: #fff;
        border-radius: 10px;
        height: calc(100% - 80px);
    }
}
.child-device-head{
    position: relative;
    width: calc(100% - 40px);
    height: 40px;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .head-back{
        cursor: pointer;
        background: #000;
    }
}
.child-device-content{
    position: relative;
    width: 600px;
    height: calc(100% - 40px);
    overflow-y: auto;
}
.child-device-foot{
    position: relative;
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.table{
    position: relative;
    width: 100%;
    height: 100%;
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
            cursor: pointer;
            &:nth-of-type(even){
                background: #F2F2F2;
            }
            &:hover{
                background: #DBE6CC;
            }
            td{
                padding: 5px 0;
                min-width: 80px;
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
</style>