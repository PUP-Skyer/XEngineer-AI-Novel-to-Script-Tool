<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    value: number | string;
    icon?: string;
    color?: string;
    suffix?: string;
    loading?: boolean;
    trend?: 'up' | 'down' | 'flat';
    trendValue?: string;
  }>(),
  {
    icon: 'DataLine',
    color: '#409EFF',
    suffix: '',
    loading: false,
    trend: 'flat',
    trendValue: '',
  },
);

// 格式化数值显示
const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString();
  }
  return props.value;
});

// 趋势图标
const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'Top';
    case 'down':
      return 'Bottom';
    default:
      return 'Minus';
  }
});

// 趋势颜色
const trendColor = computed(() => {
  switch (props.trend) {
    case 'up':
      return '#67c23a';
    case 'down':
      return '#f56c6c';
    default:
      return '#909399';
  }
});
</script>

<template>
  <el-card v-loading="loading" class="stats-card" shadow="hover">
    <div class="stats-card-content">
      <div class="stats-info">
        <span class="stats-title">{{ title }}</span>
        <div class="stats-value-row">
          <span class="stats-value">{{ displayValue }}</span>
          <span v-if="suffix" class="stats-suffix">{{ suffix }}</span>
        </div>
        <div v-if="trendValue" class="stats-trend" :style="{ color: trendColor }">
          <el-icon :size="12"><component :is="trendIcon" /></el-icon>
          <span>{{ trendValue }}</span>
        </div>
      </div>
      <div class="stats-icon-wrapper" :style="{ backgroundColor: `${color}15`, color }">
        <el-icon :size="32"><component :is="icon" /></el-icon>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.stats-card {
  background-color: #1e2030;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.stats-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stats-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}

.stats-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stats-value {
  font-size: 28px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.2;
}

.stats-suffix {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}

.stats-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.stats-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
