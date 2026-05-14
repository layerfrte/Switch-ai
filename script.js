const API_KEY = "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";

const models = [
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", icon: "🐋" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3", icon: "🦙" },
  { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5", icon: "🌊" },
  { id: "google/gemini-flash-1.5", name: "Gemini", icon: "⚡" }
];

let currentModel = models[0];
let currentMessages = [];

function renderModelGrid() {
  const container = document.getElementById('modelGrid');
  container.innerHTML = '';
  
  models.forEach((model, index) => {
    const div = document.createElement('div');
    div.className = `flex flex-col items-center p-4 rounded-3xl cursor-pointer transition-all duration-300 ${currentModel.id === model.id ? 'ring-2 ring-purple-500 bg-white/10 scale-110' : 'hover:bg-white/5'}`;
    div.innerHTML = `
      <div class="text-4xl mb-2 transition-transform">${model.icon}</div>
      <div class="text-xs font-medium text-center">${model.name}</div>
    `;
    div.onclick = () => {
      currentModel = model;
      renderModelGrid();
    };
    container.appendChild(div);
  });
}

function startChatWithPrompt(prompt = null) {
  document.getElementById('welcome').classList.add('hidden');
  document.getElementById('chatScreen').classList.remove('hidden');
  document.getElementById('currentModelName').textContent = currentModel.name;

  if (prompt) {
    currentMessages = [{ role: "user", content: prompt }];
    addMessage('user', prompt);
    setTimeout(() => sendMessage(true), 600);
  }
}

function addMessage(role, content) {
  const chat = document.getElementById('chat');
  const div = document.createElement('div');
  div.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} message`;
  div.innerHTML = `
    <div class="max-w-[85%] px-6 py-4 rounded-3xl ${role === 'user' 
      ? 'bg-gradient-to-br from-purple-600 to-violet-600' 
      : 'bg-zinc-900/80 border border-white/10 backdrop-blur-md'}">
      ${content}
    </div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage(isAuto = false) {
  const input = document.getElementById('userInput');
  const text = isAuto ? currentMessages[0].content : input.value.trim();
  
  if (!isAuto) {
    if (!text) return;
    addMessage('user', text);
    currentMessages.push({ role: "user", content: text });
    input.value = "";
  }

  const status = document.getElementById('status');
  status.textContent = "Думает...";

  const loading = document.createElement('div');
  loading.className = "flex justify-start message";
  loading.innerHTML = `<div class="bg-zinc-900/80 border border-white/10 p-5 rounded-3xl">Нейросеть думает...</div>`;
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
        model: currentModel.id,
        messages: currentMessages,
        max_tokens: 3000,
        temperature: 0.75
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Ошибка");

    const reply = data.choices[0].message.content;
    currentMessages.push({ role: "assistant", content: reply });
    loading.remove();
    addMessage('assistant', reply.replace(/\n/g, '<br>'));
    status.textContent = "";
  } catch (err) {
    loading.remove();
    status.textContent = "❌ Ошибка";
  }
}

function backToWelcome() {
  if (confirm("Вернуться назад?")) {
    document.getElementById('chatScreen').classList.add('hidden');
    document.getElementById('welcome').classList.remove('hidden');
    document.getElementById('chat').innerHTML = '';
    currentMessages = [];
  }
}

// Инициализация
renderModelGrid();
document.getElementById('userInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') sendMessage();
});
