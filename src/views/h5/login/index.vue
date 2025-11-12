<template>
  <n-config-provider :theme="darkTheme">
    <n-float-button
      :left="0"
      :top="0"
      shape="square"
      @click="router.push({ name: mobileRouterName.h5 })"
    >
      <n-icon>
        <Home />
      </n-icon>
    </n-float-button>
    <div class="h5-profile-wrap">
      <div class="center">
        <img
          src="@/assets/img/logo.png"
          class="logo"
        />
        <!--        <div class="bottom-button">-->
        <!--          <n-card-->
        <!--            title="诺丁汉深林"-->
        <!--            size="small"-->
        <!--          >-->
        <!--            广告赞助商-->
        <!--          </n-card>-->
        <!--          <n-card-->
        <!--            title="皇家马德里"-->
        <!--            size="small"-->
        <!--          >-->
        <!--            官方合作伙伴-->
        <!--          </n-card>-->
        <!--          <n-card-->
        <!--            title="国际米兰"-->
        <!--            size="small"-->
        <!--          >-->
        <!--            官方合作伙伴-->
        <!--          </n-card>-->
        <!--        </div>-->
        <div class="input">
          <!-- 登录表单 -->
          <n-form
            v-if="isLogin"
            ref="loginFormRef"
            label-placement="left"
            size="large"
            :model="loginForm"
            :rules="loginRules"
          >
            <n-form-item path="username">
              <n-input
                v-model:value="loginForm.username"
                placeholder="username"
                size="large"
                @keyup.enter="handleLoginSubmit"
              >
                <template #prefix>
                  <n-icon :component="PersonCircleOutline" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item path="password">
              <n-input
                v-model:value="loginForm.password"
                placeholder="password"
                type="password"
                show-password-on="click"
                size="large"
                @keyup.enter="handleLoginSubmit"
              >
                <template #prefix>
                  <n-icon :component="LockOpen" />
                </template>
              </n-input>
            </n-form-item>
            <!-- 登录时显示人机校验 -->
            <n-form-item path="captcha">
              <div style="display: flex; gap: 10px; align-items: center">
                <!-- sys.captcha: 验证码文本（中英文切换） -->
                <div style="flex: 1">
                  <n-input
                    v-model:value="captchaInput"
                    :placeholder="
                      sysTranslationsDict['sys.captcha'] || '验证码'
                    "
                    size="large"
                    @keyup.enter="handleLoginSubmit"
                  />
                </div>

                <div
                  v-if="!isCaptchaLoading && captchaInfo.svg"
                  style="
                    cursor: pointer;
                    width: 100px;
                    height: 40px;
                    align-items: center;
                    justify-content: center;
                  "
                  title="点击刷新"
                  @click="getCaptcha()"
                  v-html="captchaInfo.svg"
                ></div>
                <n-spin
                  v-else
                  style="
                    width: 100px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #ddd;
                  "
                />
              </div>
            </n-form-item>
          </n-form>

          <!-- 注册表单 -->
          <n-form
            v-else
            ref="registerFormRef"
            label-placement="left"
            size="large"
            :model="loginForm"
            :rules="registerRules"
          >
            <!--            <div-->
            <!--              style="-->
            <!--                margin-bottom: 15px;-->
            <!--                padding: 10px;-->
            <!--                background-color: rgba(0, 42, 102, 0.7);-->
            <!--                border: 1px solid rgba(0, 168, 255, 0.5);-->
            <!--                border-radius: 5px;-->
            <!--                font-size: 12px;-->
            <!--                color: #ffffff;-->
            <!--                box-shadow: 0 0 10px rgba(0, 168, 255, 0.3);-->
            <!--              "-->
            <!--            >-->
            <!--              <div>-->
            <!--                用户名规则：只能使用字母、数字和下划线，不能以数字开头，不能使用特殊符号和中文-->
            <!--              </div>-->
            <!--              <div>密码规则：必须包含字母和数字</div>-->
            <!--            </div>-->
            <n-form-item path="username">
              <n-input
                v-model:value="loginForm.username"
                placeholder="username"
                size="large"
                @keyup.enter="handleLoginSubmit"
              >
                <template #prefix>
                  <n-icon :component="PersonCircleOutline" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item path="password">
              <n-input
                v-model:value="loginForm.password"
                placeholder="password"
                type="password"
                show-password-on="click"
                size="large"
                @keyup.enter="handleLoginSubmit"
              >
                <template #prefix>
                  <n-icon :component="LockOpen" />
                </template>
              </n-input>
            </n-form-item>
            <n-form-item path="confirmPassword">
              <n-input
                v-model:value="loginForm.confirmPassword"
                placeholder="confirm password"
                type="password"
                show-password-on="click"
                size="large"
                @keyup.enter="handleLoginSubmit"
              >
                <template #prefix>
                  <n-icon :component="LockOpen" />
                </template>
              </n-input>
            </n-form-item>
            <!-- 邀请码输入框已移除，但保留通过路由参数获取邀请码的功能 -->
          </n-form>

          <div class="bottom-button">
            <!-- sys.remember.password: 记住密码文本（中英文切换） -->
            <n-checkbox v-model:checked="loginForm.rememberLogin"
              >{{ sysTranslationsDict['sys.remember.password'] }}
            </n-checkbox>
            <!-- sys.forgot.password: 忘记密码文本（中英文切换） -->
            <n-button text>
              {{ sysTranslationsDict['sys.forgot.password'] }}？
            </n-button>
          </div>
          <n-button
            round
            type="info"
            color="#4D21AE"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="handleLoginSubmit"
          >
            <!-- sys.login: 登录文本, sys.register: 注册文本（中英文切换） -->
            <span style="color: white">
              {{
                isLogin
                  ? sysTranslationsDict['sys.login']
                  : sysTranslationsDict['sys.register']
              }}
            </span>
          </n-button>

          <div class="bottom-button">
            <n-float-button
              shape="square"
              :width="100"
              :height="60"
              position="relative"
              @click="handleRegister"
            >
              <n-icon :component="PersonCircleOutline" />
              <template #description>
                <!-- sys.register: 注册文本, sys.login: 登录文本（中英文切换） -->
                {{
                  isLogin
                    ? sysTranslationsDict['sys.register']
                    : sysTranslationsDict['sys.login']
                }}
              </template>
            </n-float-button>
            <n-float-button
              shape="square"
              :width="100"
              :height="60"
              position="relative"
            >
              <n-icon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 1024 1024"
                >
                  <path
                    d="M512 128c-212.1 0-384 171.9-384 384v360c0 13.3 10.7 24 24 24h184c35.3 0 64-28.7 64-64V624c0-35.3-28.7-64-64-64H200v-48c0-172.3 139.7-312 312-312s312 139.7 312 312v48H688c-35.3 0-64 28.7-64 64v208c0 35.3 28.7 64 64 64h184c13.3 0 24-10.7 24-24V512c0-212.1-171.9-384-384-384z"
                    fill="currentColor"
                  ></path>
                </svg>
              </n-icon>
              <template #description
                >{{ sysTranslationsDict['online.customer.service'] }}
              </template>
            </n-float-button>
          </div>
          <!--        <n-checkbox v-model:checked="value">-->
          <!--          复选框-->
          <!--        </n-checkbox>-->
        </div>
      </div>
    </div>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { Home, LockOpen, PersonCircleOutline } from '@vicons/ionicons5';
