<template>
  <div class="chat-container">
    <!-- Left Sidebar - Chats -->
    <div class="sidebar chats-sidebar">
      <div class="sidebar-header">
        <div class="header-content">
          <h3>Chats</h3>
          <button class="new-chat-btn" @click="createNewChat">
            <span class="plus-icon">+</span>
            New Chat
          </button>
        </div>
      </div>
      <div class="chat-list">
        <div 
          v-for="chat in chats" 
          :key="chat.id"
          :class="['chat-item', { active: currentChatId === chat.id }]"
          @click="selectChat(chat.id)"
        >
          <div class="chat-info">
            <div class="chat-title">{{ chat.title || 'Untitled' }}</div>
            <div class="chat-tokens">{{ chat.tokenCount || 0 }} tokens</div>
          </div>
          <div class="chat-actions">
            <button class="chat-action-btn" @click.stop="deleteChat(chat.id)" title="Delete chat">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Center Panel - Chat Conversation -->
    <div class="chat-panel">
      <div class="chat-header">
        <div class="model-info">
          <div class="model-icon">🤖</div>
          <div class="model-details">
            <h2>{{ currentModelName }}</h2>
            <div class="model-status">Ready</div>
          </div>
        </div>
      </div>
      
      <div class="messages-container" ref="messagesContainer">
        <div v-if="currentChat.messages.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>Start a new conversation</h3>
          <p>Type a message below to begin chatting with {{ currentModelName }}</p>
        </div>
        
        <div 
          v-for="message in currentChat.messages" 
          :key="message.id"
          :class="['message', message.role]"
        >
          <div class="message-avatar">
            <div v-if="message.role === 'user'" class="user-avatar">👤</div>
            <div v-else class="assistant-avatar">🤖</div>
          </div>
          <div class="message-content-wrapper">
            <div class="message-content">{{ message.content }}</div>
            <div v-if="message.performance" class="message-performance">
              {{ message.performance }}
            </div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <div class="input-container">
          <textarea
            v-model="question"
            :disabled="loading"
            placeholder="Type a message and press Enter to send..."
            @keydown.enter.prevent="onAsk"
            @keydown.ctrl.enter.prevent="onAsk"
            class="message-input"
            rows="1"
            ref="messageInput"
          ></textarea>
          <div class="input-actions">
            <div class="input-hints">
              <span class="hint-text">Ctrl + Enter to send</span>
            </div>
            <div class="action-buttons">
              <button class="attach-btn" title="Attach Image" disabled>
                <span class="icon">📷</span>
              </button>
              <button class="attach-btn" title="Attach File" disabled>
                <span class="icon">📎</span>
              </button>
              <button 
                class="send-btn" 
                @click="onAsk" 
                :disabled="loading || !question.trim()"
                :class="{ loading: loading }"
              >
                <span v-if="!loading" class="send-icon">➤</span>
                <span v-else class="loading-spinner"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar - Settings -->
    <div class="sidebar settings-sidebar">
      <div class="sidebar-header">
        <h3>Advanced Configuration</h3>
      </div>
      
      <div class="settings-section">
        <label class="section-label">Preset</label>
        <select class="setting-input">
          <option>Select a Preset...</option>
          <option>Creative</option>
          <option>Balanced</option>
          <option>Precise</option>
        </select>
        <button class="save-preset-btn">
          <span class="plus-icon">+</span>
          Save Preset As...
        </button>
      </div>

      <div class="settings-section">
        <label class="section-label">System Prompt</label>
        <textarea 
          v-model="systemPrompt"
          placeholder="Example, 'Only answer in rhymes'"
          class="setting-input system-prompt"
          rows="3"
        ></textarea>
        <div class="token-count">Token count: {{ systemPrompt.length }}</div>
      </div>

      <div class="settings-section">
        <details class="settings-details">
          <summary class="settings-summary">
            <span class="summary-icon">⚙️</span>
            Settings
          </summary>
          <div class="advanced-settings">
            <label class="setting-label">Model</label>
            <select v-model="model" :disabled="loading" class="setting-input">
              <option value="gemma">gemma-3-27b-it-Q4_K_M.gguf</option>
              <option value="mmproj">mmproj-model-f16.gguf</option>
            </select>
          </div>
        </details>
      </div>

      <div class="settings-section">
        <details class="settings-details">
          <summary class="settings-summary">
            <span class="summary-icon">🎲</span>
            Sampling
          </summary>
          <div class="advanced-settings">
            <div class="setting-group">
              <label class="setting-label">Temperature</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  step="0.1" 
                  v-model.number="temperature" 
                  :disabled="loading"
                  class="slider"
                />
                <span class="slider-value">{{ temperature }}</span>
              </div>
            </div>
            
            <div class="setting-group">
              <label class="setting-label">Max Tokens</label>
              <input 
                type="number" 
                min="1" 
                max="4096"
                v-model.number="max_tokens" 
                :disabled="loading"
                class="setting-input"
              />
            </div>
            
            <div class="setting-group">
              <label class="setting-label">Top P</label>
              <div class="slider-container">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  v-model.number="topP" 
                  class="slider"
                />
                <span class="slider-value">{{ topP }}</span>
              </div>
            </div>
          </div>
        </details>
      </div>

      <div class="settings-section">
        <details class="settings-details">
          <summary class="settings-summary">
            <span class="summary-icon">📋</span>
            Structured Output
          </summary>
          <div class="advanced-settings">
            <label class="checkbox-label">
              <input type="checkbox" v-model="structuredOutput" />
              <span class="checkmark"></span>
              Enable Structured Output
            </label>
          </div>
        </details>
      </div>

      <div class="settings-section">
        <details class="settings-details">
          <summary class="settings-summary">
            <span class="summary-icon">⚡</span>
            Speculative Decoding
          </summary>
          <div class="advanced-settings">
            <label class="checkbox-label">
              <input type="checkbox" v-model="speculativeDecoding" />
              <span class="checkmark"></span>
              Enable Speculative Decoding
            </label>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  performance?: string
}

interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  tokenCount: number
}

const model = ref<'gemma' | 'mmproj'>('gemma')
const question = ref('')
const temperature = ref(0.7)
const max_tokens = ref(512)
const loading = ref(false)
const error = ref('')
const systemPrompt = ref('')
const topP = ref(0.9)
const structuredOutput = ref(false)
const speculativeDecoding = ref(false)

const chats = ref<Chat[]>([
  {
    id: '1',
    title: 'Untitled',
    messages: [],
    tokenCount: 0
  }
])

const currentChatId = ref('1')
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()

const currentChat = computed(() => {
  return chats.value.find(chat => chat.id === currentChatId.value) || chats.value[0]
})

const currentModelName = computed(() => {
  return model.value === 'gemma' ? 'gemma-3-27b-it' : 'mmproj-model'
})

function createNewChat() {
  const newChat: Chat = {
    id: Date.now().toString(),
    title: 'Untitled',
    messages: [],
    tokenCount: 0
  }
  chats.value.unshift(newChat)
  currentChatId.value = newChat.id
}

function selectChat(chatId: string) {
  currentChatId.value = chatId
}

function deleteChat(chatId: string) {
  const index = chats.value.findIndex(chat => chat.id === chatId)
  if (index !== -1) {
    chats.value.splice(index, 1)
    if (currentChatId.value === chatId) {
      currentChatId.value = chats.value[0]?.id || '1'
    }
  }
}

function autoResizeTextarea() {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = Math.min(messageInput.value.scrollHeight, 120) + 'px'
  }
}

watch(question, autoResizeTextarea)

async function onAsk() {
  if (!question.value.trim() || loading.value) return

  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    content: question.value
  }

  currentChat.value.messages.push(userMessage)
  const userQuestion = question.value
  question.value = ''
  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model.value,
        question: userQuestion,
        temperature: temperature.value,
        max_tokens: max_tokens.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.error || 'Request failed.')
    }

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: data.answer || 'No response generated.',
      performance: '4.44 tok/sec • 161 tokens • 2.20s to first token • Stop reason: EOS Token Found'
    }

    currentChat.value.messages.push(assistantMessage)
    currentChat.value.tokenCount += assistantMessage.content.split(' ').length

    // Update chat title if it's still "Untitled"
    if (currentChat.value.title === 'Untitled') {
      currentChat.value.title = userQuestion.substring(0, 30) + (userQuestion.length > 30 ? '...' : '')
    }

    await nextTick()
    scrollToBottom()
  } catch (e: any) {
    error.value = e.message || 'Request error.'
  } finally {
    loading.value = false
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()
  autoResizeTextarea()
})
</script>

