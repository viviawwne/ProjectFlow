module.exports = (req, res, next) => {
    // Verifica se o usuário está autenticado
    if (req.session && req.session.user) {
        return next(); // Usuário autenticado, prossegue para a próxima rota
    } else {
        // Usuário não autenticado, redireciona para a página de login
        return res.redirect('/admin/login');
    }
}