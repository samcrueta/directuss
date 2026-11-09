"use client";

import Link from 'next/link';
import { BookOpen, Code2, Layout, ChevronRight, Play } from 'lucide-react';

export default function Home() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-custom py-3">
        <div className="container">
          <Link href="/" className="navbar-brand text-white fw-bold fs-5 tracking-tight d-flex align-items-center gap-2">
            <div style={{width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '4px'}}></div>
            DIRECTUS
          </Link>
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon" style={{filter: 'invert(1)'}}></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-4">
              <li className="nav-item"><Link href="/courses" className="nav-link text-white fs-6">Courses</Link></li>
              <li className="nav-item"><Link href="/dashboard" className="nav-link text-white fs-6">Dashboard</Link></li>
              <li className="nav-item"><Link href="/about" className="nav-link text-white fs-6">About</Link></li>
            </ul>
            <div className="d-flex gap-3 align-items-center">
              <Link href="/login" className="text-decoration-none text-white fs-6 me-3" style={{opacity: 0.8}}>Login</Link>
              <Link href="/register" className="btn btn-primary-custom">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero-section text-center">
          <div className="bg-grid"></div>
          <div className="container py-5 mt-4">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <h1 className="display-4 fw-bold mb-4" style={{letterSpacing: '-0.03em'}}>
                  Learn to Build <br/>
                  <span className="text-muted-custom">for the Web.</span>
                </h1>
                <p className="lead text-muted-custom mb-5 px-md-5" style={{fontSize: '1.1rem'}}>
                  Directus is a professional learning environment. Learn HTML, CSS and JavaScript by actually writing code in your browser.
                </p>
                <div className="d-flex justify-content-center gap-3 mb-5">
                  <Link href="/register" className="btn btn-primary-custom px-4 py-2 d-flex align-items-center gap-2">
                    Start Learning
                  </Link>
                  <Link href="/courses" className="btn btn-secondary-custom px-4 py-2">
                    Explore Courses
                  </Link>
                </div>
              </div>
            </div>

            {/* Code Editor Mockup */}
            <div className="row justify-content-center mt-4">
              <div className="col-lg-10 text-start">
                <div className="editor-mockup">
                  <div className="editor-header justify-content-between">
                    <div className="editor-tabs">
                      <div className="editor-tab active">index.html</div>
                      <div className="editor-tab">style.css</div>
                      <div className="editor-tab">script.js</div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm" style={{background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem'}}>
                        <Play size={12} /> Run
                      </button>
                    </div>
                  </div>
                  <div className="editor-body flex-column flex-md-row">
                    <div className="editor-code">
                      <div className="code-line"><span className="code-num">1</span><span className="code-tag">&lt;div</span> <span className="code-attr">class</span>=<span className="code-string">&quot;container&quot;</span><span className="code-tag">&gt;</span></div>
                      <div className="code-line"><span className="code-num">2</span>  <span className="code-tag">&lt;h1&gt;</span><span className="code-text">Hello World</span><span className="code-tag">&lt;/h1&gt;</span></div>
                      <div className="code-line"><span className="code-num">3</span>  <span className="code-tag">&lt;p&gt;</span><span className="code-text">Welcome to Directus.</span><span className="code-tag">&lt;/p&gt;</span></div>
                      <div className="code-line"><span className="code-num">4</span><span className="code-tag">&lt;/div&gt;</span></div>
                    </div>
                    <div className="editor-preview">
                      <div className="preview-label">LIVE PREVIEW</div>
                      <div style={{fontFamily: 'system-ui', textAlign: 'center'}}>
                        <h1 style={{color: '#111827', fontWeight: 'bold', margin: '0 0 8px 0'}}>Hello World</h1>
                        <p style={{color: '#4B5563', margin: 0}}>Welcome to Directus.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-5" style={{background: 'var(--background)', marginTop: '4rem', marginBottom: '4rem'}}>
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-6 text-center">
                <h2 className="fw-bold mb-3">The Learning Workflow</h2>
                <p className="text-muted-custom">A streamlined approach to mastering web technologies.</p>
              </div>
            </div>
            <div className="row g-4 mt-2">
              <div className="col-md-4">
                <div className="card-premium p-4 h-100 text-start">
                  <div className="mb-4 text-primary" style={{color: 'var(--accent)'}}>
                    <BookOpen size={32} color="var(--accent)" />
                  </div>
                  <h5 className="fw-bold mb-2">Read Documentation</h5>
                  <p className="text-muted-custom fs-6 mb-0">Study concise, developer-focused documentation that explains core concepts without the fluff.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card-premium p-4 h-100 text-start">
                  <div className="mb-4 text-primary" style={{color: 'var(--accent)'}}>
                    <Code2 size={32} color="var(--accent)" />
                  </div>
                  <h5 className="fw-bold mb-2">Write Code</h5>
                  <p className="text-muted-custom fs-6 mb-0">Apply your knowledge immediately in our browser-based IDE with real-time feedback.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card-premium p-4 h-100 text-start">
                  <div className="mb-4 text-primary" style={{color: 'var(--accent)'}}>
                    <Layout size={32} color="var(--accent)" />
                  </div>
                  <h5 className="fw-bold mb-2">Build Interfaces</h5>
                  <p className="text-muted-custom fs-6 mb-0">Complete practical challenges to construct actual web components and layouts.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-5 border-top" style={{borderColor: 'var(--border)', background: 'var(--surface)'}}>
          <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-5">
              <h2 className="fw-bold m-0 fs-3">Curriculum</h2>
              <Link href="/courses" className="text-decoration-none d-flex align-items-center gap-1" style={{color: "var(--accent)"}}>
                View all courses <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="row g-4">
              {[
                { title: "HTML Fundamentals", desc: "Learn the foundational structure of web pages.", diff: "Beginner", lessons: 10 },
                { title: "CSS Fundamentals", desc: "Master styling, layouts, and responsive design.", diff: "Beginner", lessons: 12 },
                { title: "JavaScript Fundamentals", desc: "Implement logic and interactivity in the browser.", diff: "Beginner", lessons: 15 },
                { title: "Web Design Patterns", desc: "Construct modern component architectures.", diff: "Intermediate", lessons: 8 }
              ].map((course, idx) => (
                <div key={idx} className="col-md-6 col-lg-3">
                  <div className="card-premium p-4 h-100 d-flex flex-column text-start">
                    <span className="badge-custom mb-3 align-self-start">{course.diff}</span>
                    <h5 className="fw-bold mb-2 fs-5">{course.title}</h5>
                    <p className="text-muted-custom flex-grow-1" style={{fontSize: '0.9rem'}}>{course.desc}</p>
                    <div className="d-flex justify-content-between align-items-center mt-4">
                      <span className="text-muted-custom" style={{fontSize: '0.8rem'}}>{course.lessons} lessons</span>
                      <Link href={`/courses`} className="text-decoration-none text-white" style={{fontSize: '0.9rem', color: 'var(--accent) !important'}}>View</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-4 border-top" style={{borderColor: 'var(--border)', background: 'var(--background)'}}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="fw-bold d-flex align-items-center gap-2 text-white" style={{opacity: 0.8, fontSize: '0.9rem'}}>
            <div style={{width: '16px', height: '16px', background: 'var(--text-secondary)', borderRadius: '3px'}}></div>
            DIRECTUS
          </div>
          <p className="text-muted-custom mb-0" style={{fontSize: '0.8rem'}}>© 2026. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
