(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.querySelector('.menu-icon').textContent = expanded ? '☰' : '×';
    toggle.querySelector('.sr-only').textContent = expanded ? 'Abrir menú' : 'Cerrar menú';
    nav.classList.toggle('open', !expanded);
  });
})();
