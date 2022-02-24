const postJSON = ({ url = '', body = {} }) => {
	return fetch(url, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json'
		}
	})
}

const getJSON = ({ url = '' }) => {
	return fetch(url)
		.then(res => res.json())
}

const BASE_URL = 'http://127.0.0.1:8888'

export const getTopSessions = () => {
	return getJSON({ url: `${BASE_URL}/top-sessions` })
}

export const joinGame = () => {
	return postJSON({
		url: `${BASE_URL}/join`
	})
	.then(res => res.json())
}

export const leaveGame = ({ userId }) => {
	return postJSON({
		url: `${BASE_URL}/leave-game?user=${userId}`
	})
}

export const getStatus = ({ userId }) => {
	return getJSON({ url: `${BASE_URL}/status?user=${userId}` })
}

export const guessDrawing = ({ word, gameId, userId }) => {
	return postJSON({
		url: `${BASE_URL}/${gameId}/guess?user=${userId}`,
		body: { word },
	})
	.then(res => res.json())
}

export const getDrawing = ({ gameId, userId }) => {
	return getJSON({ url: `${BASE_URL}/${gameId}/drawing?user=${userId}` })
}

export const sendDrawing = ({ drawing, scale, gameId, userId }) => {
	return postJSON({
		url: `${BASE_URL}/${gameId}/draw?user=${userId}`,
		body: {
			scale,
			drawing
		},
	})
}

export const getChosenWord = ({ gameId, userId }) => {
	return getJSON({ url: `${BASE_URL}/${gameId}/word?user=${userId}` })
}

export const getWords = ({ gameId, userId }) => {
	return getJSON({ url: `${BASE_URL}/${gameId}/words?user=${userId}` })
}

export const chooseWord = ({ word, gameId, userId }) => {
	return postJSON({
		url: `${BASE_URL}/${gameId}/word?user=${userId}`,
		body: { word }
	})
}
