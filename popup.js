function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

async function renderList() {
  const { blockedUrls = [] } = await chrome.storage.sync.get('blockedUrls');
  const el = document.getElementById('ruleList');
  if (!blockedUrls.length) {
    el.innerHTML = '<div class="empty">暂无规则</div>';
    return;
  }
  el.innerHTML = blockedUrls.map(url =>
    `<div class="list-item">
      <span class="url">${esc(url)}</span>
      <button class="danger small" data-url="${esc(url)}">删除</button>
    </div>`
  ).join('');
  el.querySelectorAll('.danger').forEach(btn => {
    btn.addEventListener('click', async () => {
      await chrome.runtime.sendMessage({ action: 'remove', url: btn.dataset.url });
      renderList();
    });
  });
}

// 当前标签页
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const el = document.getElementById('currentUrl');
  if (tabs?.[0]?.url) {
    el.textContent = tabs[0].url;
  } else {
    el.textContent = '(无法获取)';
  }
});

document.getElementById('blockBtn').addEventListener('click', async () => {
  const txt = document.getElementById('currentUrl').textContent;
  try {
    const domain = new URL(txt).hostname;
    await chrome.runtime.sendMessage({ action: 'add', url: domain });
    document.getElementById('blockBtn').textContent = '✔ 已添加';
    renderList();
  } catch {
    document.getElementById('currentUrl').textContent = '(无效网址)';
  }
});

document.getElementById('addBtn').addEventListener('click', async () => {
  const input = document.getElementById('customUrl');
  const val = input.value.trim();
  if (!val) return;
  await chrome.runtime.sendMessage({ action: 'add', url: val });
  input.value = '';
  renderList();
});

document.getElementById('customUrl').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('addBtn').click();
});

document.getElementById('optionsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

renderList();
