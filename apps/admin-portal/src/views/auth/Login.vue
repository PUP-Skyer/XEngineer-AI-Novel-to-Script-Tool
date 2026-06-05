<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { FormInstance, FormRules } from 'element-plus';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loginFormRef = ref<FormInstance>();

const loginForm = reactive({
  username: '',
  password: '',
});

const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 32, message: '用户名长度为 2-32 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 64, message: '密码长度为 6-64 个字符', trigger: 'blur' },
  ],
};

async function handleLogin(): Promise<void> {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return;

    const success = await authStore.login({
      username: loginForm.username,
      password: loginForm.password,
    });

    if (success) {
      const redirect = (route.query.redirect as string) || '/dashboard';
      router.push(redirect);
    }
  });
}
</script>

<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="login-bg">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <el-icon :size="36" color="#409eff"><Monitor /></el-icon>
        </div>
        <h1 class="login-title">AI Script Game</h1>
        <p class="login-subtitle">管理后台</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        size="large"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码?</el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="authStore.loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ authStore.loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>AI 小说转剧本 + 剧本杀游戏平台</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      rememberMe: false,
    };
  },
};
</script>

<style lang="scss" scoped>
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0d0e18;
  position: relative;
  overflow: hidden;
}

// 背景装饰
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .bg-circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.3;
  }

  .circle-1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, #409eff, transparent);
    top: -200px;
    right: -100px;
  }

  .circle-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, #6366f1, transparent);
    bottom: -150px;
    left: -100px;
  }

  .circle-3 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, #0ea5e9, transparent);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

// 登录卡片
.login-card {
  width: 420px;
  background-color: rgba(30, 32, 48, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 40px;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;

  .login-logo {
    margin-bottom: 16px;
  }

  .login-title {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 8px 0;
    letter-spacing: 1px;
  }

  .login-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.45);
    margin: 0;
  }
}

.login-form {
  :deep(.el-input__wrapper) {
    background-color: #2a2c3e;
    border-radius: 8px;
    padding: 4px 12px;
  }

  :deep(.el-form-item__error) {
    padding-top: 4px;
  }
}

.login-options {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.25);
}
</style>
