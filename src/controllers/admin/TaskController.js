const db = require('../../config/db');

exports.getTasksPage = async (req, res) => {
    try {
        const [users] = await db.query("SELECT username FROM employees");
        const [tasks] = await db.query("SELECT task_name FROM tasks");
        const [projects] = await db.query("SELECT project_title FROM projects");

        res.render('admin/tasks', {
            usernames: users.map(u => u.username),
            tasknames: tasks.map(t => t.task_name),
            projectnames: projects.map(p => p.project_title),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao carregar a página de tarefas.");
    }
};

exports.createTask = async (req, res) => {
    const { task_name, project_name, description, priority, start_date, due_date } = req.body;

    if (!task_name || !project_name) {
        return res.render('partials/alert', { error: "Task e projeto são obrigatórios." });
    }

    try {
        const insertQuery = `
            INSERT INTO tasks (task_name, project_name, description, priority, start_date, due_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.query(insertQuery, [task_name, project_name, description, priority, start_date, due_date]);

        await db.query("UPDATE projects SET work_status = 'Pending' WHERE project_title = ?", [project_name]);

        res.render('partials/success', { message: `'${task_name}' adicionada com sucesso e status do projeto atualizado.` });
    } catch (err) {
        console.error(err);
        res.render('partials/alert', { error: "Erro ao adicionar a tarefa." });
    }
};

exports.assignTask = async (req, res) => {
  const { username, taskname } = req.body;

  try {
    // Buscar o ID do funcionário
    const [employeeResult] = await db.query(
      'SELECT id FROM employees WHERE username = ?', [username]
    );
    if (employeeResult.length === 0) {
      return res.render('partials/alert', { error: 'Employee not found' });
    }
    const employee_id = employeeResult[0].id;

    // Buscar o ID da tarefa
    const [taskResult] = await db.query(
      'SELECT id FROM tasks WHERE task_name = ?', [taskname]
    );
    if (taskResult.length === 0) {
      return res.render('partials/alert', { error: 'Task not found' });
    }
    const task_id = taskResult[0].id;

    // Inserir na tabela de atribuições
    await db.query(
      'INSERT INTO assignment (task_id, employee_id) VALUES (?, ?)',
      [task_id, employee_id]
    );

    // Recontar e atualizar total_assigned para cada tarefa
    const [counts] = await db.query(`
      SELECT task_id, COUNT(*) AS total_count
      FROM assignment
      GROUP BY task_id
    `);

    for (const row of counts) {
      await db.query(
        'UPDATE tasks SET total_assigned = ? WHERE id = ?',
        [row.total_count, row.task_id]
      );
    }

    const success = `'${taskname}' assigned to '${username}' successfully!`;
    res.render('partials/success', { message: success });
  } catch (error) {
    console.error(error);
    res.render('partials/alert', { error: 'Erro ao atribuir tarefa' });
  }
};

