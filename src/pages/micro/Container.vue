<script setup lang="ts">
// 子应用容器页面，用于挂载 qiankun 子应用
</script>

<template>
  <div class="micro-container">
    <a-card title="子应用容器">
      <!-- qiankun 子应用将挂载到此处 -->
      <div id="subapp-container" style="height: 600px"></div>
    </a-card>
  </div>
</template>

<style scoped>
.micro-container {
  padding: 0;
}
</style>