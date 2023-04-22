<template>
    <table class="table-module-wrap">
        <thead class="thead">
            <tr>
                <th v-for="(item, index) in thead" :key="index">{{item.label}}</th>
            </tr>
        </thead>
        <tbody class="tbody">
            <tr v-for="(item, index) in tbody" :key="index" @click="clickhandle(item)">
                <td v-for="(item2, index2) in thead" :key="index+''+index2">{{item[item2.parameter]}}</td>
            </tr>
        </tbody>
    </table>
</template>

<script>
import { ref, reactive, toRefs, watch, inject } from 'vue';
import { changePropertyValue, useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
import { getSwitchCodeApi, verfiyCodeApi } from '../composables/request';
export default {
    props:{
        thead: Array,
        tbody: Array,
    },
    emits: ['single-click'],
    setup(props, context) {
        const { userKey, siteKey, code } = useState();
        const router = useRouter();
        
        const clickhandle = (data) => {
            context.emit('single-click', data);
        }

        return {
            clickhandle, 
        }
    }
}
</script>
<style lang="scss" scoped>
.table-module-wrap{
    position: relative;
    width: 100%;
    max-height: 100%;
    text-align: center;
    border: 1px solid #ddd;
    border-collapse: collapse;
    .thead{
        position: relative;
        width: 100%;
        height: 40px;
        background: #DEF1FF;
        tr{
            border: 1px solid #ddd;
            th{
                height: 40px;
                line-height: 40px;
            }
        }
    }
    .tbody{
        position: relative;
        width: 100%;
        height: calc(100% - 40px);
        tr{
            border: 1px solid #ddd;
            cursor: pointer;
            &:nth-of-type(even){
                background: #F6FAFD;
            }
            td{
                height: 40px;
                line-height: 40px;
            }
        }
    }
}
</style>