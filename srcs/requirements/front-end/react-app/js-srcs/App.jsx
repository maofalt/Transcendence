import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './elements/Navbar'
import Home from './pages/Home'
import Create from './pages/Create'
import PageDetails from './elements/PageDetails'
import NotFound from './pages/NotFound'
import Game from './pages/Game'
import Options from './pages/Options'
import Profile from './pages/Profile'
import Login from './pages/Login'

function App() {
	const jsonUrl = '/api-proxy';

	return (
		<Router>
			<div className='App'>
				{/* <Navbar /> */}
				<div className="content">
					<Routes>
						<Route path='/' element={<Home jsonUrl={jsonUrl}/>} />
						<Route path='/game' element={<Game/>} />
						<Route path='/play' element={<Game/>} />
						<Route path='/profile' element={<Profile/>} />
						<Route path='/options' element={<Options/>} />
						<Route path='/login' element={<Login/>} />
						{/* <Route path='/create' element={<Create jsonUrl={jsonUrl}/>} /> */}
						{/* <Route path='/blog/:id' element={<PageDetails jsonUrl={jsonUrl}/>} /> */}
						<Route path='*' element={<NotFound />} />
					</Routes>
				</div>
			</div>
		</Router>
	)
}

export default App
