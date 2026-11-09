"use client";

import Link from 'next/link';
import { MOCK_COURSES } from '@/lib/mockData';
import { BookOpen, PlayCircle } from 'lucide-react';

export default function DashboardPage() {
  const activeCourse = MOCK_COURSES[0];
  const allCourses = MOCK_COURSES.filter(c => c.progress > 0);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-custom py-3">
        <div className="container">
          <Link href="/" className="navbar-brand text-white fw-bold fs-5 tracking-tight d-flex align-items-center gap-2">
            <div style={{width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '4px'}}></div>
            DIRECTUS
          </Link>
          <div className="d-flex gap-3 align-items-center ms-auto">
            <Link href="/courses" className="text-decoration-none text-white fs-6 me-3" style={{opacity: 0.8}}>Courses</Link>
            <div className="d-flex align-items-center gap-2">
               <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                 S
               </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-5 my-4">
        <h1 className="display-6 fw-bold mb-2">Good afternoon, Sam</h1>
        <p className="text-muted-custom lead mb-5">Continue learning where you left off.</p>

        {MOCK_COURSES.length === 0 ? (
          <div className="card-premium p-5 text-center">
            <h3 className="fw-bold mb-2">Your learning dashboard is empty</h3>
            <p className="text-muted-custom mb-4">All courses and lessons have been removed.</p>
            <Link href="/courses" className="btn btn-primary-custom">Browse Courses</Link>
          </div>
        ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card-premium p-4 p-md-5 mb-4 position-relative overflow-hidden">
               <div className="position-relative z-index-1">
                 <h5 className="fw-bold mb-1">{activeCourse.title}</h5>
                 <p className="text-muted-custom mb-4">Headings (Lesson 3 of 10)</p>
                 
                 <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2" style={{fontSize: '0.9rem'}}>
                      <span className="fw-bold">Overall Progress</span>
                      <span className="text-accent">{activeCourse.progress}%</span>
                    </div>
                    <div className="progress rounded-pill bg-dark" style={{height: '8px', overflow: 'hidden', background: 'var(--background)'}}>
                      <div 
                        className="progress-bar rounded-pill" 
                        style={{width: `${activeCourse.progress}%`, background: 'var(--accent)'}}
                      ></div>
                    </div>
                 </div>
                 
                 <Link href={`/courses/${activeCourse.id}/headings`} className="btn btn-primary-custom d-inline-flex align-items-center gap-2">
                    <PlayCircle size={18} /> Continue Lesson
                 </Link>
               </div>
               
               {/* Decorative background element */}
               <div className="position-absolute" style={{right: '-5%', top: '-20%', opacity: 0.03, pointerEvents: 'none'}}>
                  <BookOpen size={300} />
               </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card-premium p-4 h-100">
               <h5 className="fw-bold mb-4">Your Courses</h5>
               <div className="d-flex flex-column gap-3">
                 {MOCK_COURSES.map(course => (
                   <div key={course.id} className="d-flex justify-content-between align-items-center p-3 rounded" style={{background: 'var(--background)'}}>
                     <span className="fw-bold" style={{fontSize: '0.95rem'}}>{course.title}</span>
                     <span className="text-muted-custom" style={{fontSize: '0.85rem'}}>{course.progress}%</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
        )}
      </main>
    </>
  );
}
