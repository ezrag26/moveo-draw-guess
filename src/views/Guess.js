import React, { useState, useEffect, useRef } from 'react'

import { guessDrawing, getDrawing } from '../utils/api'
import { useAutoRefresh } from '../hooks/refresh'

const Guess = ({ gameId, userId }) => {
	const [drawing, setDrawing] = useState({ drawing: [], scale: {} })
	const [guess, setGuess] = useState('')
	const canvas = useRef()
	const [context, setContext] = useState()

	useEffect(() => {
		canvas.current = document.getElementById('redraw')
		// setContext(canvas.current.getContext('2d'))
	}, [])

	useEffect(() => {
		if (!canvas.current) return

		canvas.current.width = window.innerWidth * .8
		canvas.current.height = window.innerHeight * .6

		setContext(canvas.current.getContext('2d'))
	}, [canvas.current])

	useEffect(() => {
		if (context) {
			// context.scale(.5, .5)
		}
	}, [context])

	useAutoRefresh((stop) => {
		if (!gameId || !userId) return

		getDrawing({ gameId, userId })
		.then(({ drawing, scale }) => {
			if (drawing.length) {
				stop()
				setDrawing({ drawing, scale })
			}
		})
	}, 2, [userId, gameId])

	useEffect(() => {
		if (drawing.drawing.length === 0) return
		context.scale(canvas.current.width / drawing.scale.x, canvas.current.height / drawing.scale.y)

		redraw()
	}, [drawing.drawing])

	const redraw = () => {
		const draw = (points, i = 1) => {
			if (points.length === i) return
			const { x, y, strokeStyle, beginPath, t } = points[i]

			if (beginPath) context.beginPath()
			else {
				context.strokeStyle = strokeStyle
				context.lineTo(x, y)
				context.stroke()
			}

			setTimeout(() => draw(points, i + 1), t - points[i - 1].t)
		}

		const [firstPoint, ...rest] = drawing.drawing

		context.lineWidth = 2
		context.lineCap = 'round'

		context.moveTo(firstPoint.x, firstPoint.y)

		draw(drawing.drawing)

		// rest.map(({ x, y, strokeStyle, beginPath }) => {
		// 	if (beginPath) context.beginPath()
		// 	else {
		// 		context.strokeStyle = strokeStyle
		// 		context.lineTo(x, y)
		// 		context.stroke()
		// 	}
		// })
	}

  return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
		{
			drawing.drawing.length === 0 && <h2>Waiting for player to send a drawing...</h2>
		}
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<h1></h1>
				<canvas id={'redraw'} style={{ border: '1px solid black' }}>
				</canvas>
				<div>
					<input
						value={guess}
						onChange={e => setGuess(e.target.value)}

					/>
					<button onClick={() => guessDrawing({ word: guess, gameId, userId })} disabled={!guess.length}>Guess</button>
				</div>
			</div>
		</div>
  );
}

export default Guess;