// eslint-disable-next-line import/order
import { darkTheme } from 'naive-ui';

const loginFormRef = ref(null);
const registerFormRef = ref(null);

import { useRoute } from 'vue-router';

import router, { mobileRouterName } from '@/router';

const sysTranslationsDict = computed(() => {
  return useCacheStore().sysTranslationsDict;
});

const userStore = useUserStore();
const appStore = useAppStore();
// eslint-disable-next-line import/order
import { computed, onMounted, ref, watch } from 'vue';

// eslint-disable-next-line import/order
import {
  fetchCaptchaGenerateWithKey,
  fetchUserRegister,
  inviteAgentRegister,
} from '@/api/user.ts';
import { useAppStore } from '@/store/app';
import { useCacheStore } from '@/store/cache';
import { useUserStore } from '@/store/user';
import {
  clearRememberLogin,
  getRememberLogin,
  setRememberLogin,
} from '@/utils/cookie';

const route = useRoute();
const isLogin = ref(true);
// 加载状态，用于防止重复提交
const isSubmitting = ref(false);

const loginForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
  rememberLogin: false,
});

// 人机校验相关
const captchaInfo = ref({
  svg: '',
  captchaKey: '',
  captchaCode: '',
});

// 用户输入的验证码
const captchaInput = ref('');

