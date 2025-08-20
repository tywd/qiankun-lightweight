<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { UserOutlined, EyeOutlined, CheckCircleOutlined, DashboardOutlined } from '@ant-design/icons-vue'

const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    chart.setOption({
      title: {
        text: '系统访问统计'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['访问量', '用户数']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '访问量',
          type: 'line',
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '用户数',
          type: 'line',
          data: [220, 182, 191, 234, 290, 330, 310]
        }
      ]
    })
  }
})

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
})

// 窗口大小变化时重绘图表
window.addEventListener('resize', () => chart?.resize())
onBeforeUnmount(() => {
  window.removeEventListener('resize', () => chart?.resize())
})
</script>

<template>
  <div class="dashboard-container">
    <a-row :gutter="16">
      <a-col :span="24">
        <a-card title="系统概览" style="margin-bottom: 16px">
          <a-row :gutter="16">
            <a-col :span="6">
              <a-statistic title="活跃用户" :value="1128" style="margin-right: 16px">
                <template #prefix>
                  <UserOutlined />
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="6">
              <a-statistic title="今日访问" :value="93" style="margin-right: 16px">
                <template #prefix>
                  <EyeOutlined />
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="6">
              <a-statistic title="任务完成率" :value="78.5" :precision="1" suffix="%">
                <template #prefix>
                  <CheckCircleOutlined />
                </template>
              </a-statistic>
            </a-col>
            <a-col :span="6">
              <a-statistic title="系统负载" :value="32.5" :precision="1" suffix="%">
                <template #prefix>
                  <DashboardOutlined />
                </template>
              </a-statistic>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
    
    <a-row :gutter="16">
      <a-col :span="24">
        <a-card title="访问趋势">
          <div ref="chartRef" style="height: 400px"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 0;
}
</style>