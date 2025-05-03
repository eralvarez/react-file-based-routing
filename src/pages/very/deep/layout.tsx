import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div>
      <h1>Deep layout:</h1>
      <div>{children}</div>
    </div>
  );
}
