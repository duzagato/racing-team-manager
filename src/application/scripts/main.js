// Main menu interaction logic

document.addEventListener('DOMContentLoaded', () => {
  console.log('F1 Manager - Application loaded');

  // Get menu buttons
  const btnNewGame = document.getElementById('btn-new-game');
  const btnContinue = document.getElementById('btn-continue');
  const btnExit = document.getElementById('btn-exit');

  // Get modal elements
  const modal = document.getElementById('modal-new-game');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalCreateBtn = document.getElementById('modal-create-btn');
  const saveNameInput = document.getElementById('save-name-input');
  const slugPreview = document.getElementById('slug-preview');

  // Modal functions
  function openModal() {
    modal.classList.add('active');
    saveNameInput.value = '';
    slugPreview.textContent = '---';
    saveNameInput.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  // Update slug preview as user types
  saveNameInput?.addEventListener('input', async (e) => {
    const value = e.target.value.trim();
    
    if (!value) {
      slugPreview.textContent = '---';
      return;
    }

    try {
      const result = await window.api.slugify(value);
      if (result.success) {
        slugPreview.textContent = result.slug || '---';
      }
    } catch (error) {
      console.error('Error generating slug:', error);
      slugPreview.textContent = '---';
    }
  });

  // Handle create save
  async function handleCreateSave() {
    const saveName = saveNameInput.value.trim();

    if (!saveName) {
      alert('Por favor, insira um nome para o save');
      return;
    }

    try {
      modalCreateBtn.disabled = true;
      modalCreateBtn.textContent = 'Criando...';

      const result = await window.api.createSave(saveName);

      if (result.success) {
        console.log('Save created:', result.save);
        closeModal();
        alert(`Save "${result.save.slug}" criado com sucesso!`);
        // TODO: Navigate to game screen or load the save
      } else {
        alert(`Erro ao criar save: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating save:', error);
      alert('Erro inesperado ao criar save');
    } finally {
      modalCreateBtn.disabled = false;
      modalCreateBtn.textContent = 'Criar Save';
    }
  }

  // Modal event listeners
  modalCloseBtn?.addEventListener('click', closeModal);
  modalCancelBtn?.addEventListener('click', closeModal);
  modalCreateBtn?.addEventListener('click', handleCreateSave);

  // Allow Enter key to create save
  saveNameInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleCreateSave();
    }
  });

  // Close modal when clicking outside
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // New Game button handler
  btnNewGame?.addEventListener('click', () => {
    console.log('New Game button clicked');
    openModal();
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
