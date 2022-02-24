import { useState, useEffect } from 'react'

export const useAutoRefresh = (cb, interval, dependencies) => {
	useEffect(() => {
		cb(() => {})

		const intervalId = setInterval(() => {
			cb(() => {
				clearInterval(intervalId)
			})
		}, interval * 1000)

		return () => clearInterval(intervalId)
	}, dependencies)
}
