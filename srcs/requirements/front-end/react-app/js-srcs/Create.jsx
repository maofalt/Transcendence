import { useState } from "react";

const Create = ({ jsonUrl }) => {
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [author, setAuthor] = useState('Yoel');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(false);
	
	const handleSubmit = (e) => {
		e.preventDefault();

		const data = { title, author, content: body };

		setIsLoading(true);
		fetch(jsonUrl, {
			method: 'POST',
			headers: { "content-type": "application/json" },
			body: JSON.stringify(data)
		}).then((res) => {
			setIsLoading(false);
			if (!res.ok)
				throw Error('smelly man: ' + res.status + ' ' + res.statusText);
			setTitle('');
			setBody('');
			setError(false);
			window.alert("Blog Posted!");
		}).catch(err => {
			window.alert(err);
			setError(true);
			setIsLoading(false);
		});
	};

	return (
		<div className="create-form">
			<h2>SUBMIT BLOG</h2>
			<form onSubmit={handleSubmit}>
				<label htmlFor="blog-title-input">Blog Title:</label>
				<input 
					type="text"
					name="title"
					id="blog-title-input"
					required
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>
				<label htmlFor="blog-body-input">Blog Body:</label>
				<textarea
					name="body"
					id="blog-body-input"
					required
					value={body}
					onChange={(e) => setBody(e.target.value)}
				></textarea>
				<label htmlFor="blog-author-input">Blog Author</label>
				<select
					name="author"
					id="blog-author-input"
					required
					value={author}
					onChange={(e) => setAuthor(e.target.value)}
				>
					<option value="Yoel">Yoel</option>
					<option value="Amanda">Amanda</option>
				</select>
				{ isLoading && !error ? <button>Loading...</button> : !error && <button>Submit</button> }
				{ error && <button>Try Again</button> }
			</form>
			{/* <p>{ title }</p>
			<p>{ body }</p>
			<p>{ author }</p> */}
		</div>
	);
}
 
export default Create;