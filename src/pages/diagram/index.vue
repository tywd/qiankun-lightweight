<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Graph } from '@antv/x6'

const containerRef = ref<HTMLElement | null>(null)
let graph: Graph | null = null

onMounted(() => {
  if (containerRef.value) {
    graph = new Graph({
      container: containerRef.value,
      width: 800,
      height: 600,
      grid: true,
      panning: true,
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
      },
    })

    // 添加节点
    const rect1 = graph.addNode({
      x: 100,
      y: 100,
      width: 120,
      height: 60,
      label: '开始节点',
      attrs: {
        body: {
          fill: '#f5f5f5',
          stroke: '#d9d9d9',
          strokeWidth: 1,
        },
        label: {
          fill: '#333',
        },
      },
    })

    const rect2 = graph.addNode({
      x: 300,
      y: 250,
      width: 120,
      height: 60,
      label: '处理节点',
      attrs: {
        body: {
          fill: '#e6f7ff',
          stroke: '#1890ff',
          strokeWidth: 1,
        },
        label: {
          fill: '#333',
        },
      },
    })

    const rect3 = graph.addNode({
      x: 500,
      y: 100,
      width: 120,
      height: 60,
      label: '结束节点',
      attrs: {
        body: {
          fill: '#f6ffed',
          stroke: '#52c41a',
          strokeWidth: 1,
        },
        label: {
          fill: '#333',
        },
      },
    })

    // 添加连线
    graph.addEdge({
      source: rect1,
      target: rect2,
      attrs: {
        line: {
          stroke: '#1890ff',
          strokeWidth: 2,
        },
      },
    })

    graph.addEdge({
      source: rect2,
      target: rect3,
      attrs: {
        line: {
          stroke: '#1890ff',
          strokeWidth: 2,
        },
      },
    })
  }
})

const exportJSON = () => {
  if (graph) {
    const json = graph.toJSON()
    console.log(json)
    // 可以添加下载或显示 JSON 的逻辑
    alert('流程图数据已导出到控制台')
  }
}
</script>

<template>
  <div class="diagram-container">
    <a-card title="流程图编辑器">
      <template #extra>
        <a-button type="primary" @click="exportJSON">导出 JSON</a-button>
      </template>
      <div ref="containerRef" class="diagram-canvas"></div>
    </a-card>
  </div>
</template>

<style scoped>
.diagram-container {
  padding: 0;
}
.diagram-canvas {
  width: 100%;
  height: 600px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
}
</style>