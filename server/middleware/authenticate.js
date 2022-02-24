module.exports = {
	authenticate: (req, res, next) => {
		const { user: userId } = req.query
		const { gameId = 0 } = req.params
		const { users, games } = req.app.locals

		res.locals.authentication = {
			user: users.find(user => user.id === parseInt(userId, 10)),
			game: games.find(game => game.id === parseInt(gameId, 10)) ||
						games.find(game => game.users.includes(parseInt(userId, 10)))
		}

		if (!res.locals.authentication.user) return res.sendStatus(401)

		next()
	}
}
