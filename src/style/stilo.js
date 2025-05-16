document.querySelectorAll('.scrollable-col').forEach(col => {
  let timeout;

  const showScrollbar = () => {
    col.classList.add('show-scrollbar');
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      col.classList.remove('show-scrollbar');
    }, 2000); // tempo em milissegundos para esconder (2 segundos)
  };

  // Detecta rolagem
  col.addEventListener('scroll', showScrollbar);

  // Opcional: mostra também ao passar o mouse
  col.addEventListener('mouseenter', showScrollbar);

  // Esconde ao sair com o mouse
  col.addEventListener('mouseleave', () => {
    timeout = setTimeout(() => {
      col.classList.remove('show-scrollbar');
    }, 2000);
  });
});
