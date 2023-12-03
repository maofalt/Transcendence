const deletePage = (jsonUrl) => {

	fetch(jsonUrl, { method: 'Delete' })
	.then(res => {
		if (!res.ok)
			throw Error('deleting failed: ' + res.status + ' ' + res.statusText);
		// window.alert("page deleted!");
	})
	.catch(err => {
		window.alert(err);
		return (false);
	});

	return (true);
}
 
export default deletePage;