import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/components/layout/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' },
      },
      {
        path: 'novels',
        name: 'NovelList',
        component: () => import('@/views/novel/NovelList.vue'),
        meta: { title: '小说管理', icon: 'Reading' },
      },
      {
        path: 'novels/:id',
        name: 'NovelDetail',
        component: () => import('@/views/novel/NovelDetail.vue'),
        meta: { title: '小说详情', hidden: true },
      },
      {
        path: 'novels/:id/edit',
        name: 'NovelEdit',
        component: () => import('@/views/novel/NovelEdit.vue'),
        meta: { title: '小说编辑', hidden: true },
      },
      {
        path: 'users',
        name: 'UserList',
        component: () => import('@/views/user/UserList.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'scripts',
        name: 'ScriptList',
        component: () => import('@/views/script/ScriptList.vue'),
        meta: { title: '剧本管理', icon: 'Document' },
      },
      {
        path: 'scripts/:id',
        name: 'ScriptDetail',
        component: () => import('@/views/script/ScriptDetail.vue'),
        meta: { title: '剧本详情', hidden: true },
      },
      {
        path: 'ai-models',
        name: 'AiModelConfig',
        component: () => import('@/views/system/AiModelConfig.vue'),
        meta: { title: 'AI 模型配置', icon: 'Cpu' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI Script Game 管理后台`;
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
