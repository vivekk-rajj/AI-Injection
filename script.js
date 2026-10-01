const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.getElementById('site-nav');
const apiKeyInput = document.getElementById('api-key');
const noteInput = document.getElementById('note-input');
const summarizeButton = document.getElementById('summarize-btn');
const loader = document.getElementById('ai-loader');
const summaryOutput = document.getElementById('summary-output');
const addTaskButton = document.getElementById('add-task-btn');
const taskTableBody = document.getElementById('task-table-body');
const emptyState = document.getElementById('empty-state');

const tasks = [];

const notify = (text, success = true) => {
  Toastify({
    text,
    duration: 2500,
    close: true,
    gravity: 'top',
    position: 'right',
    style: {
      background: success ? '#166534' : '#b91c1c'
    }
  }).showToast();
};

const renderTasks = () => {
  taskTableBody.innerHTML = '';

  if (tasks.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  tasks.forEach((task, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${task.title}</td>
      <td>${task.status}</td>
      <td><button class="delete-btn" data-index="${index}">Delete</button></td>
    `;
    taskTableBody.appendChild(tr);
  });
};

menuToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

addTaskButton.addEventListener('click', () => {
  tasks.push({ title: `Demo Task ${tasks.length + 1}`, status: 'Open' });
  renderTasks();
  notify('✅ Task added');
});

taskTableBody.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement) || !target.dataset.index) {
    return;
  }

  tasks.splice(Number(target.dataset.index), 1);
  renderTasks();
  notify('✅ Task deleted');
});

const getSummary = async (apiKey, text) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You rewrite notes into a concise professional summary.'
        },
        { role: 'user', content: text }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error('OpenAI request failed');
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content?.trim() || '';
};

summarizeButton.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  const sourceText = noteInput.value.trim();

  if (!apiKey) {
    notify('Please enter your OpenAI API key first.', false);
    return;
  }

  if (!sourceText) {
    notify('Please provide text to summarize.', false);
    return;
  }

  summarizeButton.disabled = true;
  loader.classList.remove('hidden');

  try {
    const summary = await getSummary(apiKey, sourceText);
    summaryOutput.value = summary;
    notify('✅ Summary generated');
  } catch {
    notify('Unable to generate summary right now.', false);
  } finally {
    loader.classList.add('hidden');
    summarizeButton.disabled = false;
  }
});

renderTasks();
