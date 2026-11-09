import Link from 'next/link';

export default function RegisterPage() {
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
          <h2 className="fw-bold mb-4">Create Account</h2>
          <p className="text-muted-custom mb-4">Join Directus and start building for the web.</p>
          <div className="d-flex flex-column gap-3 mb-4 text-start">
             <div>
                <label className="text-muted-custom small mb-1">Name</label>
                <input type="text" className="form-control bg-dark text-white border-secondary" placeholder="John Doe" />
             </div>
             <div>
                <label className="text-muted-custom small mb-1">Email</label>
                <input type="email" className="form-control bg-dark text-white border-secondary" placeholder="you@example.com" />
             </div>
             <div>
                <label className="text-muted-custom small mb-1">Password</label>
                <input type="password" className="form-control bg-dark text-white border-secondary" placeholder="••••••••" />
             </div>
          </div>
          <Link href="/dashboard" className="btn btn-primary-custom w-100">Create Account</Link>
          <p className="text-muted-custom mt-4 mb-0" style={{fontSize: '0.9rem'}}>
            Already have an account? <Link href="/login" className="text-accent text-decoration-none" style={{color: 'var(--accent)'}}>Log In</Link>
          </p>
        </div>
      </main>
    </>
  );
}
