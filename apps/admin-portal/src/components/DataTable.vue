<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue';

interface Column {
  prop: string;
  label: string;
  width?: number | string;
  minWidth?: number | string;
  fixed?: 'left' | 'right';
  formatter?: (row: T) => string;
}

interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

const props = withDefaults(
  defineProps<{
    data: T[];
    columns: Column[];
    loading?: boolean;
    pagination?: PaginationConfig | null;
    stripe?: boolean;
    border?: boolean;
    height?: number | string;
    maxHeight?: number | string;
    emptyText?: string;
  }>(),
  {
    loading: false,
    pagination: null,
    stripe: true,
    border: true,
    height: undefined,
    maxHeight: undefined,
    emptyText: '暂无数据',
  },
);

const emit = defineEmits<{
  'page-change': [page: number];
  'size-change': [size: number];
}>();

// 页码变化
function handleCurrentChange(page: number): void {
  emit('page-change', page);
}

// 每页条数变化
function handleSizeChange(size: number): void {
  emit('size-change', size);
}

// 是否显示分页
const showPagination = computed(() => props.pagination !== null && props.pagination.total > 0);
</script>

<template>
  <div class="data-table-wrapper">
    <el-table
      v-loading="loading"
      :data="data"
      :stripe="stripe"
      :border="border"
      :height="height"
      :max-height="maxHeight"
      :empty-text="emptyText"
      class="data-table"
      row-key="id"
    >
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        v-bind="{
          prop: col.prop,
          label: col.label,
          width: col.width,
          minWidth: col.minWidth,
          fixed: col.fixed,
          formatter: col.formatter,
        }"
      >
        <template v-if="$slots[`col-${col.prop}`]" #default="scope">
          <slot :name="`col-${col.prop}`" v-bind="scope" />
        </template>
      </el-table-column>

      <!-- 操作列插槽 -->
      <el-table-column v-if="$slots.actions" label="操作" fixed="right" :width="$attrs.actionsWidth || 200">
        <template #default="scope">
          <slot name="actions" v-bind="scope" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div v-if="showPagination" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination!.page"
        v-model:page-size="pagination!.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination!.total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-table-wrapper {
  width: 100%;
}

.data-table {
  width: 100%;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
