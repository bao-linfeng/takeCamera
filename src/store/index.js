import { reactive, inject } from 'vue';
import {getValue} from '../util/ADS';

const stateSymbol = Symbol('state');

const state = reactive({ 
  token: getValue('token') || '',
  orgKey: getValue('orgKey') || '',
  orgName: getValue('orgName') || '',
  userKey: getValue('userKey') || '',
  userName: getValue('userName') || '',
  profile: getValue('profile') ? JSON.parse(getValue('profile')) : {},
  avatar: getValue('avatar') || '',
  siteKey: '1528234980',
  code: getValue('code') || '',
  isAdmin: getValue('isAdmin') || '',
  deviceKey: getValue('deviceKey') || '',
  deviceID: getValue('deviceID') || '',
  device: getValue('device') || '',
  ws: '',
  origin: window.location.origin || '',
  nikon: '',
  drive: getValue('drive') ||  '',
  notReadMsgNumber: 0,
  uploadIndex: 0,
  isProcess: false,
  cutText: 'stopCut\n',
  typename: getValue('typename') || '',
  cameraRotate: getValue('cameraRotate') || '180',
  uploadVolumeList: [],
  uploadVolumeTotal: 0,
  syncCount: 0,
  thumbnailH: getValue('thumbnailH') || 80,
  imagePath: '',
  NikonData: '',
});

const changePropertyValue = (property, value) => {
  state[property] = value;
}

const changeUserInfo = (property, value) => {
  state.userInfo[property] = value;
}

const useState = () => inject(stateSymbol);

export {
  stateSymbol,state,useState,changePropertyValue,changeUserInfo
}