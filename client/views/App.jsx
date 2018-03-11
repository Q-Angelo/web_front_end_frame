import React from 'react';

import routers from '../../config/route';

export default class App extends React.Component{
	componentDidMount() {
	      
	}

	render(){
		return [
			<div>This is app 123</div>,
			<routers />,
		]
	}
}