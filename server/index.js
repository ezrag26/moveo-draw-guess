const express = require('express')
const cors = require('cors')
const randomWords = require('random-words')
const { authenticate } = require('./middleware/authenticate')
require('dotenv').config()

const {
	PORT = 8888
} = process.env

const userStates = {
	WAITING: 'WAITING',
	GUESSING: 'GUESSING',
	WORDS: 'WORDS',
	DRAWING: 'DRAWING',
	WAITING_FOR_GUESS: 'WAITING_FOR_GUESS'
}

const getUserById = ({ id }) => {
	return app.locals.users.find(user => user.id === id) || {}
}

const wordDifficultyPoints = {
	1: 1,
	2: 3,
	3: 5
}

let userId = 0
let gameId = 0

const app = express()

app.locals.users = []
app.locals.games = []
app.locals.topSessions = []

app.use(cors({ origin: '*' }))
app.use(express.json())

app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`)

	next()
})

app.get('/', (req, res) => {
	return res.sendStatus(200)
})

app.get('/top-sessions', (req, res) => {
	return res.send(app.locals.topSessions.filter(session => session.points > 0))
})

app.post('/join', (req, res) => {
	const { users, games } = app.locals

	openGames = games.filter(game => game.users.length < 2)
	const newUser = { id: ++userId }

	if (openGames.length) {
		const game = openGames[0]

		if (game.users.length) {
			newUser.status = userStates.GUESSING

			const user1 = getUserById({ id: game.users[0] })
			user1.status = userStates.WORDS
			game.words = randomWords({ exactly: 3 }).map((word, i) => ({ word, difficulty: i + 1 }))
			game.session = { start: Date.now(), points: 0 }
		} else {
			newUser.status = userStates.WAITING
		}

		users.push(newUser)
		game.users.push(newUser.id)

		return res.send({ gameId: game.id, user: newUser })

	} else {
		++gameId

		newUser.status = userStates.WAITING
		users.push(newUser)
		games.push({ id: gameId, users: [newUser.id] })

		return res.send({ gameId, user: newUser })
	}
})

app.get('/status', authenticate, (req, res) => {
	const { user, game = {} } = res.locals.authentication

	return res.send({
		gameId: game.id,
		user
	})
})

app.get('/:gameId/drawing', authenticate, (req, res) => {
	const { user, game } = res.locals.authentication

	const { drawing } = game

	return res.send({
		drawing: user.status === userStates.GUESSING && drawing ? drawing : [],
		scale: user.status === userStates.GUESSING && drawing ? game.scale : {}
	})
})

app.get('/:gameId/words', authenticate, (req, res) => {
	const { user, game } = res.locals.authentication

	return res.send({
		words: user.status === userStates.WORDS ? game.words : [],
	})
})

app.get('/:gameId/word', authenticate, (req, res) => {
	const { user, game } = res.locals.authentication

	return res.send({
		word: user.status === userStates.DRAWING ? game.word : {}
	})
})

app.post('/:gameId/word', authenticate, (req, res) => {
	const { user, game } = res.locals.authentication
	const { word } = req.body

	game.word = game.words.find(({ word: w }) => w === word)
	game.words = []
	user.status = userStates.DRAWING

	return res.sendStatus(200)
})

const getGameUsers = ({ game }) => {
	return app.locals.users.filter(user => game.users.includes(user.id))
}

app.post('/:gameId/draw', authenticate, (req, res) => {
	const { user, game } = res.locals.authentication
	const { drawing, scale } = req.body

	if (game) {
		game.drawing = drawing
		game.scale = scale

		const [user1, user2] = getGameUsers({ game })
		if (user1.id === user.id) {
			user1.status = userStates.WAITING_FOR_GUESS
			user2.status = userStates.GUESSING
		} else {
			user1.status = userStates.GUESSING,
			user2.status = userStates.WAITING_FOR_GUESS
		}

		return res.sendStatus(200)
	}

	return res.sendStatus(404)
})

app.post('/:gameId/guess', authenticate, (req, res) => {
	const { user, game } = res.locals.authentication
	const { word } = req.body

	if (game.word.word.toLowerCase() === word.toLowerCase()) {
		const [user1, user2] = getGameUsers({ game })
		game.session.points += wordDifficultyPoints[game.word.difficulty]
		game.word = {}
		game.drawing = []
		game.scale = {}
		game.words = randomWords({ exactly: 3 }).map((word, i) => ({ word, difficulty: i + 1 }))

		if (user1.id === user.id) {
			user1.status = userStates.WORDS
			user2.status = userStates.GUESSING
		} else {
			user1.status = userStates.GUESSING
			user2.status = userStates.WORDS
		}

		return res.send({ result: 'Correct', word })
	} else {
		return res.send({ result: 'Incorrect' })
	}
})

app.post('/leave-game', authenticate, (req, res) => {
	const { user, game } = res.locals.authentication

	user.status = ''
	game.users = game.users.filter(userId => userId !== user.id)
	app.locals.topSessions = [...app.locals.topSessions, { t: Date.now() - (game.session.start || 0), points: game.session.points }]
	game.session = { points: 0 }
	game.words = []
	game.word = {}
	game.drawing = []
	game.scale = {}
	getUserById({ id: game.users[0] }).status = userStates.WAITING

	res.sendStatus(200)
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
