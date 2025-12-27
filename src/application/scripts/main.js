// Main menu interaction logic

document.addEventListener('DOMContentLoaded', () => {
  console.log('F1 Manager - Application loaded');

  // Get menu buttons
  const btnNewGame = document.getElementById('btn-new-game');
  const btnContinue = document.getElementById('btn-continue');
  const btnExit = document.getElementById('btn-exit');

  // New Game button handler
  btnNewGame?.addEventListener('click', () => {
    console.log('New Game button clicked');
    if (window.api) {
      window.api.send('new-game', {});
    }
    // TODO: Replace alert with custom modal when game screens are implemented
    alert('Novo Jogo - Em desenvolvimento');
  });

  // Continue button handler
  btnContinue?.addEventListener('click', () => {
    console.log('Continue button clicked');
    if (window.api) {
      window.api.send('continue-game', {});
    }
    // TODO: Replace alert with custom modal when game screens are implemented
    alert('Continuar - Em desenvolvimento');
  });

  // Exit button handler
  btnExit?.addEventListener('click', () => {
    console.log('Exit button clicked');
    if (window.api) {
      window.api.send('exit-game', {});
    }
    // Close the application
    if (confirm('Tem certeza que deseja sair?')) {
      window.close();
    }
  });
});