// 验证码加载状态
const isCaptchaLoading = ref(false);

// 获取人机校验
const getCaptcha = async () => {
  isCaptchaLoading.value = true;
  try {
    const res = await fetchCaptchaGenerateWithKey();
    if (res.code === 200) {
      // 安全处理SVG内容，移除可能的恶意脚本
      let safeSvg = res.data.svg;
      // 移除script标签
      safeSvg = safeSvg.replace(/<script[^>]*>.*?<\/script>/gi, '');
      // 移除所有on*属性
      safeSvg = safeSvg.replace(/on\w+="[^"]*"/gi, '');
      safeSvg = safeSvg.replace(/on\w+='[^']*'/gi, '');
      safeSvg = safeSvg.replace(/on\w+=[^\s>]*/gi, '');

      captchaInfo.value = {
        ...res.data,
        svg: safeSvg,
      };
      captchaInput.value = ''; // 清空输入
    }
  } catch (error) {
    console.error('获取验证码失败:', error);
    window.$message.error(
      sysTranslationsDict.value['sys.captcha.get.failed'] ||
        '获取验证码失败，请重试'
    );
  } finally {
    isCaptchaLoading.value = false;
  }
};
// 登录模式的校验规则
const loginRules = {
  username: {
    required: true,
    // 请输入用户名提示
    message: sysTranslationsDict.value['login.username.request'],
    trigger: 'blur',
  },
  password: {
    required: true,
    // 请输入密码提示
    message: sysTranslationsDict.value['login.password.request'],
    trigger: 'blur',
  },
};

// 注册模式的校验规则
const registerRules = {
  username: {
    required: true,
    trigger: 'blur',
    validator: (_, value) => {
      if (!value) {
        // 请输入用户名提示
        return new Error(sysTranslationsDict.value['login.username.request']);
      }
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
        // 用户名只能包含字母、数字、下划线，且不能以数字开头
        return new Error(sysTranslationsDict.value['register.username.format']);
      }
      return true;
    },
  },
  password: {
    required: true,
    // 密码至少包含字母和数字，长度不少于6位
    message: sysTranslationsDict.value['register.password.format'],
    trigger: 'blur',
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
  },
  confirmPassword: {
    required: true,
    trigger: 'blur',
    validator: (_, value) => {
      if (value === '') {
        // 请输入确认密码提示
        return new Error(sysTranslationsDict.value['login.password.request']);
      }
      if (value != loginForm.value.password) {
        // 两次输入的密码不一致
        return new Error(
          sysTranslationsDict.value['register.password.confirm'] ||
            '两次输入的密码不一致'
        );
      }
      return true;
    },
  },
  // 邀请码验证规则已移除，因为不再通过前端输入邀请码
};

onMounted(() => {
  const rememberLogin = getRememberLogin();
  if (rememberLogin) {
    loginForm.value = rememberLogin;
  }
  const inviteCode = route.query.invite_code as string;
  if (inviteCode) {
    loginForm.value.inviteCode = inviteCode;
    // 如果有邀请码，自动切换到注册模式
    isLogin.value = false;
  }
  // 获取人机校验
  if (isLogin.value) {
    getCaptcha();
  }
});

