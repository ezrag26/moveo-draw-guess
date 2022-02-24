import React, { useState, useEffect } from 'react'

import { getWords, chooseWord } from '../utils/api'

const difficultyMap = {
	1: 'Easy',
	2: 'Medium',
	3: 'Hard'
}

const ChooseWords = ({ gameId, userId }) => {
	const [words, setWords] = useState([])
	const [word, setWord] = useState('')

	useEffect(() => {
		getWords({ gameId, userId })
		.then(({ words }) => {
			setWords(words)
		})
	}, [])

	useEffect(() => {
		if (!word) return

		chooseWord({ word, gameId, userId })
	}, [word])

	return (
		<div>
			<h2>Choose 1 of the following words to draw from.</h2>
			<h2>The harder the difficulty, the more points you earn!</h2>
			<div>
			{
				words.map(({ word, difficulty }) => {
					return (
						<button
							key={word}
							onClick={() => {
								setWord(word)
							}}
							className={'button--large'}
						>{difficultyMap[difficulty]} - <span style={{ textTransform: 'uppercase' }}>{word}</span>
						</button>
					)
				})
			}
			</div>
		</div>
	)
}

export default ChooseWords
