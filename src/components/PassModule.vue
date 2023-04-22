<template>
    <div class="pass-wrap">
        <p class="title">选择打回原因</p>
        <ul class="pass-reason">
            <li :class="{active: passReason.indexOf(item) > -1}" v-for="(item,index) in passReasonList" :key="index" @click="changeReason(item)">{{item}}</li>
        </ul>
        <input class="pass-input" type="text" v-model="reason" placeholder="自定义打回原因" />
        <button class="btn" @click="setPassReason">确定</button>
    </div>
</template>

<script>
import { createMsg, getQueryVariable } from '../util/ADS';
export default {
    name: "PassModule",
    props:{
        passReasonA: {
            type: Array
        }
    },
    data: () => {
        return {
            passReasonList: ['模糊', '缺页', '重复', '有异物', '不完整'],
            passReason: [],
            reason: '',
        };
    },
    mounted: function(){
        if(this.passReasonA.length == 1 && this.passReasonList.indexOf(this.passReasonA[0]) === -1){
            this.reason = this.passReasonA[0];
            this.passReason = [];
        }else{
            this.reason = '';
            this.passReason = this.passReasonA;
        }
    },
    methods:{
        changeReason(r){
            let i = this.passReason.indexOf(r);
            if(i > -1){
                this.passReason.splice(i, 1);
            }else{
                this.passReason.push(r);
            }
        },
        setPassReason(){
            if(this.reason){
                this.$emit('set-reason', this.reason);
                this.reason = '';
            }else{
                if(this.passReason.length){
                    this.$emit('set-reason', this.passReason.join());
                    this.passReason = [];
                }else{
                    createMsg('请勾选打回原因');
                }
            }
        },
    },
    watch:{
        'passReasonA': function(nv,ov){
            if(nv.length == 1 && this.passReasonList.indexOf(nv[0]) === -1){
                this.reason = nv[0];
                this.passReason = [];
            }else{
                this.reason = '';
                this.passReason = nv;
            }
        }
    }
};
</script>

<style scoped lang="scss">
.pass-wrap{
    position: absolute;
    top: 40px;
    right: 20px;
    padding: 0 20px 10px 20px;
    background: #D8D8D8;
    border-radius: 5px;
    font-size: 14px;
    color: #000;
    &::before{
        content: '';
        position: absolute;
        top: -16px;
        right: 20px;
        width: 0;
        height: 0;
        border-top: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid #D8D8D8;
        border-left: 8px solid transparent;
    }
    .title{
        height: 40px;
        line-height: 40px;
    }
    .pass-input{
        width: 100%;
        height: 30px;
        line-height: 30px;
        text-indent: 10px;
        border: none;
        outline: none;
        border-radius: 3px;
        display: block;
        margin-bottom: 10px;
        font-size: 14px;
    }
    .btn{
        border: none;
        outline: none;
        width: 88px;
        height: 34px;
        line-height: 34px;
        background: #358bcd;
        border: 1px solid #358bcd;
        border-radius: 4px;
        cursor: pointer;
        color: #fff;
    }
}
.pass-reason{
    position: relative;
    width: 100%;
    li{
        margin-bottom: 10px;
        cursor: pointer;
        &.active{
            color: #358bcd;
        }
    }
}
</style>

