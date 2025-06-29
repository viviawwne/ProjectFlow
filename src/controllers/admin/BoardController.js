const { pool } = require('../../config/db');

exports.renderBoard = async (req, res) => {
  try {
    const [cards] = await pool.execute('SELECT * FROM cards');
    const [tasks] = await pool.execute('SELECT * FROM tasks');
    const [employees] = await pool.execute('SELECT * FROM employees');

    // Junta tarefas por card
    const cardsWithTasks = cards.map(card => {
      const relatedTasks = tasks.filter(task => task.card_id === card.id);
      return { ...card, tasks: relatedTasks };
    });

    // Filtragem por status
    const todoCards = cardsWithTasks.filter(c => c.status === 'todo');
    const progressCards = cardsWithTasks.filter(c => c.status === 'progress');
    const reviewCards = cardsWithTasks.filter(c => c.status === 'review');
    const approvedCards = cardsWithTasks.filter(c => c.status === 'approved');

    // Consulta de tarefas atribuídas (com nomes)
    const [assignmentQuery] = await pool.execute(`
    SELECT a.id, a.task_id, t.task_name
    FROM assignment a
    JOIN tasks t ON a.task_id = t.id
    `);

    const assignmentData = assignmentQuery.map(row => ({
    id: row.id,
    task_id: row.task_id,
    task_name: row.task_name
    }));


    // ID do usuário logado (admin ou user)
    const employeeId = req.session?.admin?.id || req.session?.user?.id || null;

    res.render('admin/board', {
      todoCards,
      progressCards,
      reviewCards,
      approvedCards,
      tasks,
      employees,
      taskNames: assignmentData.map(a => a.task_name),
      employee_id: employeeId
    });

  } catch (error) {
    console.error('❌ Erro ao carregar o board:', error);
    res.status(500).send('Erro ao carregar o board');
  }
};
