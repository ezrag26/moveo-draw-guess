import React, { useState, useEffect } from 'react'

import { useAutoRefresh } from './hooks/refresh'

import Welcome from './views/Welcome'
import Waiting from './views/Waiting'
import Draw from './views/Draw'
import Guess from './views/Guess'
import ChooseWords from './views/ChooseWords'
import UserContext from './context/UserContext'

import { joinGame, leaveGame, getStatus } from './utils/api'

import './App.css'
import './styles/button.css'
import './styles/canvas.css'

function App() {
	const [userId, setUserId] = useState()
	const [status, setStatus] = useState()
	const [gameId, setGameId] = useState()
	const [loggedIn, setLoggedIn] = useState(false)

	const join = () => {
		joinGame()
		.then(({ user, gameId }) => {
			setUserId(user.id)
			setStatus(user.status)
			setGameId(gameId)
			setLoggedIn(true)
		})
	}

	useAutoRefresh((stop) => {
		if (!userId) return

		getStatus({ userId })
		.then(({ user }) => {
			user.status !== status && setStatus(user.status)

			if (!user.status) {
				setTimeout(() => stop(), 0)
				setLoggedIn(false)
			}
		})
	}, 2, [userId])

  return (
    <div className="App">
      <header className="App-header">
				<div>Draw & Guess</div>
				{
					loggedIn && <button onClick={() => leaveGame({ userId })}>Leave Game</button>
				}
      </header>
			<UserContext.Provider value={{ loggedIn, toggleLoggedIn: () => setLoggedIn(!loggedIn) }}>
				<main style={{ display: 'flex', justifyContent: 'center' }}>
				{
					!loggedIn ? <Welcome join={join}/> :
					status === 'DRAWING' ? <Draw gameId={gameId} userId={userId}/> :
					status === 'GUESSING' ? <Guess gameId={gameId} userId={userId}/> :
					status === 'WAITING' || status === 'WAITING_FOR_GUESS' ? <Waiting gameId={gameId} userId={userId}/> :
					status === 'WORDS' ? <ChooseWords gameId={gameId} userId={userId}/> :
					<div></div>
				}
				</main>
				</UserContext.Provider>
    </div>
  );
}

export default App;
