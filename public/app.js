(function () {
  function setMenuOpen(nav, button, open) {
    nav.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
  }

  function createToast(message, variant) {
    const region = document.getElementById('toast-region');
    if (!region) {
      return;
    }

    const toast = document.createElement('div');
    toast.className = `toast ${variant}`;
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    region.appendChild(toast);

    window.setTimeout(() => {
      toast.remove();
    }, 3200);
  }

  function escapeHtml(text) {
    return text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function setLoading(isLoading) {
    const button = document.getElementById('rewrite-btn');
    const loading = document.getElementById('loading-state');
    button.disabled = isLoading;
    loading.hidden = !isLoading;
  }

  function renderHistory(items) {
    const body = document.getElementById('history-body');
    const empty = document.getElementById('empty-state');
    const wrapper = document.getElementById('history-wrapper');

    body.innerHTML = items
      .map(
        (item) => `<tr>
      <td>${escapeHtml(item.original)}</td>
      <td>${escapeHtml(item.rewritten)}</td>
      <td>${escapeHtml(item.createdAt)}</td>
    </tr>`
      )
      .join('');

    const hasItems = items.length > 0;
    empty.hidden = hasItems;
    wrapper.hidden = !hasItems;
  }

  function initMenu(doc) {
    const source = doc || document;
    const menuButton = source.getElementById('menu-toggle');
    const nav = source.getElementById('main-nav');

    if (!menuButton || !nav) {
      return;
    }

    menuButton.addEventListener('click', () => {
      const next = menuButton.getAttribute('aria-expanded') !== 'true';
      setMenuOpen(nav, menuButton, next);
    });

    nav.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        setMenuOpen(nav, menuButton, false);
      }
    });
  }

  function initRewriteFlow() {
    const input = document.getElementById('input-text');
    const button = document.getElementById('rewrite-btn');
    const history = [];

    if (!input || !button) {
      return;
    }

    renderHistory(history);

    button.addEventListener('click', async () => {
      const text = input.value.trim();
      if (!text) {
        createToast('Please enter text to rewrite.', 'error');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('/api/ai/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload?.error?.message || 'Failed to rewrite text');
        }

        history.unshift({
          original: text,
          rewritten: payload.data.rewrittenText,
          createdAt: new Date().toLocaleTimeString()
        });

        renderHistory(history);
        createToast('Rewrite generated successfully.', 'success');
      } catch (error) {
        createToast(error.message || 'Something went wrong.', 'error');
      } finally {
        setLoading(false);
      }
    });
  }

  function initApp(doc) {
    initMenu(doc);
    initRewriteFlow();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initApp(document));
    } else {
      initApp(document);
    }
  }

  if (typeof module !== 'undefined') {
    module.exports = {
      setMenuOpen,
      initMenu,
      escapeHtml
    };
  }
})();
