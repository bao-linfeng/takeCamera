import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../pages/Home.vue');
const Authentication = () => import('../pages/Authentication.vue');
const TaskCenter = () => import('../pages/TaskCenter.vue');
const CameraCenter = () => import('../pages/CameraCenter.vue');
const ImageCenter = () => import('../pages/ImageCenter.vue');
const ImageCheck = () => import('../pages/ImageCheck.vue');

const routes = [
    { 
        path: '/', 
        name: 'Home',
        component: Home,
        props: true,
    },
    { 
        path: '/authentication', 
        name: 'Authentication',
        component: Authentication,
        props: true,
    },
    { 
        path: '/taskCenter', 
        name: 'TaskCenter',
        component: TaskCenter,
    },
    { 
        path: '/cameraCenter', 
        name: 'CameraCenter',
        component: CameraCenter,
    },
    { 
        path: '/imageCenter', 
        name: 'ImageCenter',
        component: ImageCenter,
    },
    { 
        path: '/imageCheck', 
        name: 'ImageCheck',
        component: ImageCheck,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router