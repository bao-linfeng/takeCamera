<template>
    <div class="quit-module-wrap" @click="quit">
        <span>退出</span>
    </div>
</template>

<script>
import { ref, reactive, toRefs, watch, inject } from 'vue';
import { useState } from '../store';
import { useRoute, useRouter } from 'vue-router';
export default {
    props:{
        
    },
    setup(props, context) {
        const { userKey, siteKey } = useState();
        const router = useRouter();

        const quit = () => {
            router.push('/');
        }

        return {
            quit
        }
    }
}
</script>
<style lang="scss" scoped>
.quit-module-wrap{
    position: fixed;
    top: 20px;
    right: 20px;
    cursor: pointer;
    z-index: 10000;
}
</style>