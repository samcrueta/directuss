"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const demoCredentials = {
  student: {
    email: 'student@directus.com',
    password: 'password12345',
  },
  admin: {
    email: 'admin@directus.com',
    password: 'password12345',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Mock authentication logic
    if (email === demoCredentials.student.email && password === demoCredentials.student.password) {
      router.push('/dashboard');
    } else if (email === demoCredentials.admin.email && password === demoCredentials.admin.password) {
      router.push('/admin');
    } else {
      setError('Invalid email or password. Please use the provided test credentials.');
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-custom py-3">
        <div className="container">
          <Link href="/" className="navbar-brand text-white fw-bold fs-5 tracking-tight d-flex align-items-center gap-2">
            <div style={{width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '4px'}}></div>
            DIRECTUS
          </Link>
        </div>
      </nav>

      <main className="container py-5 my-5 d-flex justify-content-center">
        <div className="card-premium p-5 text-center" style={{maxWidth: '400px', width: '100%'}}>
          <h2 className="fw-bold mb-4">Welcome Back</h2>
          <p className="text-muted-custom mb-4">Log in to your account to continue learning.</p>
          
          <form onSubmit={handleLogin} className="d-flex flex-column gap-3 mb-4 text-start">
             {error && (
               <div className="p-2 mb-2 rounded text-danger small text-center" style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)'}}>
                 {error}
               </div>
             )}
             <div>
                <label className="text-muted-custom small mb-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder="you@example.com" 
                  required
                />
             </div>
             <div>
                <label className="text-muted-custom small mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder="••••••••" 
                  required
                />
             </div>
             <button type="submit" className="btn btn-primary-custom w-100 mt-2">Sign In</button>
          </form>

          <div className="mt-4 p-3 text-start rounded" style={{background: 'var(--background)', border: '1px solid var(--border)'}}>
             <p className="text-muted-custom small mb-2 fw-bold">Test Credentials:</p>
             <p className="text-muted-custom small mb-1"><strong>Student:</strong> {demoCredentials.student.email} / {demoCredentials.student.password}</p>
             <p className="text-muted-custom small mb-0"><strong>Admin:</strong> {demoCredentials.admin.email} / {demoCredentials.admin.password}</p>
          </div>
        </div>
      </main>
    </>
  );
}
