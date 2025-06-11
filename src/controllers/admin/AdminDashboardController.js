const db = require('../../config/db');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    dashboard: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.redirect('/admin/login');
            }

            // Usar db.pool.execute ao invés de db.execute
            const [totalProjectsRows] = await db.pool.execute('SELECT COUNT(*) as count FROM projects');
            const [totalCompletedRows] = await db.pool.execute("SELECT COUNT(*) as count FROM projects WHERE work_status = 'Completed'");
            const [totalClientsRows] = await db.pool.execute('SELECT COUNT(*) as count FROM client');

            const totalProjects = totalProjectsRows[0].count;
            const totalCompleted = totalCompletedRows[0].count;
            const totalClients = totalClientsRows[0].count;

            const percentCompleted = totalProjects > 0 ? Math.round((totalCompleted / totalProjects) * 100) : 0;
            const remainingTasks = totalProjects - totalCompleted;

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

            completedByMonth.forEach(row => completedData[row.month - 1] = row.count_completed);
            inProgressByMonth.forEach(row => inProgressData[row.month - 1] = row.count_in_progress);

            const chartData = {
                completed: completedData,
                in_progress: inProgressData
            };

            // Salvar dados em JSON
            try {
                const jsonPath = path.join(__dirname, '../../public/js/pages/data.json');
                await fs.writeFile(jsonPath, JSON.stringify(chartData, null, 2));
            } catch (fileError) {
                console.warn('Erro ao salvar arquivo JSON:', fileError.message);
            }

            // Renderizar com os dados reais
            res.render('admin/dashboard', {
                pagetitle: 'Welcome to ProjectFlow',
                totalProjects,
                totalCompleted,
                percentCompleted,
                remainingTasks,
                totalClients,
                completedData,
                inProgressData,
                user: req.session.user
            });
            
        } catch (err) {
            console.error('Dashboard error:', err);
            res.status(500).json({
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
            });
        }
    }
};