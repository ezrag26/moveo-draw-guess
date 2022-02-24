import React from 'react'

const UserContext = React.createContext({
	loggedIn: false,
	toggleLoggedIn: () => {}
})

export default UserContext
