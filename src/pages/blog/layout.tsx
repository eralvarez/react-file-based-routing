import { Outlet } from 'react-router-dom';

export default function BlogLayout() {
  return (
    <div>
      <h1>Blog layout:</h1>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
