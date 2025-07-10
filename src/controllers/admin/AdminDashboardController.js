const db = require('../../config/db');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    dashboard: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.redirect('/admin/login');
            }

            // Métricas principais
            const [[{ count: totalProjects }]] = await db.pool.execute('SELECT COUNT(*) as count FROM projects');
            const [[{ count: totalCompleted }]] = await db.pool.execute("SELECT COUNT(*) as count FROM projects WHERE work_status = 'Completed'");
            const [[{ count: totalClients }]] = await db.pool.execute('SELECT COUNT(*) as count FROM client');

            const percentCompleted = totalProjects > 0 ? Math.round((totalCompleted / totalProjects) * 100) : 0;

            // Contagem de tarefas por status
            const [[{ count: countPendingTasks }]] = await db.pool.execute("SELECT COUNT(*) as count FROM tasks WHERE status = 'Pending'");
            const [[{ count: countInProgressTasks }]] = await db.pool.execute("SELECT COUNT(*) as count FROM tasks WHERE status = 'In Progress'");
            const [[{ count: countCompletedTasks }]] = await db.pool.execute("SELECT COUNT(*) as count FROM tasks WHERE status = 'Completed'");

            // Dados para gráfico mensal (projetos concluídos e em andamento)
            const [completedByMonth] = await db.pool.execute(`
                SELECT MONTH(start_date) AS month, COUNT(*) AS count_completed 
                FROM projects 
                WHERE work_status = 'Completed' 
                GROUP BY month
                ORDER BY month
            `);

            const [inProgressByMonth] = await db.pool.execute(`
                SELECT MONTH(start_date) AS month, COUNT(*) AS count_in_progress 
                FROM projects 
                WHERE work_status = 'On Progress' 
                GROUP BY month
                ORDER BY month
            `);

            const completedData = Array(12).fill(0);
            const inProgressData = Array(12).fill(0);

            completedByMonth.forEach(row => {
                if (row.month >= 1 && row.month <= 12) {
                    completedData[row.month - 1] = row.count_completed;
                }
            });

            inProgressByMonth.forEach(row => {
                if (row.month >= 1 && row.month <= 12) {
                    inProgressData[row.month - 1] = row.count_in_progress;
                }
            });

            const chartData = {
                completed: completedData,
                in_progress: inProgressData
            };

            // Salvar como JSON (pode ser usado em gráficos futuros)
            try {
                const jsonPath = path.join(__dirname, '../../public/js/pages/data.json');
                await fs.writeFile(jsonPath, JSON.stringify(chartData, null, 2));
            } catch (fileError) {
                console.warn('⚠️ Erro ao salvar JSON de gráfico:', fileError.message);
            }

            // Renderização da dashboard com dados
            res.render('admin/dashboard', {
                pagetitle: 'Bem-Vindo ao ProjectFlow',
                totalProjects,
                totalCompleted,
                percentCompleted,
                totalClients,
                countPendingTasks,
                countInProgressTasks,
                countCompletedTasks,
                completedData,
                inProgressData,
                user: req.session.user
            });

        } catch (err) {
            console.error('❌ Erro no dashboard:', err);
            res.status(500).json({
                error: 'Erro Interno no Servidor',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
            });
        }
    }
};
