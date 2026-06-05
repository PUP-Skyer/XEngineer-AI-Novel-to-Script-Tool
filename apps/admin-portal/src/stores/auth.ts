import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor';
  avatar?: string;
  lastLoginAt?: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  // 状态
  const token = ref<string>(localStorage.getItem('admin_token') || '');
  const user = ref<AdminUser | null>(null);
  const loading = ref(false);

  // 计算属性
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'super_admin' || user.value?.role === 'admin');
  const userDisplayName = computed(() => user.value?.username || '管理员');
  const userAvatar = computed(() => user.value?.avatar || '');

  // 登录
  async function login(params: LoginParams): Promise<boolean> {
    loading.value = true;
    try {
      // TODO: 替换为实际的 API 调用
      // const response = await apiClient.auth.login(params);
      // token.value = response.data.token;
      // user.value = response.data.user;

      // 模拟登录成功
      token.value = 'mock_admin_token_' + Date.now();
      user.value = {
        id: '1',
        username: params.username,
        email: `${params.username}@admin.com`,
        role: 'super_admin',
        avatar: '',
        lastLoginAt: new Date().toISOString(),
      };

      localStorage.setItem('admin_token', token.value);
      ElMessage.success('登录成功');
      return true;
    } catch (error) {
      ElMessage.error('登录失败，请检查用户名和密码');
      return false;
    } finally {
      loading.value = false;
    }
  }

  // 登出
  async function logout(): Promise<void> {
    try {
      // TODO: 调用 API 清除服务端 session
      // await apiClient.auth.logout();
    } finally {
      token.value = '';
      user.value = null;
      localStorage.removeItem('admin_token');
      router.push({ name: 'Login' });
    }
  }

  // 获取当前用户信息
  async function fetchUserInfo(): Promise<void> {
    if (!token.value) return;
    try {
      // TODO: 替换为实际的 API 调用
      // const response = await apiClient.auth.getCurrentUser();
      // user.value = response.data;
    } catch {
      await logout();
    }
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    userDisplayName,
    userAvatar,
    login,
    logout,
    fetchUserInfo,
  };
});
