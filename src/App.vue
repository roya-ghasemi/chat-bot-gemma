<template>
  <div id="app">
    <ChatBox />
  </div>
</template>

<script setup lang="ts">
import ChatBox from './components/ChatBox.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #ffffff;
  overflow: hidden;
}

#app {
  height: 100vh;
  width: 100vw;
}
</style>
  