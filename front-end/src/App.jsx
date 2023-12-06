import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './Navbar'
import Home from './Home'
import Create from './Create'
import PageDetails from './PageDetails'
import NotFound from './NotFound'

function App() {
	const jsonUrl = "/api/proxy";

	return (
		<Router>
			<div className='App'>
				<Navbar />
				<div className="content">
					<Routes>
						<Route path='/' element={<Home jsonUrl={jsonUrl}/>} />
						<Route path='/create' element={<Create jsonUrl={jsonUrl}/>} />
						<Route path='/blog/:id' element={<PageDetails jsonUrl={jsonUrl}/>} />
						<Route path='*' element={<NotFound />} />
					</Routes>
				</div>
			</div>
		</Router>
	)
}

export default App
