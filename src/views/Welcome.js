import React, { useState, useEffect } from 'react'

import { getTopSessions } from '../utils/api'

const pointsPerMinute = (session) => {
	return Number((session.points / (session.t / 60 / 1000)).toFixed(1))
}

const Welcome = ({ join }) => {
	const [topSessions, setTopSessions] = useState([])

	useEffect(() => {
		getTopSessions()
		.then(sessions => {
			const s = sessions.map(pointsPerMinute)
			s.sort((a, b) => b - a)
			setTopSessions(s)
		})
	}, [])

	return (
		<div>
			<h1>Welcome to Draw & Guess!</h1>
			{
				topSessions.length !== 0 && <p>Here are the top sessions:</p>
			}
			{
				topSessions.map((sessionPointsPerMinute, i) => {
					return (
						<div key={i}>{sessionPointsPerMinute} points per minute</div>
					)
				})
			}
			<button className={'button--large'} onClick={join}>Join Game</button>
		</div>
	)
}

export default Welcome
