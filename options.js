function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

async function renderList() {
  const { blockedUrls = [] } = await chrome.storage.sync.get('blockedUrls');
  const tbody = document.getElementById('ruleList');
  if (!blockedUrls.length) {
    tbody.innerHTML = '<tr><td colspan="2" class="empty">暂无规则</td></tr>';
    return;
  }
  tbody.innerHTML = blockedUrls.map(url =>
    `<tr>
      <td>${esc(url)}</td>
      <td><button class="danger" data-url="${esc(url)}">删除</button></td>
    </tr>`
  ).join('');
  tbody.querySelectorAll('.danger').forEach(btn => {
    btn.addEventListener('click', async () => {
      await chrome.runtime.sendMessage({ action: 'remove', url: btn.dataset.url });
      renderList();
    });
  });
}

document.getElementById('addBtn').addEventListener('click', async () => {
  const input = document.getElementById('newUrl');
  const val = input.value.trim();
  if (!val) return;
  await chrome.runtime.sendMessage({ action: 'add', url: val });
  input.value = '';
  renderList();
});

document.getElementById('newUrl').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('addBtn').click();
});

renderList();
