
const API_KEY = "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";

const models = [
  { id: "deepseek/deepseek-chat", name: "🐋 DeepSeek V3" },
  { id: "deepseek/deepseek-chat:free", name: "🐋 DeepSeek V3 Free" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "🦙 Llama 3.3 70B" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "🦙 Llama 3.3 70B Free" },
  { id: "qwen/qwen-2.5-72b-instruct", name: "🌊 Qwen 2.5 72B" },
  { id: "google/gemini-flash-1.5", name: "⚡ Gemini Flash 1.5" }
];

let currentModel = models[0].id;
let currentMessages = [];

function addMessage(role, content) {
  const chat = document.getElementById('chat');
  const div = document.createElement('div');
  div.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} message`;
  div.innerHTML = `
    <div class="max-w-[85%] p-5 rounded-3xl ${role === 'user' 
      ? 'bg-gradient-to-br from-purple-600 to-violet-600' 
      : 'bg-zinc-900 border border-zinc-800'}">
      ${content}
    </div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text) return;

  addMessage('user', text);
  currentMessages.push({ role: "user", content: text });
  input.value = "";

  const status = document.getElementById('status');
  status.textContent = "Думает...";

  const loading = document.createElement('div');
  loading.className = "flex justify-start message";
  loading.innerHTML = `<div class="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl">Нейросеть думает...</div>`;
  document.getElementById('chat').appendChild(loading);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://layerfrte.github.io",
        "X-Title": "SwitchAI"
      },
      body: JSON.stringify({
        model: currentModel,
        messages: currentMessages,
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || `Ошибка ${res.status}`);

    const reply = data.choices[0].message.content;
    currentMessages.push({ role: "assistant", content: reply });
    loading.remove();
    addMessage('assistant', reply.replace(/\n/g, '<br>'));
    status.textContent = "";
  } catch (err) {
    loading.remove();
    status.innerHTML = `❌ ${err.message}`;
  }
}

document.getElementById('userInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});

// Новый чат по двойному клику на заголовок
document.querySelector('h1').addEventListener('dblclick', () => {
  if (confirm("Начать новый чат?")) {
    currentMessages = [];
    document.getElementById('chat').innerHTML = '';
  }
});
