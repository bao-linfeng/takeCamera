import { camera, user } from '../util/api';
import { ref, onMounted, reactive } from 'vue'
import { useState, changePropertyValue } from '../store';
import { setValue, createMsg } from '../util/ADS';

const getUserInfoApi = (token) => {
    const getUserInfo = async () => {
        const { result } = await user.getUserInfo(token);
        changePropertyValue('userKey', result._key);
        changePropertyValue('userName', result.profile && (result.profile.trueName || result.profile.nickName));
        changePropertyValue('profile', result.profile);
        changePropertyValue('avatar', result.profile.avatar);
        setValue('userKey', result._key);
        setValue('userName', result.profile && (result.profile.trueName || result.profile.nickName));
        setValue('profile', JSON.stringify(result.profile));
        setValue('avatar', result.profile && result.profile.avatar);
    }

    getUserInfo();
}

const getDeviceListApi = async (userKey, siteKey) => {
    const deviceList = ref([]);
    const getDeviceList = async () => {
        const { data } = await camera.getDeviceList(userKey, siteKey);
        deviceList.value = data.map((ele) => { return {'label': ele.device + '(' + ele.clientUser + ')', 'value': ele._key} });
    }

    onMounted(() => {
        getDeviceList();
    });

    return {
        deviceList
    }
}

const getSwitchCodeApi = (deviceKey, userKey, siteKey) => {
    const getSwitchCode = async () => {
        const { data } = await camera.getSwitchCode(deviceKey, userKey, siteKey);
    }

    onMounted(() => {
        getSwitchCode();
    });
}

const verfiyCodeApi = (deviceKey, code, userKey, siteKey) => {
    const CODE = ref('');
    const verfiyCode = async () => {
        const result = await camera.verfiyCode(deviceKey, code, userKey, siteKey);
        if(result.status == 200){
            CODE.value = code;
            changePropertyValue('code', code);
            setValue('code', code);
        }else{
            createMsg(result.msg);
        }
    }

    verfiyCode();

    return {
        CODE
    }
}

const editDeviceApi = (deviceKey, clientUser, mobile) => {
    const isToggle = ref(false);
    const editDevice = async () => {
        const result = await camera.editDevice(deviceKey, clientUser, mobile);
        if(result.status == 200){
            isToggle.value = true;
        }else{
            createMsg(result.msg);
        }
    }

    editDevice();

    return {
        isToggle
    }
}

export {
    getUserInfoApi,
    getDeviceListApi,
    getSwitchCodeApi, 
    verfiyCodeApi,
    editDeviceApi,
}