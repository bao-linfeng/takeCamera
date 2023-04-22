<template>
    <div class="edit-device-wrap">
        <div class="edit-device-box">
            <h3 class="edit-head">编辑</h3>
            <ul class="edit-content">
                <li>
                    <span class="label">设置号</span>
                    <input type="text" v-model="deviceO.device" disabled />
                </li>
                <li>
                    <span class="label">拍摄员</span>
                    <SelectModule :list="userList" :defaultValue="deviceO.userKey" v-on:get-value="getUserValue" />
                    <!-- <input type="text" v-model="deviceO.clientUser" /> -->
                </li>
                <!-- <li>
                    <span class="label">手机号</span>
                    <input type="text" v-model="deviceO.mobile" />
                </li> -->
            </ul>
            <div class="edit-foot">
                <button class="btn" @click="close">取消</button>
                <button class="btn" @click="editDeviceByUser">保存</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject, onMounted } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { editDeviceApi } from '../composables/request';
import { camera } from '../util/api';
import { createMsg, getLocalTime } from '../util/ADS';
import SelectModule from './SelectModule.vue';
export default {
    components: {
        SelectModule,
    },
    props:{
        device: Object
    },
    emits: ['close'],
    setup(props, context) {
        const { userKey, siteKey, code, orgKey } = useState();
        const router = useRouter();
        const deviceO = ref({'_key': '','device':'', 'userKey': '', 'mobile': ''});

        watch(props.device, (nv, ov) => {
            deviceO.value = nv;
        });

        const userList = ref([]);
        const getOrgMember = async () => {
            const result = await camera.getOrgMember(orgKey);
            if(result.status == 200){
                userList.value = result.data.map((ele) => {
                    return {'label': ele.userName, 'value': ele._key}; 
                });
            }else{
                createMsg(result.msg);
            }
        }

        const getUserValue = async (data) => {
            console.log(data);
            deviceO.value.userKey = data.value; 
        }

        onMounted(() => {
            deviceO.value = props.device;
            console.log(deviceO.value);
            getOrgMember();
        });

        const editDeviceByUser = async () => {
            const result = await camera.editDeviceByUser(code, deviceO.value._key, deviceO.value.userKey);
            if(result.status == 200){
                context.emit('close', false);
            }else{
                createMsg(result.msg);
            }
        }

        const editDevice = () => {
            const { isToggle } = editDeviceApi(deviceO.value._key, deviceO.value.clientUser, deviceO.value.mobile);
            watch(isToggle, () => {
                context.emit('close', false);
            });
        }

        const close = () => {
            context.emit('close', false);
        }

        return {
            deviceO, editDevice, close, userList, getUserValue, editDeviceByUser, 
        }
    }
}
</script>
<style lang="scss" scoped>
.edit-device-wrap{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0,0,0,0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 101;
    .edit-device-box{
        padding: 20px;
        background: #fff;
        border-radius: 5px;
        .edit-head{
            text-align: center;
        }
        .edit-content{
            margin-top: 20px;
            li{
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                .label{
                    width: 60px;
                }
            }
        }
        .edit-foot{
            display: flex;
            justify-content: space-around;
            align-items: center;
            .btn{
                width: 150px;
                height: 30px;
                line-height: 30px;
                border-radius: 15px;
            }
        }
    }
}
</style>