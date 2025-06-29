const path = require('path');
const multer = require('multer');
const { pool } = require('../../config/db');


exports.getTasksPage = async (req, res) => {
    try {
        const [users] = await pool.execute("SELECT username FROM employees");
        const [tasks] = await pool.execute("SELECT task_name FROM tasks");
        const [projects] = await pool.execute("SELECT project_title FROM projects");

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
        req.session.error = "Task e projeto são obrigatórios.";
        return res.redirect('/admin/tasks');
    }

    try {
        await pool.execute(`
            INSERT INTO tasks (task_name, project_name, description, priority, start_date, due_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [task_name, project_name, description, priority, start_date, due_date]);

        await pool.execute("UPDATE projects SET work_status = 'Pending' WHERE project_title = ?", [project_name]);

        req.session.success = `'${task_name}' adicionada com sucesso e status do projeto atualizado.`;
        return res.redirect('/admin/tasks');
    } catch (err) {
        console.error(err);
        req.session.error = "Erro ao adicionar a tarefa.";
        return res.redirect('/admin/tasks');
    }
};

exports.assignTask = async (req, res) => {
    const { username, taskname } = req.body;

    try {
        const [employeeResult] = await pool.execute(
            'SELECT id FROM employees WHERE username = ?', [username]
        );
        if (employeeResult.length === 0) {
            req.session.error = 'Funcionário não encontrado.';
            return res.redirect('/admin/tasks');
        }
        const employee_id = employeeResult[0].id;

        const [taskResult] = await pool.execute(
            'SELECT id FROM tasks WHERE task_name = ?', [taskname]
        );
        if (taskResult.length === 0) {
            req.session.error = 'Tarefa não encontrada.';
            return res.redirect('/admin/tasks');
        }
        const task_id = taskResult[0].id;

        await pool.execute(
            'INSERT INTO assignment (task_id, employee_id) VALUES (?, ?)',
            [task_id, employee_id]
        );

        const [counts] = await pool.execute(`
            SELECT task_id, COUNT(*) AS total_count
            FROM assignment
            GROUP BY task_id
        `);

        for (const row of counts) {
            await pool.execute(
                'UPDATE tasks SET total_assigned = ? WHERE id = ?',
                [row.total_count, row.task_id]
            );
        }

        req.session.success = `'${taskname}' atribuída a '${username}' com sucesso!`;
        return res.redirect('/admin/tasks');

    } catch (error) {
        console.error(error);
        req.session.error = 'Erro ao atribuir tarefa.';
        return res.redirect('/admin/tasks');
    }
};


exports.updateTasks = async (req, res) => {
  try {
    const { card_id, tasks = '', completed_tasks = [] } = req.body;
    const userId = req.session?.admin?.id || req.session?.user?.id;

    if (!card_id || !userId) {
      return res.status(400).send('Missing card ID or user session');
    }

    // Divide as tarefas em array
    const taskArray = tasks.split(',').map(task => task.trim());
    const completedArray = Array.isArray(completed_tasks) ? completed_tasks : [completed_tasks];

    // Remove tarefas concluídas da lista
    const updatedTasks = taskArray.filter(task => !completedArray.includes(task));
    const updatedTasksString = updatedTasks.join(', ');

    // Atualiza a tabela de cards
    await pool.execute('UPDATE cards SET tasks = ? WHERE id = ?', [updatedTasksString, card_id]);

    // Insere tarefas concluídas
    if (completedArray.length > 0) {
      const insertQuery = 'INSERT INTO completed_tasks (user_id, card_id, completed_task) VALUES (?, ?, ?)';
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        for (const task of completedArray) {
          await connection.execute(insertQuery, [userId, card_id, task]);
        }

        await connection.commit();
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }

    return res.status(200).send('Tasks updated successfully.');
  } catch (error) {
    console.error('Erro ao atualizar tarefas:', error);
    return res.status(500).send('Erro interno no servidor');
  }
};


// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../public/images/work'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // ou: Date.now() + '-' + file.originalname
  }
});
const upload = multer({ storage });

exports.uploadMiddleware = upload.single('attachment_file');

exports.handleTaskContent = async (req, res) => {
  const projectName = req.query.data;
  const task = req.body.taskname;
  const attachment = req.file?.originalname;

  if (!task || !attachment) {
    return res.render('partials/alert', {
      error: 'Error: Task and attachment cannot be empty.'
    });
  }

  try {
    // Inserir conteúdo da tarefa
    const insertQuery = 'INSERT INTO content (`task`, `attachment`, `date`) VALUES (?, ?, NOW())';
    await pool.execute(insertQuery, [task, attachment]);

    // Atualizar status do projeto
    const updateQuery = "UPDATE projects SET work_status = 'Completed' WHERE project_title = ?";
    await pool.execute(updateQuery, [projectName]);

    const success = `New Content Update successfully For Task: '${task}' - Project '${projectName}' updated.`;
    return res.render('partials/success', { success });

  } catch (err) {
    console.error('Erro ao inserir tarefa:', err);
    return res.render('partials/alert', { error: 'Database error: ' + err.message });
  }
};

// Função para lidar com a conclusão de tarefas
// Esta função deve ser chamada quando um usuário marca uma tarefa como concluída

exports.handleTaskCompletion = async (req, res) => {
  const { user_id, card_id, task_id } = req.body;

  try {
    const [assignmentCheck] = await pool.execute(
      'SELECT * FROM assignment WHERE employee_id = ? AND task_id = ?',
      [user_id, task_id]
    );

    if (assignmentCheck.length === 0) {
      return res.render('partials/alert', { error: 'Você não está atribuído a essa tarefa.' });
    }

    await pool.execute(
      'INSERT INTO completed_tasks (user_id, card_id, task_id, completed_task) VALUES (?, ?, ?, NOW())',
      [user_id, card_id, task_id]
    );

    await pool.execute(
      'UPDATE assignment SET status = ? WHERE employee_id = ? AND task_id = ?',
      ['Complete', user_id, task_id]
    );

    const [countRows] = await pool.execute(
      'SELECT task_id, COUNT(*) AS total_count FROM assignment GROUP BY task_id'
    );

    for (const row of countRows) {
      await pool.execute(
        'UPDATE tasks SET total_assigned = ? WHERE id = ?',
        [row.total_count, row.task_id]
      );
    }

    const [completedCheck] = await pool.execute(
      'SELECT * FROM assignment WHERE task_id = ? AND status = ?',
      [task_id, 'Complete']
    );

    if (completedCheck.length > 0) {
      await pool.execute(`
        INSERT INTO old_complete (user_id, card_id, task_id, completed_task)
        SELECT user_id, card_id, task_id, completed_task FROM completed_tasks
        WHERE task_id = ? AND user_id = ?
      `, [task_id, user_id]);

      await pool.execute(
        'DELETE FROM completed_tasks WHERE task_id = ? AND user_id = ?',
        [task_id, user_id]
      );

      await pool.execute(
        'DELETE FROM assignment WHERE task_id = ? AND employee_id = ? AND status = ?',
        [task_id, user_id, 'Complete']
      );

      // ❌ Esta linha deleta tarefa da tabela de tarefas. Cuidado!
      // await pool.execute(
      //   'DELETE FROM tasks WHERE task_id = ? AND card_id = ? AND status = ?',
      //   [task_id, card_id, 'Complete']
      // );
    }

    return res.render('partials/success', { message: 'Tarefa concluída com sucesso.' });

  } catch (err) {
    console.error('Erro ao concluir tarefa:', err);
    return res.render('partials/alert', { error: 'Erro ao concluir tarefa.' });
  }
};
