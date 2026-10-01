/** @jest-environment jsdom */

const { initMenu } = require('../public/app');

describe('mobile menu behavior', () => {
  it('toggles aria-expanded and nav class on button click', () => {
    document.body.innerHTML = `
      <button id="menu-toggle" aria-expanded="false"></button>
      <nav id="main-nav"><a href="#x">Link</a></nav>
    `;

    initMenu(document);

    const button = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');

    button.click();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(nav.classList.contains('is-open')).toBe(true);

    button.click();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(nav.classList.contains('is-open')).toBe(false);
  });
});
