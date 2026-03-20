'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Logo from '../../components/Logo';

export default function LoginPage() {
  const [name, setName] = useState('');

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-12 max-w-sm mx-auto">
      <Logo />
      <p className="text-sm mt-2 mb-8 opacity-60 text-center">
        Sign in to track your streaks
      </p>

      {/* GitHub OAuth */}
      <button
        onClick={() => signIn('github', { callbackUrl: '/' })}
        className="w-full py-3 rounded-full font-semibold text-sm cursor-pointer transition-opacity hover:opacity-80 mb-3"
        style={{
          backgroundColor: 'var(--foreground)',
          color: 'var(--background)',
          border: 'none',
        }}
      >
        Sign in with GitHub
      </button>

      <div className="flex items-center gap-3 w-full my-4">
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        <span className="text-xs opacity-40">or</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
      </div>

      {/* Guest login */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            signIn('credentials', { name: name.trim(), callbackUrl: '/' });
          }
        }}
        className="w-full flex flex-col gap-3"
      >
        <input
          type="text"
          placeholder="Enter a display name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-sm border outline-none"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
          }}
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-3 rounded-full font-semibold text-sm cursor-pointer transition-opacity border"
          style={{
            borderColor: 'var(--foreground)',
            color: 'var(--foreground)',
            background: 'transparent',
            opacity: name.trim() ? 1 : 0.4,
          }}
        >
          Continue as Guest
        </button>
      </form>
    </div>
  );
}
