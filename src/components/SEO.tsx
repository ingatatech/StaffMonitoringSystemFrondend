
import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "Ingata SPro - Staff Performance Monitoring System",
  description = "Empower your workforce with Ingata SPro - comprehensive staff performance monitoring and task tracking platform",
  keywords = "staff performance monitoring, task management, employee tracking, workforce management",
  ogImage = "https://ingata-spro.com/og-image.jpg",
  url = "https://ingata-spro.com"
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;

// Step 3: Update Home.tsx to include SEO
// Add this to your Home component:
/*
import SEO from "../components/SEO";

function Home() {
  return (
    <>
      <SEO 
        title="Ingata SPro - Staff Performance Monitoring & Task Management System"
        description="Monitor performance, track progress, and boost productivity with real-time task tracking, location monitoring, and performance analytics."
        keywords="staff performance monitoring, task tracking, employee management, workforce analytics, supervisor dashboard, team productivity"
        url="https://ingata-spro.com"
      />
      <main>
        <HelloSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
    </>
  )
}
*/

// Step 4: Add SEO to other pages

// Login Page SEO
/*
<SEO 
  title="Login - Ingata SPro"
  description="Login to Ingata SPro staff performance monitoring system"
  url="https://ingata-spro.com/login"
/>
*/

// Overall Admin Dashboard SEO
/*
<SEO 
  title="Admin Dashboard - Ingata SPro"
  description="Manage your organization, departments, and team performance"
  url="https://ingata-spro.com/overall"
/>
*/

// Supervisor Dashboard SEO
/*
<SEO 
  title="Supervisor Dashboard - Ingata SPro"
  description="Manage team members, assign tasks, and track performance"
  url="https://ingata-spro.com/super-visor"
/>
*/

// Employee Dashboard SEO
/*
<SEO 
  title="Employee Dashboard - Ingata SPro"
  description="View assigned tasks and submit daily reports"
  url="https://ingata-spro.com/employeeDashboard"
/>
*/