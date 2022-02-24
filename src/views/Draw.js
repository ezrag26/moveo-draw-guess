import React, { useState, useEffect, useRef } from 'react'

import { getChosenWord, sendDrawing } from '../utils/api'

const getXYCoordinates = e => {
	return { x: e.clientX, y: e.clientY }
}

const Draw = ({ gameId, userId }) => {
	const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
	const [isDrawing, setIsDrawing] = useState(false)
	const canvas = useRef()
	const [context, setContext] = useState()
	const [strokeStyle, setStrokeStyle] = useState('black')
	const [data, setData] = useState([])
	const [word, setWord] = useState('')

	useEffect(() => {
		getChosenWord({ gameId, userId })
		.then(({ word }) => {
			setWord(word.word)
		})
	}, [])

	useEffect(() => {
		canvas.current = document.getElementById('canvas')
		setContext(canvas.current.getContext('2d'))
	}, [])

	useEffect(() => {
		if (!canvas.current) return

		canvas.current.width = window.innerWidth * .8
		canvas.current.height = window.innerHeight * .6

		setContext(canvas.current.getContext('2d'))
		setCanvasOffset({ x: canvas.current.offsetLeft, y: canvas.current.offsetTop })
	}, [canvas.current])

	useEffect(() => {
		if (!context) return

		context.lineWidth = 2
		context.lineCap = 'round'
	}, [context])

	useEffect(() => {
		if (!context) return

		context.strokeStyle = strokeStyle
	}, [strokeStyle])

	const startDrawing = (e) => {
		setIsDrawing(true)

		const xyCoordinates = getXYCoordinates(e)
		context.moveTo(xyCoordinates.x - canvasOffset.x, xyCoordinates.y - canvasOffset.y)

		setData(prev => [...prev, { ...relativeXYCoordinates(xyCoordinates), strokeStyle, t: Date.now() }])
	}

	const endDrawing = (e) => {
		setIsDrawing(false)
		context.beginPath()
		setData(prev => [...prev, { beginPath: true, t: Date.now() }])
	}

	const relativeXYCoordinates = (xyCoordinates) => {
		return {
			x: xyCoordinates.x - canvasOffset.x,
			y: xyCoordinates.y - canvasOffset.y
		}
	}

	const draw = (e) => {
		if (!isDrawing) return

		const xyCoordinates = getXYCoordinates(e)

		context.lineTo(xyCoordinates.x - canvasOffset.x, xyCoordinates.y - canvasOffset.y)
		context.stroke()
		setData(prev => [...prev, { ...relativeXYCoordinates(xyCoordinates), strokeStyle, t: Date.now() }])
	}

	const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'brown', 'black']

  return (
		<div>
			<h1>Your word to draw: <span style={{ textTransform: 'uppercase' }}>{word}</span></h1>
			<button onClick={() => sendDrawing({
				drawing: data,
				scale: { x: window.innerWidth * .8, y: window.innerHeight * .8 },
				gameId,
				userId
			})}>Send Drawing!</button>
			<div style={{ display: 'flex' }}>
				<canvas
					id={'canvas'}
					onMouseDown={startDrawing}
					onMouseUp={endDrawing}
					onMouseMove={draw}
				></canvas>
				<div>
				{
					colors.map(color => {
						return (
							<div
								key={color}
								className={'color-palette__color'}
								onClick={() => setStrokeStyle(color)}
								style={{ backgroundColor: color }}
							></div>
						)
					})
				}
				</div>
			</div>
		</div>
  );
}

export default Draw;
