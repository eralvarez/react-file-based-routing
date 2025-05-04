import { useState } from "react";

export default function Page() {
  const [throwError, setThrowError] = useState(false);

  if (throwError) {
    throw new Error('This is a test error!');
  }

  const handleTriggerError = () => {
    setThrowError(true);
  };

  return (
    <div>
      <span>Contact page</span>
      <button onClick={handleTriggerError}>Trigger Error</button>
    </div>
  );
}
