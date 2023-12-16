import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './Elements/Navbar'
import Home from './Pages/Home'
import Create from './Pages/Create'
import PageDetails from './Elements/PageDetails'
import NotFound from './Pages/NotFound'

function App() {
	const jsonUrl = '/api-proxy';

	return (
		<Router>
			<div className='App'>
				{/* <Navbar /> */}
				<div className="content">
					<Routes>
						<Route path='/' element={<Home jsonUrl={jsonUrl}/>} />
						{/* <Route path='/game' element={<Game/>} /> */}
						{/* <Route path='/play' element={<Game/>} /> */}
						{/* <Route path='/profile' element={<Profile/>} /> */}
						{/* <Route path='/options' element={<Options/>} /> */}
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
