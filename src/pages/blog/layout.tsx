import { PropsWithChildren } from 'react';

export default function BlogLayout({ children }: PropsWithChildren) {
  return (
    <div>
      <h1>Blog layout:</h1>
      <div>{children}</div>
    </div>
  );
}
