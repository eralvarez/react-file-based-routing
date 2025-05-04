import { useState } from 'react';

interface Employee {
  id: number;
  name: string;
  age: number;
}

export default function HomePage({ initialData }: { initialData: Employee[] }) {
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

      <h2>Initial Data:</h2>
      <pre>{JSON.stringify(initialData, null, 2)}</pre>
    </div>
  );
}
