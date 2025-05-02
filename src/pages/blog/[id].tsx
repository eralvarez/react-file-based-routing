import { useParams } from 'react-router-dom';

export default function BlogPost() {
  const { id } = useParams();

  return (
    <div>
      <h1>Blog Post {id}</h1>
      <p>This is a dynamic blog post page for post #{id}.</p>
    </div>
  );
}
