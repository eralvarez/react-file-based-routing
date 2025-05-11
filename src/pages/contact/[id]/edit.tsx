import { useParams } from 'react-router-dom';
export default function EditPage() {
  const { id } = useParams();

  return (
    <div>
      <h1>Edit</h1>
      <p>This is the edit page. {id}</p>
    </div>
  );
}