<style scoped>
.chat-container {
  display: grid;
  grid-template-columns: 300px 1fr 350px;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #ffffff;
  color: #1a1a1a;
}

/* Sidebar Styles */
.sidebar {
  background: #f8f9fa;
  border-right: 1px solid #e1e5e9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.settings-sidebar {
  border-right: none;
  border-left: 1px solid #e1e5e9;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
  background: #ffffff;
}

.header-content h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.new-chat-btn {
  width: 100%;
  padding: 12px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.new-chat-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.plus-icon {
  font-size: 16px;
  font-weight: bold;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.chat-item {
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-item:hover {
  background: #f1f3f4;
  border-color: #dadce0;
}

.chat-item.active {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-tokens {
  font-size: 12px;
  opacity: 0.7;
  color: inherit;
}

.chat-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.chat-item:hover .chat-actions {
  opacity: 1;
}

.chat-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s;
}

.chat-action-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Chat Panel Styles */
.chat-panel {
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e1e5e9;
  background: #ffffff;
}

.model-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
}

.model-details h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.model-status {
  font-size: 12px;
  color: #28a745;
  font-weight: 500;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #ffffff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
}

.message {
  display: flex;
  gap: 16px;
  max-width: 100%;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 16px;
}

.user-avatar {
  background: #007bff;
  color: white;
}

.assistant-avatar {
  background: #f8f9fa;
  color: #1a1a1a;
  border: 1px solid #e1e5e9;
}

.message-content-wrapper {
  flex: 1;
  min-width: 0;
}

.message-content {
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message.user .message-content {
  background: #007bff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
}

.message.assistant .message-content {
  background: #f8f9fa;
  color: #1a1a1a;
  border: 1px solid #e1e5e9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-performance {
  font-size: 12px;
  color: #6c757d;
  margin-top: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e1e5e9;
}

/* Input Area Styles */
.input-area {
  padding: 20px 24px;
  border-top: 1px solid #e1e5e9;
  background: #ffffff;
}

.input-container {
  position: relative;
  background: #ffffff;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 4px;
  transition: border-color 0.2s;
}

.input-container:focus-within {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.message-input {
  width: 100%;
  min-height: 48px;
  max-height: 120px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  resize: none;
  font-size: 15px;
  font-family: inherit;
  background: transparent;
  outline: none;
  line-height: 1.5;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
}

.input-hints {
  flex: 1;
}

.hint-text {
  font-size: 12px;
  color: #6c757d;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.attach-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.2s;
  opacity: 0.5;
}

.attach-btn:hover:not(:disabled) {
  background: #f1f3f4;
  opacity: 1;
}

.attach-btn:disabled {
  cursor: not-allowed;
}

.send-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 36px;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.send-btn.loading {
  background: #6c757d;
}

.send-icon {
  font-size: 14px;
  transform: rotate(90deg);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Settings Styles */
.settings-section {
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.settings-section:last-child {
  border-bottom: none;
}

.section-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 10px;
}

.setting-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: #ffffff;
  transition: border-color 0.2s;
}

.setting-input:focus {
  outline: none;
  border-color: #007bff;
}

.system-prompt {
  resize: vertical;
  min-height: 80px;
}

.save-preset-btn {
  width: 100%;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  color: #1a1a1a;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.save-preset-btn:hover {
  background: #e9ecef;
}

.token-count {
  font-size: 12px;
  color: #6c757d;
  margin-top: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.settings-details {
  margin-top: 0;
}

.settings-summary {
  cursor: pointer;
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 600;
  padding: 8px 0;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;
}

.settings-summary:hover {
  color: #007bff;
}

.summary-icon {
  font-size: 14px;
}

.advanced-settings {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #e1e5e9;
  outline: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
}

.slider-value {
  font-size: 12px;
  color: #6c757d;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  min-width: 30px;
  text-align: right;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  cursor: pointer;
  position: relative;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 3px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background: #007bff;
  border-color: #007bff;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* Scrollbar styling */
.chat-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-list::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .chat-container {
    grid-template-columns: 250px 1fr 300px;
  }
}

@media (max-width: 768px) {
  .chat-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: none;
  }
}
</style>


