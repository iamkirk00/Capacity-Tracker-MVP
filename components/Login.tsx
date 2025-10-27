
import React, { useState } from 'react';

interface LoginProps {
  onSetUserKey: (key: string) => void;
}

const Login: React.FC<LoginProps> = ({ onSetUserKey }) => {
  const [keyInput, setKeyInput] = useState('');

  const generateNewKey = () => {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    const newKey = '0x' + Array.from(array).map(n => n.toString(16).padStart(8, '0')).join('');
    onSetUserKey(newKey);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.match(/^0x[a-fA-F0-9]{32}$/)) {
      onSetUserKey(keyInput);
    } else {
      alert('Invalid key format. Please enter a valid key or generate a new one.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-brand-bg">
      <div className="w-full max-w-md p-8 space-y-8 bg-brand-surface rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-brand-text">Capacity Tracker</h1>
          <p className="mt-2 text-brand-subtle">Your personal energy dashboard</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="user-key" className="text-sm font-medium text-brand-subtle">
              Enter Your User Key
            </label>
            <input
              id="user-key"
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="e.g., 0x1a2b3c..."
              className="w-full px-4 py-2 mt-2 text-brand-text bg-brand-primary border border-brand-primary rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 font-semibold text-white bg-brand-secondary rounded-md hover:bg-opacity-90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-secondary"
          >
            Unlock Dashboard
          </button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-primary"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-brand-surface text-brand-subtle">Or</span>
          </div>
        </div>
        <button
          onClick={generateNewKey}
          className="w-full py-3 font-semibold text-brand-text bg-brand-primary rounded-md hover:bg-opacity-80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface focus:ring-brand-secondary"
        >
          Create New User Key
        </button>
        <p className="text-xs text-center text-brand-subtle">
          Your key is your private access. Save it in a safe place, like a password manager, or bookmark the page after logging in.
        </p>
      </div>
    </div>
  );
};

export default Login;
