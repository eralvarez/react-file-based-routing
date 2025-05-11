import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <li>
            <Link to="/contact/me">Contact / Me</Link>
          </li>
          <li>
            <Link to="/contact/some-cool-id/edit">Contact Edit</Link>
          </li>
          <li>
            <Link to="/blog/1">Blog Post 1</Link>
          </li>
          <li>
            <Link to="/blog/2">Blog Post 2</Link>
          </li>
          <li>
            <Link to="/very/deep/route">Very deep route</Link>
          </li>
        </ul>
      </nav>
      <main>{children}</main>
    </div>
  );
}
