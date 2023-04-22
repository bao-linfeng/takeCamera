<template>
	<div class="prompt-box">
		<div class="prompt-box-head">
			<h3 class="title">提示框</h3>
			<img class="close" src="../assets/close.svg" @click="close" alt="">
		</div>
		<div class="prompt-box-content">
			<p>{{msg}}</p>
		</div>
	</div>
</template>

<script>
	import { ref, reactive, toRefs, watch, inject } from 'vue'
	export default {
		name: 'prompt-box',
		components: {
		    
		},
	    props:{
	        msg: String,
	    },
		emits: ['close'],
	    setup(props, context) {
	        const close = () => {
				context.emit('close', false);
			}
			
	        return {
	            close, 
	        }
	    }
	}
</script>

<style lang="scss" scoped>
	.prompt-box{
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding: 30px;
		background: #fff;
		border-radius: 5px;
		min-width: 400px;
		text-align: center;
		z-index: 1000;
		.prompt-box-head{
			position: relative;
			height: 40px;
			display: flex;
			justify-content: center;
			align-items: center;
			.close{
				position: absolute;
				top: 50%;
				right: 0;
				transform: translateY(-50%);
				background: #000;
				cursor: pointer;
			}
		}
		.prompt-box-content{
			min-height: 100px;
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>