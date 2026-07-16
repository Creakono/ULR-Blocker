function isMatched(url, blockedUrls) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return blockedUrls.some(b => lower.includes(b.toLowerCase()));
}

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const { blockedUrls = [] } = await chrome.storage.sync.get('blockedUrls');
  if (blockedUrls.length === 0) return;

  if (isMatched(details.url, blockedUrls)) {
    try {
      await chrome.tabs.remove(details.tabId);
    } catch {
      // tab might already be gone
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('blockedUrls', (data) => {
    if (!data.blockedUrls) {
      chrome.storage.sync.set({ blockedUrls: [] });
    }
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.action === 'add') {
      const { blockedUrls = [] } = await chrome.storage.sync.get('blockedUrls');
      if (!blockedUrls.includes(msg.url)) {
        blockedUrls.push(msg.url);
        await chrome.storage.sync.set({ blockedUrls });
      }
      sendResponse({ ok: true });
    } else if (msg.action === 'remove') {
      let { blockedUrls = [] } = await chrome.storage.sync.get('blockedUrls');
      blockedUrls = blockedUrls.filter(u => u !== msg.url);
      await chrome.storage.sync.set({ blockedUrls });
      sendResponse({ ok: true });
    } else if (msg.action === 'list') {
      const { blockedUrls = [] } = await chrome.storage.sync.get('blockedUrls');
      sendResponse({ urls: blockedUrls });
    }
  })();
  return true;
});
