"use client";

import Link from 'next/link';
import { MOCK_COURSES } from '@/lib/mockData';
import { BookOpen, BarChart } from 'lucide-react';

export default function CoursesPage() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-custom py-3">
        <div className="container">
          <Link href="/" className="navbar-brand text-white fw-bold fs-5 tracking-tight d-flex align-items-center gap-2">
            <div style={{width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '4px'}}></div>
            LUMINA ACADEMY
          </Link>
          <div className="d-flex gap-3 align-items-center ms-auto">
            <Link href="/dashboard" className="text-decoration-none text-white fs-6 me-3" style={{opacity: 0.8}}>Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="container py-5 my-4">
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div>
            <h1 className="display-5 fw-bold mb-2">Available Courses</h1>
            <p className="text-muted-custom lead mb-0">Expand your skills with our interactive curriculum.</p>
          </div>
        </div>

        {MOCK_COURSES.length === 0 ? (
          <div className="card-premium p-5 text-center">
            <h3 className="fw-bold mb-2">No courses available</h3>
            <p className="text-muted-custom mb-0">Courses and lessons have been removed. New learning content will appear here when it is added.</p>
          </div>
        ) : (
        <div className="row g-4">
          {MOCK_COURSES.map((course) => (
            <div key={course.id} className="col-md-6 col-lg-4">
              <div className="card-premium p-4 h-100 d-flex flex-column text-start">
                <span className="badge-custom mb-3 align-self-start">{course.difficulty}</span>
                <h5 className="fw-bold mb-2 fs-4">{course.title}</h5>
                <p className="text-muted-custom flex-grow-1" style={{fontSize: '0.95rem'}}>{course.description}</p>
                
                <div className="mt-4 pt-4 border-top" style={{borderColor: 'var(--border)'}}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted-custom d-flex align-items-center gap-2" style={{fontSize: '0.85rem'}}>
                      <BookOpen size={14} /> {course.lessonsCount} lessons
                    </span>
                    {course.progress > 0 && (
                      <span className="text-muted-custom d-flex align-items-center gap-2" style={{fontSize: '0.85rem'}}>
                        <BarChart size={14} /> {course.progress}%
                      </span>
                    )}
                  </div>
                  <Link href={`/courses/${course.id}`} className="btn btn-secondary-custom w-100 text-center text-decoration-none">
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </main>
    </>
  );
}
