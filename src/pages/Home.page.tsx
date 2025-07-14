import React from "react"
import HelloSection from "../components/HelloSection/HelloSection"
import HowItWorksSection from "../components/HelloSection/HowItWorksSection"
import FeaturesSection from "../components/HelloSection/FeaturesSection"
import CTASection from "../components/HelloSection/CTASection"
import SEO from "../components/SEO"

function Home() {
  return (
    <>
      {/* SEO Meta Tags */}
      <SEO 
        title="Ingata SPro - Staff Performance Monitoring & Task Management System"
        description="Empower your workforce with Ingata SPro - comprehensive staff performance monitoring platform with real-time task tracking, location monitoring, and performance analytics. Role-based dashboards for supervisors, employees, and administrators."
        keywords="staff performance monitoring system, task management platform, employee tracking software, workforce management, performance analytics, supervisor dashboard, employee dashboard, task tracking, team management, productivity monitoring, organizational management, performance reporting"
        url="https://ingata-spro.com"
      />
      
      <main>
        <HelloSection />
        
        {/* SEO-Rich Content Section - Hidden but crawlable */}
        <section className="sr-only">
          <h1>Ingata SPro - Complete Staff Performance Monitoring Solution</h1>
          <p>
            Ingata SPro is a comprehensive staff performance monitoring and task management system 
            designed to empower organizations with efficient workforce management. Our platform provides 
            real-time task tracking, location monitoring, and detailed performance analytics for 
            businesses of all sizes.
          </p>
          
          <h2>Key Features of Our Staff Monitoring System</h2>
          <p>
            Our platform offers role-based dashboards tailored for System Leaders, Overall Admins, 
            Supervisors, Employees, and Clients. Track team performance, manage tasks efficiently, 
            and generate comprehensive reports to drive productivity and organizational success.
          </p>
          
          <h3>For System Leaders</h3>
          <p>
            Manage multiple organizations, assign overall administrators, view organization-wide 
            statistics and performance reports across your entire business ecosystem.
          </p>
          
          <h3>For Overall Administrators</h3>
          <p>
            Control company details, create departments and positions, assign supervisors, and 
            monitor team and department performance with detailed analytics.
          </p>
          
          <h3>For Supervisors</h3>
          <p>
            View assigned team members, create and assign tasks, review task submissions, track 
            team performance metrics, and communicate effectively with your employees.
          </p>
          
          <h3>For Employees</h3>
          <p>
            Access assigned tasks, submit daily task reports, track personal performance history, 
            and maintain seamless communication with supervisors through our integrated platform.
          </p>
          
          <h2>Why Choose Ingata SPro for Performance Monitoring?</h2>
          <ul>
            <li>Real-time task tracking and status updates</li>
            <li>GPS location monitoring for field employees</li>
            <li>Comprehensive performance analytics and reporting</li>
            <li>Role-based access control and permissions</li>
            <li>Built-in communication and collaboration tools</li>
            <li>Mobile-responsive design for on-the-go management</li>
            <li>Secure cloud-based infrastructure</li>
            <li>Easy integration with existing business tools</li>
          </ul>
          
          <h2>Transform Your Workforce Management Today</h2>
          <p>
            Join hundreds of organizations using Ingata SPro to streamline their staff performance 
            monitoring, improve task completion rates, and boost overall productivity. Our intuitive 
            platform makes workforce management simple, efficient, and effective.
          </p>
        </section>
        
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
    </>
  )
}

export default Home