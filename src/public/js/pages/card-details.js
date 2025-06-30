/**
 * Card Details Page JavaScript
 * Gerencia as funcionalidades de edição e exclusão de cards e tarefas
 */

class CardDetailsManager {
  constructor(cardId, projectId) {
    this.cardId = cardId;
    this.projectId = projectId;
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Event listeners para formulários
    const editCardForm = document.getElementById('editCardForm');
    const editTaskForm = document.getElementById('editTaskForm');

    if (editCardForm) {
      editCardForm.addEventListener('submit', (e) => this.handleEditCard(e));
    }

    if (editTaskForm) {
      editTaskForm.addEventListener('submit', (e) => this.handleEditTask(e));
    }

    // Event listeners globais para botões
    window.deleteCard = () => this.handleDeleteCard();
    window.editTask = (taskId) => this.handleEditTaskModal(taskId);
    window.deleteTask = (taskId) => this.handleDeleteTask(taskId);
  }

  async handleEditCard(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status')
    };

    console.log('Enviando dados do card:', data);

    try {
      const response = await this.makeRequest(`/admin/cards/${this.cardId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      if (response.success) {
        this.showSuccess('Card atualizado com sucesso!');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        this.showError('Erro ao editar card: ' + response.message);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      this.showError('Erro ao editar card: ' + error.message);
    }
  }

  async handleDeleteCard() {
    if (!confirm("Tem certeza que deseja excluir este card?")) {
      return;
    }

    console.log('Deletando card:', this.cardId);
    
    try {
      const response = await this.makeRequest(`/admin/cards/${this.cardId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        this.showSuccess('Card excluído com sucesso!');
        setTimeout(() => {
          window.location.href = `/admin/board/${this.projectId}`;
        }, 1000);
      } else {
        this.showError('Erro ao excluir card: ' + response.message);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      this.showError('Erro ao excluir card: ' + error.message);
    }
  }

  handleEditTaskModal(taskId) {
    // Buscar dados da tarefa na página
    const row = document.querySelector(`button[data-task-id="${taskId}"]`).closest('tr');
    if (!row) {
      this.showError('Tarefa não encontrada');
      return;
    }

    const cells = row.querySelectorAll('td');
    const taskName = cells[0].querySelector('strong').textContent;
    const description = cells[1].querySelector('span').textContent;
    
    // Extrair prioridade do badge
    const priorityBadge = cells[2].querySelector('.badge');
    let priority = '';
    if (priorityBadge && !priorityBadge.textContent.includes('N/A')) {
      const priorityText = priorityBadge.textContent.trim();
      if (priorityText.includes('Alta')) priority = 'High';
      else if (priorityText.includes('Média')) priority = 'Medium';
      else if (priorityText.includes('Baixa')) priority = 'Low';
    }
    
    // Extrair status do badge
    const statusBadge = cells[3].querySelector('.badge');
    const status = statusBadge.textContent.includes('Concluída') ? 'completed' : 'pending';

    // Preencher o modal de edição
    document.getElementById('editTaskId').value = taskId;
    document.getElementById('editTaskName').value = taskName;
    document.getElementById('editTaskDescription').value = description === 'Sem descrição' ? '' : description;
    document.getElementById('editTaskPriority').value = priority;
    document.getElementById('editTaskStatus').value = status;

    // Abrir o modal
    const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    modal.show();
  }

  async handleEditTask(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('editTaskId').value;
    const formData = new FormData(e.target);
    const data = {
      taskName: formData.get('taskName'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      status: formData.get('status')
    };

    console.log('Enviando dados da tarefa:', { taskId, data });

    try {
      const response = await this.makeRequest(`/admin/tasks/${taskId}/card`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      if (response.success) {
        this.showSuccess('Tarefa atualizada com sucesso!');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        this.showError('Erro ao editar tarefa: ' + response.message);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      this.showError('Erro ao editar tarefa: ' + error.message);
    }
  }

  async handleDeleteTask(taskId) {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) {
      return;
    }

    console.log('Deletando tarefa:', taskId);
    
    try {
      const response = await this.makeRequest(`/admin/tasks/${taskId}/card`, {
        method: 'DELETE'
      });

      if (response.success) {
        this.showSuccess('Tarefa excluída com sucesso!');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        this.showError('Erro ao excluir tarefa: ' + response.message);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      this.showError('Erro ao excluir tarefa: ' + error.message);
    }
  }

  async makeRequest(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    };

    const response = await fetch(url, defaultOptions);
    
    console.log('Resposta do servidor:', response.status);

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return { success: true };
      }
    } else {
      const error = await response.text();
      console.error('Erro do servidor:', error);
      return { success: false, message: error };
    }
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    // Criar uma notificação simples (pode ser substituída por um sistema mais sofisticado)
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
    alert.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alert);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 5000);
  }
}

// Inicialização automática quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
  // Estes valores serão injetados pelo EJS
  const cardId = window.CARD_DATA?.id;
  const projectId = window.CARD_DATA?.project_id;
  
  if (cardId && projectId) {
    new CardDetailsManager(cardId, projectId);
  }
});
