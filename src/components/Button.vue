<template>
    <button class="btn">
        <slot></slot>
    </button>
</template>

<script>
import { ref, reactive, toRefs, watch, inject } from 'vue'
export default {
    props:{
        name: String
    },
    setup(props) {
        
        return {
            
        }
    }
}
</script>
<style scoped>
.btn{
    width: 40rem;
    height: 10rem;
    line-height: 10rem;
    background: #A72A28;
    border-radius: 5rem;
    color: #fff;
    text-align: center;
    font-size: 4.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>