// 监听登录/注册模式切换
watch(
  () => isLogin.value,
  (newVal) => {
    // 清空确认密码
    loginForm.value.confirmPassword = '';
    if (newVal) {
      getCaptcha(); // 切换到登录模式时获取验证码
    }
  }
);
const handleLoginSubmit = (e) => {
  e.preventDefault();
  // 如果正在提交中，则阻止重复提交
  if (isSubmitting.value) {
    return;
  }

  // 根据当前模式选择对应的表单引用
  const formRef = isLogin.value ? loginFormRef.value : registerFormRef.value;

  // @ts-ignore
  formRef.validate((errors) => {
    if (!errors) {
      if (isLogin.value) {
        handleUsernameLogin();
      } else {
        handleUserRegister(e);
      }
    }
  });
};

function handleRegister() {
  isLogin.value = !isLogin.value;
  // 清空确认密码
  loginForm.value.confirmPassword = '';
}

function handleUserRegister(e) {
  e.preventDefault();

  const formRef = isLogin.value ? loginFormRef.value : registerFormRef.value;
  // @ts-ignore
  formRef.validate(async (errors) => {
    if (!errors) {
      // 设置提交状态为true，防止重复点击
      isSubmitting.value = true;

      try {
        let res;
        if (loginForm.value.inviteCode) {
          res = await inviteAgentRegister({
            username: loginForm.value.username,
            password: loginForm.value.password,
            inviteCode: loginForm.value.inviteCode,
          });
        } else {
          res = await fetchUserRegister({
            username: loginForm.value.username,
            password: loginForm.value.password,
          });
        }
        if (res.code === 200) {
          window.$message.success('注册成功!');
          // 注册成功后自动切换到登录模式
          isLogin.value = true;
        }
      } catch (error) {
        console.error('注册失败:', error);
      } finally {
        // 请求结束后，无论成功失败，都设置提交状态为false
        isSubmitting.value = false;
      }
    }
  });
}

async function handleUsernameLogin() {
  if (
    loginForm.value.username.length < 3 ||
    loginForm.value.username.length > 12
  ) {
    window.$message.warning('用户名长度要求3-12位！');
    return;
  }
  if (
    loginForm.value.password.length < 6 ||
    loginForm.value.password.length > 18
  ) {
    window.$message.warning('密码长度要求6-18位！');
    return;
  }
  // 验证验证码
  if (!captchaInput.value.trim()) {
    window.$message.warning('请输入验证码！');
    return;
  }

  // 设置提交状态为true，防止重复点击
  isSubmitting.value = true;

  try {
    await userStore.usernameLogin({
      username: loginForm.value.username,
      password: loginForm.value.password,
      captchaKey: captchaInfo.value.captchaKey,
      captchaCode: captchaInput.value.trim(),
    });
    if (userStore.token) {
      if (userStore.userInfo?.is_agent) {
        window.$message.warning('您是代理商，不能登录普通用户账号！');
        return;
      }

      if (loginForm.value.rememberLogin) {
        setRememberLogin(loginForm.value);
      } else {
        clearRememberLogin();
      }
      window.$message.success('登录成功！');
      await userStore.getUserInfo();
      appStore.showLoginModal = false;
      const redirect = route.query.redirect as string | undefined;
      if (redirect) {
        await router.push(redirect);
      } else {
        await router.push({ name: mobileRouterName.h5 });
      }
    }
  } catch (error: any) {
    console.error('登录失败:', error);
    // 如果是验证码相关错误（错误码1012），刷新验证码
    if (error.errorCode === 1013) {
      getCaptcha();
    }
  } finally {
    // 请求结束后，无论成功失败，都设置提交状态为false
    isSubmitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.h5-profile-wrap {
  //background-color: #0c1622;
  background: url('@/assets/img/login_background.png');
  background-size: cover; // 新增属性，让背景图片铺满容器
  color: #f2f1f6;
  height: 100vh;
  //width: 100vw;
}

.center {
  padding: 4vh 5vw 0 5vw;
  display: flex;
  flex-direction: column;
  gap: 4vh;
  align-items: center;
  // 调整高度占满父容器
  height: 100%;
}

.logo {
  margin: 5vh auto 2vh;
  text-align: center;
  width: 30vw;
}

.input {
  display: flex;
  flex-direction: column;
  gap: 2vh;
  width: 100%;
}

.bottom-button {
  display: flex;
  gap: 2vw;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
