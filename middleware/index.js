function loggedOut(req, res, next) {
	if (req.session && req.session.userId) {
		return res.redirect('/profile');
	}
	return next();
}

function requiresLogin(req, res, next) {
	if (req.session && req.session.userId) {
		return next();
	}
	var err = new Error('You are not authorized to view this page.');
	err.status = 403; // 'forbidden'
	return next(err);
}

module.exports.requiresLogin = requiresLogin;
module.exports.loggedOut = loggedOut;