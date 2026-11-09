import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-custom py-3">
        <div className="container">
          <Link href="/" className="navbar-brand text-white fw-bold fs-5 tracking-tight d-flex align-items-center gap-2">
            <div style={{width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '4px'}}></div>
            DIRECTUS
          </Link>
          <div className="d-flex gap-3 align-items-center ms-auto">
            <Link href="/courses" className="text-decoration-none text-white fs-6" style={{opacity: 0.8}}>Courses</Link>
          </div>
        </div>
      </nav>

      <main className="container py-5 my-5 max-w-4xl mx-auto text-center" style={{maxWidth: '800px'}}>
        <h1 className="display-4 fw-bold mb-4">About Directus</h1>
        <p className="lead text-muted-custom mb-5">
          Directus is a modern, interactive learning platform designed to teach beginners how to design and develop websites.
        </p>
        
        <div className="card-premium p-5 text-start mt-4">
           <h3 className="fw-bold mb-3">Our Mission</h3>
           <p className="text-muted-custom mb-4">
             We believe the best way to learn web development is by actually writing code. That&apos;s why we built an interactive code playground directly into our lesson platform. No local setup required—just read, write, and run your code instantly.
           </p>
           
           <h3 className="fw-bold mb-3 mt-5">The Technology</h3>
           <p className="text-muted-custom">
             Directus is built on modern web standards, prioritizing performance, accessibility, and a premium developer experience. Our platform is continuously evolving to provide the best tools for aspiring developers.
           </p>
        </div>
      </main>
    </>
  );
}
