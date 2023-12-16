import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../utils/useFetch";
import deletePage from "../utils/deletePage";

const PageDetails = ({ jsonUrl }) => {
	const { id } = useParams();
	const { data, isLoading, error } = useFetch(jsonUrl + id);
	const nav = useNavigate();

	return (
		<>
			{ error && <h1 className="errorMsg">Error: { error.message }</h1> }
			{ isLoading && <div>Loading...</div> }
			{ data && 
				<div className="page-details">
					<h2 className="blog-title">{ data.title }</h2>
					<p className="blog-content">{ data.content }</p>
					<p className="blog-author">{ data.author }</p>
					<button onClick={ () => 
						{
							if (deletePage(jsonUrl + id))
							{
								nav("/");
								window.alert("page deleted!");
							}
							else
								console.log("try agin bozo");
						} }>delete page
					</button>
				</div>
			}
		</>
	);
}
 
export default PageDetails;