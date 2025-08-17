# 🤖 Local GGUF Chat - LM Studio Style Interface

A beautiful, modern chatbot application with a UI designed to look and feel like LM Studio. Built with Vue 3, TypeScript, and Express.js, this application provides a local chat interface for GGUF models running on llama.cpp servers.

![LM Studio Style Interface](https://img.shields.io/badge/UI-LM%20Studio%20Style-blue)
![Vue 3](https://img.shields.io/badge/Vue-3.4.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue)
![Express](https://img.shields.io/badge/Express-4.19.2-green)

## ✨ Features

### 🎨 **LM Studio-Style Interface**
- **Three-panel layout**: Chat history, main conversation, and advanced settings
- **Professional design**: Clean, modern UI with smooth animations
- **Responsive layout**: Works on different screen sizes
- **Dark/light theme support**: Professional color scheme

### 💬 **Chat Features**
- **Multiple chat sessions**: Create, switch between, and delete conversations
- **Message avatars**: Visual distinction between user (👤) and assistant (🤖) messages
- **Performance metrics**: Display token generation stats like LM Studio
- **Auto-resizing input**: Dynamic textarea that grows with content
- **Keyboard shortcuts**: Ctrl+Enter to send messages

### ⚙️ **Advanced Configuration**
- **Model selection**: Switch between different GGUF models
- **Sampling controls**: Temperature, Max Tokens, and Top P sliders
- **System prompts**: Custom system messages with token counting
- **Preset management**: Save and load conversation presets
- **Structured output**: Enable structured responses
- **Speculative decoding**: Performance optimization options

### 🔧 **Technical Features**
- **TypeScript**: Full type safety throughout the application
- **Vue 3 Composition API**: Modern reactive framework
- **Express.js backend**: Robust API proxy for llama.cpp servers
- **Real-time updates**: Live chat with immediate responses
- **Error handling**: Graceful error display and recovery

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **llama.cpp server** running with your GGUF models

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chat-bot
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Configure your models**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Backend server port
   PORT=5175
   
   # Your llama.cpp server URLs
   GEMMA_URL=http://127.0.0.1:8080/v1/chat/completions
   MMPROJ_URL=http://127.0.0.1:8081/v1/chat/completions
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to: `http://localhost:5173`

## 📁 Project Structure

```
chat-bot/
├── src/                    # Frontend Vue.js application
│   ├── components/         # Vue components
│   │   └── ChatBox.vue    # Main chat interface
│   ├── App.vue            # Root component
│   └── main.ts            # Application entry point
├── server/                 # Backend Express.js server
│   ├── index.ts           # Main server file
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript configuration
├── models_chat/           # GGUF model files directory
├── package.json           # Frontend dependencies
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5175` | Backend server port |
| `GEMMA_URL` | `http://127.0.0.1:8080/v1/chat/completions` | Gemma model server URL |
| `MMPROJ_URL` | `http://127.0.0.1:8081/v1/chat/completions` | MMProj model server URL |

### Model Setup

1. **Download GGUF models** to the `models_chat/` directory
2. **Start llama.cpp server** for each model:
   ```bash
   # For Gemma model
   ./llama.cpp/server -m models_chat/gemma-3-27b-it-Q4_K_M.gguf -p 8080
   
   # For MMProj model
   ./llama.cpp/server -m models_chat/mmproj-model-f16.gguf -p 8081
   ```

## 🎯 Usage Guide

### Starting a Conversation

1. **Select a model** from the right sidebar
2. **Type your message** in the input field
3. **Press Enter** or click the send button
4. **View the response** from your AI model

### Managing Chats

- **Create new chat**: Click "+ New Chat" in the left sidebar
- **Switch between chats**: Click on any chat in the sidebar
- **Delete chat**: Hover over a chat and click the trash icon
- **Chat titles**: Automatically generated from your first message

### Advanced Settings

#### Sampling Parameters
- **Temperature** (0-2): Controls randomness (0 = deterministic, 2 = very random)
- **Max Tokens** (1-4096): Maximum response length
- **Top P** (0-1): Nucleus sampling parameter

#### System Prompts
- **Custom instructions**: Set behavior guidelines for the AI
- **Token counting**: See how many tokens your prompt uses
- **Preset management**: Save and reuse common prompts

## 🛠️ Development

### Available Scripts

```bash
# Development (both frontend and backend)
npm run dev

# Frontend only
npm run dev:web

# Backend only
npm run dev:server

# Build for production
npm run build

# Start production server
npm start
```

### Development Server

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5175`
- **API Proxy**: Automatically configured in Vite

### API Endpoints

#### `POST /api/chat`
Send a message to the AI model.

**Request Body:**
```json
{
  "model": "gemma",
  "question": "Hello, how are you?",
  "temperature": 0.7,
  "max_tokens": 512,
  "systemPrompt": "You are a helpful assistant."
}
```

**Response:**
```json
{
  "answer": "Hello! I'm doing well, thank you for asking...",
  "raw": { /* Full API response */ }
}
```

## 🎨 Customization

### Styling

The application uses CSS Grid and Flexbox for layout. Main style classes:

- `.chat-container`: Main grid layout
- `.sidebar`: Left and right panels
- `.chat-panel`: Center conversation area
- `.message`: Individual chat messages

### Adding New Models

1. **Add model option** in `ChatBox.vue`:
   ```vue
   <option value="new-model">new-model-name.gguf</option>
   ```

2. **Update environment variables**:
   ```env
   NEW_MODEL_URL=http://127.0.0.1:8082/v1/chat/completions
   ```

3. **Update server logic** in `server/index.ts`

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill all Node.js processes
taskkill /f /im node.exe

# Restart the application
npm run dev
```

#### Model Server Not Responding
- Check if llama.cpp server is running
- Verify the correct port in environment variables
- Ensure model files exist in the specified directory

#### TypeScript Errors
```bash
# Install missing type definitions
npm install --save-dev @types/cors @types/express
```

### Debug Mode

Enable detailed logging by setting:
```env
DEBUG=true
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **LM Studio** for the UI inspiration
- **Vue.js** team for the amazing framework
- **llama.cpp** community for the model server
- **Express.js** for the robust backend framework

## 📞 Support

If you encounter any issues or have questions:

1. **Check the troubleshooting section** above
2. **Search existing issues** in the repository
3. **Create a new issue** with detailed information
4. **Join our community** for discussions

---

**Happy Chatting! 🤖✨**


