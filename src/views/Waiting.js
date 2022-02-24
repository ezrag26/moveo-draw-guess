import React, { useState, useEffect, useContext } from 'react'

import { useAutoRefresh } from '../hooks/refresh'
import { getStatus } from '../utils/api'

import UserContext from '../context/UserContext'

const Waiting = ({ gameId, userId }) => {
	const [status, setStatus] = useState()
	const { toggleLoggedIn } = useContext(UserContext)

	useAutoRefresh((stop) => {
		if (!userId || !gameId) return

		getStatus({ userId })
		.then(({ user }) => {
			user.status !== status && setStatus(user.status)

			if (!user.status) {
				setTimeout(() => stop(), 0)
				toggleLoggedIn()
			}
		})
	}, 2, [userId, gameId])

	return (
		<div>
		{
			status === 'WAITING' ?
			<h2>Waiting for another player to join...</h2> :
			status === 'WAITING_FOR_GUESS' ?
			<h2>Waiting for the other player to guess the word...</h2> :
			<div></div>

		}
		</div>
	)
}

export default Waiting
