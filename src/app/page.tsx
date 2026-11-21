'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Courses } from '@/components/Courses';
import { Teachers } from '@/components/Teachers';
import { Results } from '@/components/Results';
import { EnrollmentForm } from '@/components/EnrollmentForm';
import { Location } from '@/components/Location';
import { Contacts } from '@/components/Contacts';
import { Footer } from '@/components/Footer';
import { RagAssistant } from '@/components/RagAssistant';

export default function Home() {
  const [selectedCourse, setSelectedCourse] = useState<string>('math');

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourse(courseId);
    const formElement = document.querySelector('#enroll');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEnrollClick = () => {
    const formElement = document.querySelector('#enroll');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Header with sticky navigation */}
      <Header onEnrollClick={handleEnrollClick} />

      {/* 2. Hero Section with photo and center overview */}
      <Hero />

      {/* 3. About Us Section with principles and atmosphere */}
      <About />

      {/* 4. Courses Section (Math, English, Computer Science) */}
      <Courses onSelectCourse={handleSelectCourse} />

      {/* 5. Teachers Section with experience, honors, and student results */}
      <Teachers />

      {/* 6. Wall of Fame: Top Student Results & Testimonials */}
      <Results />

      {/* 7. Enrollment Form with real-time validation & course preselection */}
      <EnrollmentForm
        key={selectedCourse}
        selectedCourseId={selectedCourse}
        onCourseChange={(courseId) => setSelectedCourse(courseId)}
      />

      {/* 8. Geolocation Section with interactive map and directions */}
      <Location />

      {/* 9. Contacts Section with phones, email, messengers, and hours */}
      <Contacts />

      {/* 10. Footer with branding and legal information */}
      <Footer />

      {/* 11. Floating RAG AI Assistant powered by gemini-3.5-flash-lite */}
      <RagAssistant />
    </main>
  );
}
