"use client";

import Link from 'next/link';
import { Plus, Download, ArrowUpRight, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { MOCK_COURSES } from '@/lib/mockData';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const studentGrowthData = [
  { month: 'Jan', students: 150 },
  { month: 'Feb', students: 230 },
  { month: 'Mar', students: 340 },
  { month: 'Apr', students: 580 },
  { month: 'May', students: 890 },
  { month: 'Jun', students: 1284 }
];

const courseEnrollmentData = [
  { course: 'HTML', enrolled: 1120 },
  { course: 'CSS', enrolled: 890 },
  { course: 'JS', enrolled: 540 },
  { course: 'Design', enrolled: 320 }
];

export default function AdminDashboardPage() {
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [editingCourse, setEditingCourse] = useState(null);

  const handleEditSave = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title').trim();
    const description = formData.get('description').trim();
    const difficulty = formData.get('difficulty');

    if (!title || !description) return;

    setCourses((currentCourses) => currentCourses.map((course) => (
      course.id === editingCourse.id
        ? { ...course, title, description, difficulty }
        : course
    )));
    setEditingCourse(null);
  };

  const handleDelete = (course) => {
    if (window.confirm(`Delete "${course.title}"? This action cannot be undone.`)) {
      setCourses((currentCourses) => currentCourses.filter((item) => item.id !== course.id));
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-custom py-3">
        <div className="container-fluid px-4">
          <Link href="/" className="navbar-brand text-white fw-bold fs-5 tracking-tight d-flex align-items-center gap-2">
            <div style={{width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '4px'}}></div>
            DIRECTUS Admin
          </Link>
          <div className="d-flex gap-3 align-items-center ms-auto">
            <Link href="/" className="text-decoration-none text-white fs-6" style={{opacity: 0.8}}>Logout</Link>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 py-5 my-2">
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div>
             <h1 className="display-6 fw-bold mb-2">Admin Dashboard</h1>
             <p className="text-muted-custom mb-0">Platform analytics and management.</p>
          </div>
          <div className="d-flex gap-3">
             <button className="btn btn-secondary-custom d-flex align-items-center gap-2">
                <Download size={16} /> Export Report
             </button>
             <button className="btn btn-primary-custom d-flex align-items-center gap-2">
                <Plus size={16} /> Create Course
             </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
             <div className="card-premium p-4 d-flex align-items-center justify-content-between">
                <div>
                   <span className="text-muted-custom small mb-1 d-block">Total Students</span>
                   <h2 className="fw-bold mb-0">1,284</h2>
                </div>
                <div className="d-flex align-items-center gap-1 text-success bg-success bg-opacity-10 px-2 py-1 rounded small fw-bold">
                   <ArrowUpRight size={14} /> 12%
                </div>
             </div>
          </div>
          <div className="col-md-4">
             <div className="card-premium p-4 d-flex align-items-center justify-content-between">
                <div>
                   <span className="text-muted-custom small mb-1 d-block">Active Courses</span>
                   <h2 className="fw-bold mb-0">4</h2>
                </div>
                <div className="d-flex align-items-center gap-1 text-muted-custom bg-dark px-2 py-1 rounded small fw-bold">
                   Live
                </div>
             </div>
          </div>
          <div className="col-md-4">
             <div className="card-premium p-4 d-flex align-items-center justify-content-between">
                <div>
                   <span className="text-muted-custom small mb-1 d-block">Completed Lessons</span>
                   <h2 className="fw-bold mb-0">8,492</h2>
                </div>
                <div className="d-flex align-items-center gap-1 text-success bg-success bg-opacity-10 px-2 py-1 rounded small fw-bold">
                   <ArrowUpRight size={14} /> 24%
                </div>
             </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="row g-4 mb-5">
          <div className="col-lg-8">
             <div className="card-premium p-4 h-100">
                <h5 className="fw-bold mb-4">Student Growth</h5>
                <div style={{width: '100%', height: '300px'}}>
                  <ResponsiveContainer>
                    <AreaChart data={studentGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                         contentStyle={{backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px'}}
                         itemStyle={{color: 'var(--text-primary)'}}
                      />
                      <Area type="monotone" dataKey="students" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
          <div className="col-lg-4">
             <div className="card-premium p-4 h-100">
                <h5 className="fw-bold mb-4">Course Enrollments</h5>
                <div style={{width: '100%', height: '300px'}}>
                  <ResponsiveContainer>
                    <BarChart data={courseEnrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="course" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                         cursor={{fill: 'var(--surface-hover)'}}
                         contentStyle={{backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px'}}
                      />
                      <Bar dataKey="enrolled" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>

        {/* Table Row */}
        <h3 className="fw-bold mb-4">Course Management</h3>
        <div className="card-premium overflow-hidden">
           {courses.length === 0 ? (
             <p className="text-muted-custom text-center p-5 mb-0">No courses or lessons remain.</p>
           ) : (
           <table className="table table-dark table-hover mb-0" style={{background: 'transparent'}}>
              <thead>
                 <tr>
                    <th className="border-0 px-4 py-3 text-muted-custom font-weight-normal">Course Name</th>
                    <th className="border-0 px-4 py-3 text-muted-custom font-weight-normal">Difficulty</th>
                    <th className="border-0 px-4 py-3 text-muted-custom font-weight-normal">Lessons</th>
                    <th className="border-0 px-4 py-3 text-muted-custom font-weight-normal text-end">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {courses.map((course) => (
                 <tr key={course.id}>
                    <td className="border-secondary px-4 py-3 border-opacity-25">{course.title}</td>
                    <td className="border-secondary px-4 py-3 border-opacity-25">
                       <span className="badge-custom">{course.difficulty}</span>
                    </td>
                    <td className="border-secondary px-4 py-3 border-opacity-25">{course.lessonsCount}</td>
                    <td className="border-secondary px-4 py-3 border-opacity-25 text-end">
                       <button className="btn btn-sm btn-outline-custom me-2">Add Lesson</button>
                       <button
                         className="btn btn-sm btn-secondary-custom me-2"
                         onClick={() => setEditingCourse(course)}
                       >
                         <Pencil size={14} className="me-1" /> Edit
                       </button>
                       <button
                         className="btn btn-sm btn-outline-danger"
                         onClick={() => handleDelete(course)}
                       >
                         <Trash2 size={14} className="me-1" /> Delete
                       </button>
                    </td>
                 </tr>
                 ))}
              </tbody>
           </table>
           )}
        </div>
      </div>

      {editingCourse && (
        <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="edit-course-title" style={{background: 'rgba(0, 0, 0, 0.7)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-premium text-white">
              <div className="modal-header border-bottom" style={{borderColor: 'var(--border)'}}>
                <h5 id="edit-course-title" className="modal-title fw-bold">Edit Course</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary-custom"
                  aria-label="Close edit form"
                  onClick={() => setEditingCourse(null)}
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleEditSave}>
                <div className="modal-body">
                  <label htmlFor="course-title" className="form-label">Course title</label>
                  <input id="course-title" name="title" className="form-control bg-dark text-white border-secondary mb-3" defaultValue={editingCourse.title} required />
                  <label htmlFor="course-description" className="form-label">Description</label>
                  <textarea id="course-description" name="description" className="form-control bg-dark text-white border-secondary mb-3" rows="3" defaultValue={editingCourse.description} required />
                  <label htmlFor="course-difficulty" className="form-label">Difficulty</label>
                  <select id="course-difficulty" name="difficulty" className="form-select bg-dark text-white border-secondary" defaultValue={editingCourse.difficulty}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div className="modal-footer border-top" style={{borderColor: 'var(--border)'}}>
                  <button type="button" className="btn btn-secondary-custom" onClick={() => setEditingCourse(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary-custom">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
