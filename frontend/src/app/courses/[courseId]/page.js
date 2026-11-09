import Link from 'next/link';
import { MOCK_COURSES } from '@/lib/mockData';
import { getChartCourse } from '@/lib/chartCourses';
import { CheckCircle2, Circle, ArrowLeft, LineChart } from 'lucide-react';

const ADVANCED_SECTIONS = new Set([
  'section-7-advanced-directus-topics',
  'payload-section-7-advanced-payload-cms-topics',
  'keystone-section-7-advanced-keystonejs-topics'
]);

export default async function CourseDetailPage({ params }) {
  const unwrappedParams = await params;
  const course = MOCK_COURSES.find(c => c.id === unwrappedParams.courseId);
  const chartCourse = course ? getChartCourse(course.id) : null;

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-custom py-3">
        <div className="container">
          <Link href="/" className="navbar-brand text-white fw-bold fs-5 tracking-tight d-flex align-items-center gap-2">
            <div style={{width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '4px'}}></div>
            LUMINA ACADEMY
          </Link>
          <div className="d-flex gap-3 align-items-center ms-auto">
            <Link href="/courses" className="text-decoration-none text-white fs-6" style={{opacity: 0.8}}>All Courses</Link>
          </div>
        </div>
      </nav>

      <main className="container py-5 my-4 max-w-4xl mx-auto" style={{maxWidth: '800px'}}>
        <Link href="/courses" className="text-muted-custom text-decoration-none d-flex align-items-center gap-2 mb-4">
          <ArrowLeft size={16} /> Back to Courses
        </Link>
        {!course ? (
          <div className="card-premium p-5 text-center">
            <h1 className="fw-bold mb-2">Course not found</h1>
            <p className="text-muted-custom mb-0">This course and its lessons have been removed.</p>
          </div>
        ) : (
        <>
        
        <header className="mb-5 pb-5 border-bottom" style={{borderColor: 'var(--border)'}}>
          <span className="badge-custom mb-3 d-inline-block">{course.difficulty}</span>
          <h1 className="display-4 fw-bold mb-3">{course.title}</h1>
          <p className="lead text-muted-custom mb-4">{course.description}</p>
          
          <div className="card-premium p-4 mt-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-bold">Your Progress</span>
              <span className="text-muted-custom">{course.progress}%</span>
            </div>
            <div className="progress rounded-pill bg-dark" style={{height: '8px', overflow: 'hidden', background: 'var(--background)'}}>
              <div 
                className="progress-bar rounded-pill" 
                style={{width: `${course.progress}%`, background: 'var(--accent)'}}
              ></div>
            </div>
          </div>
        </header>

        <section>
          <h3 className="fw-bold mb-4">Course Curriculum</h3>
          <div className="d-flex flex-column gap-3">
            {course.lessons && course.lessons.map((lesson, idx) => {
              const isComplete = lesson.status === 'complete';
              const isChartsSection = idx === 7 && chartCourse;
              const href = isChartsSection
                ? `/courses/${course.id}/charts`
                : ADVANCED_SECTIONS.has(lesson.id)
                ? `/courses/${course.id}/advanced`
                : `/courses/${course.id}/${lesson.id}`;
              
              return (
                <div key={lesson.id} className="card-premium p-4 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-4">
                    <span className="text-muted-custom fs-5" style={{fontFamily: 'var(--font-mono)'}}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h5 className="mb-0 fw-bold">{lesson.title}</h5>
                  </div>
                  
                  <div className="d-flex align-items-center gap-4">
                    {isComplete && <span className="text-muted-custom d-flex gap-2 align-items-center"><CheckCircle2 size={18} color="var(--accent)"/> Complete</span>}
                    {!isComplete && <span className="text-white d-flex gap-2 align-items-center"><Circle size={18} color="var(--accent)"/> Available</span>}
                    <Link href={href} className={`btn ${isComplete ? 'btn-secondary-custom' : 'btn-primary-custom'}`}>
                      {isComplete ? 'Review' : 'Continue'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {chartCourse ? (
          <section className="mt-5">
            <div className="card-premium p-4 p-md-5">
              <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                <span className="badge-custom">Level 8 · Advanced Graphs</span>
                <span className="text-muted-custom" style={{fontSize: '0.85rem'}}>
                  Live {chartCourse.provider} data
                </span>
              </div>
              <h3 className="fw-bold mb-2 d-flex align-items-center gap-2">
                <LineChart size={20} color="var(--accent)" /> {chartCourse.content.section.title}
              </h3>
              <p className="text-muted-custom mb-4" style={{maxWidth: '720px'}}>
                {chartCourse.content.section.cardDescription}
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link href={chartCourse.sectionHref} className="btn btn-primary-custom">
                  Start Level 8
                </Link>
                <Link href={`/courses/${course.id}/charts/showcase`} className="btn btn-secondary-custom">
                  Open the showcase
                </Link>
              </div>
            </div>
          </section>
        ) : null}
        </>
        )}
      </main>
    </>
  );
}
