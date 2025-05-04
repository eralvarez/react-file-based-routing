import { useState } from 'react';

export default function HomePage() {
  const [throwError, setThrowError] = useState(false);

  if (throwError) {
    throw new Error('This is a test error!');
  }

  const handleTriggerError = () => {
    setThrowError(true);
  };

  return (
    <div>
      <h1>Welcome to File-based Routing Example</h1>
      <p>This is the home page.</p>
      <button onClick={handleTriggerError}>Trigger Error</button>
    </div>
  );
}
