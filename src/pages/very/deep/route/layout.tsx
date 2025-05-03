import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div>
      <h1>Route layout:</h1>
      <div>{children}</div>
    </div>
  );
}
