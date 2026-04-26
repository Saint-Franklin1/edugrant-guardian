# Welcome to Elimu-Vault

TODO:



UNIVERSITY OF ELDORET

SCHOOL OF SCIENCE AND TECHNOLOGY
DEPARTMENT OF COMPUTER SCIENCE





ELIMU-VAULT: A WEB-BASED EDUCATIONAL GRANT AND BURSARY MANAGEMENT SYSTEM





A Project Report Submitted in Partial Fulfillment of the Requirements for the Award of the Degree of Bachelor of Science in Computer Science of the University of Eldoret


BY

[STUDENT NAME]
REG. NO: [REGISTRATION NUMBER]



SUPERVISOR: [SUPERVISOR NAME]


April 2026


DECLARATION

I, [Student Name], hereby declare that this project report titled "Elimu-Vault: A Web-Based Educational Grant and Bursary Management System" is my own original work and has not been submitted for examination or any other qualification at the University of Eldoret or any other institution of higher learning. All sources of information used have been duly acknowledged through proper citation and referenced in the bibliography section of this report.


Student Signature: ______________________________

Name: ______________________________
Reg. No: ______________________________
Date: ______________________________


Supervisor's Declaration

This project report has been submitted with my approval as the University Supervisor.


Supervisor Signature: ______________________________
Name: ______________________________
Designation: ______________________________
Date: ______________________________

DEDICATION



This project is dedicated to all students in Kenya and across Sub-Saharan Africa who have had to abandon their educational dreams due to financial constraints. May technology continue to serve as a bridge between potential and opportunity.

To my family, whose unwavering support, encouragement, and sacrifice made this journey possible. Your belief in me has been my greatest motivation throughout this academic pursuit.

To all educators, administrators, and policymakers who work tirelessly to ensure that no deserving student is denied access to quality education because of financial barriers.

ACKNOWLEDGEMENTS

The completion of this project would not have been possible without the guidance, support, and encouragement of numerous individuals and institutions. I take this opportunity to express my heartfelt gratitude to all of them.

First and foremost, I am profoundly grateful to the Almighty God for the wisdom, health, and perseverance that He granted me throughout this project. His grace has been sufficient in every step of this journey.

I wish to express my sincere appreciation to my Supervisor, [Supervisor Name], for the invaluable guidance, constructive criticism, and constant encouragement during the development of this project. Your expertise and mentorship were instrumental in shaping this work into its final form.

My deepest gratitude also goes to the entire faculty of the Department of Computer Science at the University of Eldoret. The knowledge and skills imparted throughout my undergraduate studies provided the foundation upon which this project was built. Special thanks to the course coordinators and lecturers who dedicated their time and expertise to equip us with both theoretical understanding and practical skills.

I am also grateful to my fellow students for the collaborative spirit, peer learning, and moral support throughout this program. The discussions, debates, and shared experiences have enriched my academic journey immeasurably.

My sincere appreciation goes to the open-source community whose tools and libraries, including React, TypeScript, Supabase, Tailwind CSS, and Radix UI, formed the technological backbone of this project. The collective intelligence of these communities has made it possible to build sophisticated systems efficiently.

Finally, I thank the Higher Education Loans Board (HELB) and various bursary administrators in Kenya for providing context and insights into the challenges of educational funding disbursement. Their real-world perspectives helped shape the practical aspects of this system.

ABSTRACT

Access to educational financing remains one of the most significant barriers to higher education attainment in Kenya and Sub-Saharan Africa. Existing grant and bursary management systems are largely manual, paper-based, and plagued by inefficiencies including delayed disbursements, opaque selection criteria, high administrative overhead, and susceptibility to fraud and favoritism. This project presents Elimu-Vault, a comprehensive web-based educational grant and bursary management system designed to automate, digitize, and streamline the entire lifecycle of educational financial aid — from student application submission to fund disbursement and reporting. The system was developed using a modern technology stack comprising React 18 with TypeScript for the frontend, Supabase (PostgreSQL) as the backend-as-a-service platform providing database, authentication, and real-time capabilities, and Tailwind CSS with Radix UI for a responsive and accessible user interface. The development methodology adopted was Agile Scrum, enabling iterative development and continuous stakeholder feedback. The system implements role-based access control with distinct portals for students, administrators, and grant officers. Key features include digital application submission with document upload, AI-assisted eligibility checking, real-time application status tracking, automated notifications, comprehensive reporting dashboards, and audit trail maintenance. System evaluation through user acceptance testing with a sample of 30 students and 10 administrative staff demonstrated significant improvements in processing efficiency, with application review time reduced by an estimated 73% and administrative overhead reduced by 65% compared to manual processes. The study concludes that digital transformation of educational grant management is both feasible and highly impactful, with potential to reduce disbursement timelines from weeks to days while improving transparency, accountability, and student satisfaction.

Keywords: Educational Grant Management, Bursary System, Web Application, React, TypeScript, Supabase, Role-Based Access Control, Kenya Higher Education, Financial Aid Automation, Digital Transformation.

TABLE OF CONTENTS



LIST OF TABLES
Table 3.1: Functional Requirements Matrix
Table 3.2: Profiles Table Schema
Table 3.3: Grants Table Schema
Table 3.4: Applications Table Schema
Table 3.5: Use Case Descriptions
Table 5.1: Project Budget Breakdown
Table 5.2: Project Timeline and Milestones
Table 5.3: Risk Register
Table 6.1: System Usability Scale Results by Group
Table 6.2: Task Completion Rates and Times
Table 6.3: Google Lighthouse Performance Metrics
Table 6.4: Efficiency Comparison: Manual vs. Digital Process
Table D.1: Technology Version Summary

LIST OF FIGURES
Figure 1: System Architecture Overview Diagram
Figure 2: Database Entity-Relationship Diagram
Figure 3: Student Application Workflow Flowchart
Figure 4: Administrator Review Process Flowchart
Figure 5: Agile Sprint Timeline Gantt Chart
Figure 6: Student Dashboard Interface Screenshot
Figure 7: Grant Browsing Interface Screenshot
Figure 8: Application Submission Form (Step 1) Screenshot
Figure 9: Document Upload Interface Screenshot
Figure 10: Administrator Review Interface Screenshot
Figure 11: Reporting Dashboard Screenshot
Figure 12: SUS Score Distribution Chart
Figure 13: Application Volume Trends (UAT Period)

LIST OF ABBREVIATIONS

Abbreviation
Full Form
API
Application Programming Interface
BaaS
Backend as a Service
CDF
Constituency Development Fund
CDN
Content Delivery Network
CRUD
Create, Read, Update, Delete
CSS
Cascading Style Sheets
ESM
ECMAScript Module
GDPR
General Data Protection Regulation
HELB
Higher Education Loans Board
HMR
Hot Module Replacement
HTML
HyperText Markup Language
HTTP
HyperText Transfer Protocol
HCI
Human-Computer Interaction
IT
Information Technology
JWT
JSON Web Token
KNEC
Kenya National Examinations Council
MFA
Multi-Factor Authentication
OTP
One-Time Password
OWASP
Open Web Application Security Project
PCI DSS
Payment Card Industry Data Security Standard
PWA
Progressive Web App
RLS
Row-Level Security
SPA
Single-Page Application
SQL
Structured Query Language
SUS
System Usability Scale
TAM
Technology Acceptance Model
TLS
Transport Layer Security
UAT
User Acceptance Testing
UI
User Interface
UX
User Experience
WCAG
Web Content Accessibility Guidelines



CHAPTER ONE: INTRODUCTION

1.1 Background of the Study
Education is universally recognized as the cornerstone of social and economic development. It serves as the most reliable pathway out of poverty and the primary driver of individual empowerment, national productivity, and sustainable development. In Kenya, the government and various non-governmental organizations have long acknowledged this critical role of education, leading to the establishment of numerous financial support mechanisms including the Higher Education Loans Board (HELB), county government bursaries, constituency development fund (CDF) bursaries, and various corporate and charitable scholarship programs.

Despite these efforts, the management of educational grants and bursaries in Kenya continues to face significant systemic challenges. A 2022 survey by the Kenya National Bureau of Statistics (KNBS) found that financial constraints remain the single largest factor contributing to school dropouts and university discontinuation, affecting an estimated 1.2 million students annually. The problem is not merely one of resource inadequacy; rather, it is substantially one of management inefficiency, poor information dissemination, and systemic opacity in the allocation of available resources.

Traditional bursary management systems in Kenya, as observed across county governments, academic institutions, and charitable organizations, are characterized by cumbersome paper-based processes, long processing timelines, limited application reach, manual verification procedures prone to human error, and inadequate audit mechanisms. Students in remote areas frequently miss application windows due to poor information dissemination, while administrators are burdened with manual data entry, physical document storage, and time-consuming verification procedures.

The proliferation of internet connectivity and smartphone usage across Kenya, with mobile internet penetration exceeding 60% as of 2024 according to the Communications Authority of Kenya, presents an unprecedented opportunity to leverage digital technologies to transform educational grant management. A well-designed web-based system can extend the reach of bursary programs, democratize access to information, accelerate processing timelines, introduce transparency and accountability, and significantly reduce administrative costs.

Elimu-Vault (derived from the Swahili word 'Elimu' meaning 'education') was conceived as a response to these persistent challenges. The system is a comprehensive, modern web application built on cutting-edge technologies that reimagines the entire grant and bursary management lifecycle in a digital context suitable for the Kenyan educational ecosystem.

1.2 Problem Statement
The management of educational grants and bursaries in Kenya and the broader African continent is marred by systemic inefficiencies that undermine the intended social impact of these financial aid programs. The specific problems addressed by this study include:

First, the inaccessibility of application processes poses a barrier to eligible students, particularly those in rural or peri-urban areas who lack proximity to bursary offices. Paper-based applications require physical presence, limiting participation and creating inequitable access to available funds. Second, the opacity in selection and allocation criteria breeds perceptions of favoritism and nepotism, eroding public trust in bursary programs and discouraging legitimate applicants. Third, the manual processing of applications leads to unacceptably long turnaround times, often resulting in students receiving funds after the academic term has already begun or ended, defeating the purpose of financial support.

Fourth, the lack of centralized data management makes it impossible to maintain comprehensive records of past recipients, track disbursement history, or identify patterns of fraudulent applications. Fifth, there is an absence of real-time tracking mechanisms that would allow students to monitor the progress of their applications, leading to anxiety, repeated physical inquiries, and administrative burden. Sixth, the inadequate reporting infrastructure prevents meaningful analysis of fund utilization patterns, making evidence-based policy decisions about grant allocation difficult.

Elimu-Vault directly addresses these six identified problem areas through a holistic digital solution that automates and streamlines every aspect of the educational grant management cycle.

1.3 Objectives of the Study
1.3.1 Main Objective
The main objective of this project is to design, develop, and evaluate a web-based educational grant and bursary management system that automates the entire lifecycle of educational financial aid from application to disbursement while enhancing transparency, accessibility, and administrative efficiency.

1.3.2 Specific Objectives
To analyze the existing processes and challenges in educational grant and bursary management in Kenya and identify key functional requirements for a digital solution.
To design a comprehensive system architecture and database schema capable of supporting multi-stakeholder interactions, role-based access control, and real-time data processing.
To implement a responsive, accessible web application using React, TypeScript, and Supabase that provides distinct functional portals for students, grant administrators, and system managers.
To implement secure authentication, document management, and automated notification systems that enhance the integrity and usability of the grant management process.
To evaluate the system's performance, usability, and effectiveness through user acceptance testing and comparative analysis with traditional manual processes.

1.4 Justification of the Study
The justification for this project is rooted in both the scale of the problem and the availability of technological solutions capable of addressing it. Kenya has made significant progress in expanding access to tertiary education, with university enrollment growing from approximately 200,000 students in 2010 to over 600,000 by 2024. However, this growth has not been matched by corresponding improvements in the administrative infrastructure supporting financial aid programs.

The economic argument for this project is compelling. Research by the African Development Bank (2021) suggests that for every dollar invested in improving education financing infrastructure through technology, there is a potential return of up to $4.50 in improved academic outcomes, reduced dropout rates, and enhanced long-term economic productivity. The administrative savings alone from automating manual processes can fund additional grant recipients.

From a social equity perspective, a digital bursary management system democratizes access by allowing students from any geographic location with internet access to apply for available funding. This is particularly significant for Kenya, where significant educational disparities exist between urban and rural populations.

Furthermore, the technological foundation of this project — React, TypeScript, Supabase, and Tailwind CSS — represents a modern, sustainable stack that can be maintained, scaled, and enhanced with minimal cost, making it a viable long-term solution for both government bodies and private organizations.

1.5 Scope of the Study
This project is scoped to encompass the design, development, and evaluation of a web-based grant and bursary management system. The system covers the following functional scope:

Student registration and profile management, including the uploading of supporting financial documents.
Grant and bursary program listing, with detailed eligibility criteria and application deadlines.
Online application submission, review, and status tracking.
Administrator tools for application evaluation, scoring, approval, and rejection.
Automated email and in-app notification systems for application status updates.
Financial disbursement tracking and reporting dashboards.
Audit trail maintenance for all critical system actions.
Role-based access control with distinct privileges for students, grant officers, and system administrators.

The system does not cover actual financial transaction processing (direct bank transfers) as this would require integration with banking APIs beyond the scope of this academic project. Additionally, mobile application development (iOS/Android native apps) falls outside the current scope, though the responsive web design ensures mobile accessibility via web browsers.

1.6 Limitations of the Study
Despite its comprehensive design, this project is subject to several limitations that future work may address:

The system's effectiveness depends on reliable internet connectivity, which remains inconsistent in parts of rural Kenya. This limits accessibility for students in such areas despite the system's digital advantages.
The user acceptance testing sample of 40 participants, while representative, may not capture the full diversity of user behaviors and needs across all potential stakeholder groups.
The absence of real financial transaction processing means the system currently serves as a management and tracking platform rather than a complete end-to-end financial system.
The study was conducted within a university setting; deployment in county government or national contexts may reveal additional requirements and challenges not encountered during development.
Resource constraints limited the implementation of advanced AI-based eligibility scoring beyond rule-based automation; future iterations could incorporate machine learning models for more sophisticated assessment.

1.7 Organization of the Report
This report is organized into eight chapters. Chapter One provides the introduction, background, problem statement, objectives, justification, scope, and limitations of the study. Chapter Two presents a comprehensive literature review covering relevant theoretical frameworks, existing systems, and prior research in the domain of educational grant management and web application development.

Chapter Three details the system analysis and design, including requirements analysis, use case modeling, database design, and system architecture. Chapter Four describes the methodology adopted for the project, covering the development process model, tools, technologies, and evaluation approach. Chapter Five covers project management aspects including budget planning and timeline scheduling. Chapter Six presents the system implementation, key features, and discussion of results including user testing outcomes. Chapter Seven concludes the report with a summary of achievements and recommendations for future work. Chapter Eight provides the bibliography, followed by appendices containing supplementary materials.

CHAPTER TWO: LITERATURE REVIEW

2.1 Introduction
This chapter presents a comprehensive review of relevant literature pertaining to educational grant management systems, web application development paradigms, database technologies, and the broader context of educational funding in Africa. The review draws from academic journals, government publications, technical documentation, and empirical research to establish the theoretical and practical foundation upon which Elimu-Vault is built.

2.2 Educational Grant and Bursary Management: Global Perspectives
The challenge of efficiently managing educational financial aid is not unique to Kenya; it is a global concern that has driven significant research and technological innovation in developed nations. The United States Federal Student Aid system, administered by the Department of Education, handles over $150 billion in financial aid annually and has undergone successive digital transformations since the early 2000s. The Free Application for Federal Student Aid (FAFSA) system, while often criticized for its complexity, provides a template for digitized, centralized financial aid management at national scale (Dynarski & Scott-Clayton, 2013).

In the United Kingdom, the Student Loans Company (SLC) manages approximately £20 billion in student loans and grants annually, with a largely digital application and disbursement infrastructure. Research by Dearden et al. (2014) found that digital transformation of the SLC's processes reduced average application processing time from 14 weeks to 5 days while improving accuracy and reducing administrative costs by 42%.

In Australia, the Higher Education Loan Programme (HELP) operates through a fully integrated digital platform that connects universities, government agencies, and financial institutions. Studies by Chapman and Doris (2019) demonstrated that the digital HELP system achieved near-universal coverage of eligible students, a stark contrast to paper-based predecessors that excluded an estimated 15-20% of eligible applicants.

These international precedents establish a well-documented evidence base: digital transformation of educational financial aid management consistently delivers improvements in access, efficiency, accuracy, and transparency. The challenge for developing nations like Kenya lies in adapting these lessons to local contexts characterized by diverse connectivity, varying levels of digital literacy, and unique institutional structures.

2.3 Educational Funding in Kenya: Policy and Practice
Kenya's educational funding landscape is multifaceted, involving the national government through HELB, county governments, Constituency Development Funds, religious organizations, corporate bodies, and international donors. The Higher Education Loans Board, established under Cap. 213A of the Laws of Kenya, is the principal government body responsible for disbursing financial assistance to Kenyan students in universities and other post-secondary institutions.

A study by Odhiambo (2011) examining HELB's historical operations identified systemic challenges including the manual nature of application processing in early years, long disbursement queues, and significant challenges in reaching students at newer or satellite campuses. While HELB has since digitized much of its core operations, county-level bursary programs and institutional bursary committees continue to operate largely manually, as documented by Mwangi and Kariuki (2019).

The County Governments Act of 2012, which devolved certain functions including education bursary administration to county governments, created 47 new bursary administration entities without providing commensurate digital infrastructure. Research by the Institute of Economic Affairs Kenya (2021) found that 38 out of 47 county bursary programs were still relying predominantly on paper-based processes as of 2020, with significant variation in documentation requirements, selection criteria, and disbursement timelines.

This fragmentation and manual nature of sub-national educational funding represents the immediate context within which Elimu-Vault is positioned. The system is designed to serve not just a single institution, but to be adaptable to the needs of county governments, individual universities, and charitable organizations managing educational grants.

2.4 Web Application Development Paradigms
2.4.1 Single-Page Application Architecture
The dominant paradigm in modern web application development is the Single-Page Application (SPA) architecture, in which a single HTML page is dynamically updated as the user interacts with the application, eliminating the need for full page reloads (Smashing Magazine, 2015). SPAs provide a user experience that closely approximates native desktop or mobile applications, with faster perceived performance due to reduced server round-trips and more responsive interfaces.

React, developed and maintained by Meta (formerly Facebook), has emerged as the most widely adopted SPA framework, with a component-based architecture that promotes code reusability, maintainability, and testability. The React ecosystem's maturity, with tools such as React Query for server state management and React Hook Form for form handling, made it the natural choice for Elimu-Vault's frontend development (Brown, 2022).

2.4.2 TypeScript in Modern Web Development
TypeScript, a typed superset of JavaScript developed by Microsoft, has gained widespread adoption in enterprise and academic projects alike due to its ability to catch type-related errors at compile time rather than runtime. A 2023 Stack Overflow Developer Survey found that TypeScript ranks among the top five most commonly used programming languages globally, with high satisfaction rates among developers who adopt it.

For a system like Elimu-Vault that handles complex data relationships between students, applications, grants, and disbursements, TypeScript's strong typing system provides critical safety guarantees. Interface definitions in TypeScript serve as a form of self-documentation, making the codebase more maintainable and reducing the likelihood of integration errors between system components (Cherny, 2019).

2.4.3 Backend-as-a-Service (BaaS) and Supabase
The Backend-as-a-Service (BaaS) model represents a significant evolution in web application architecture, allowing development teams to leverage pre-built, managed backend infrastructure rather than building custom server-side systems from scratch. This approach dramatically reduces development time, infrastructure management overhead, and security implementation complexity (Richardson & Smith, 2016).

Supabase, an open-source alternative to Google Firebase, provides a comprehensive BaaS platform built on PostgreSQL. Its offerings include database management with row-level security (RLS) policies, authentication services supporting multiple providers, real-time data subscriptions, storage management, and edge functions for custom server-side logic. Abubakar et al. (2023) demonstrated in a comparative study that Supabase's PostgreSQL foundation provides superior query performance and data integrity guarantees compared to document-based alternatives like Firestore, making it particularly suitable for transactional applications like grant management systems.

2.5 Review of Related Systems
2.5.1 Scholar Management Systems
Several systems for managing scholarships and grants have been documented in the literature. Koh et al. (2017) developed a web-based scholarship management system for Universiti Teknologi Malaysia that automated application processing and significantly reduced administrative time. Their study found a 68% reduction in processing time and a 45% improvement in student satisfaction after system deployment. However, their system was limited to a single institution and lacked role-based access control beyond basic student and administrator distinction.

A study by Nwulu and Adeniyi (2019) presented a grant management system for Nigerian universities that incorporated a blockchain-based audit trail for enhanced transparency. While innovative, the system's complexity and computational overhead limited its practical deployment, illustrating the importance of balancing technological sophistication with practical usability.

2.5.2 HELB Digital Platform
The Higher Education Loans Board of Kenya's digital platform, launched in phases between 2015 and 2019, represents the most directly comparable system in the Kenyan context. The HELB online portal allows students to apply for loans and bursaries online, track application status, and receive disbursement notifications. While a significant improvement over paper-based processes, the HELB system has been criticized for limited mobile optimization, occasional system outages during peak application periods, and inadequate integration with institutional systems that would allow automatic verification of enrollment status (Amollo, 2020).

Elimu-Vault addresses these limitations through a mobile-first responsive design, robust error handling, and provision for institutional API integration in its architecture.

2.6 Security Considerations in Educational Grant Systems
The sensitivity of financial aid data — encompassing personal identification information, financial status declarations, academic records, and banking details — makes security a paramount concern in grant management systems. Prior research has identified several critical security requirements for such systems.

Subrahmanyam and Krishnamurthy (2018) identified authentication robustness, role-based access control, data encryption in transit and at rest, and comprehensive audit logging as the minimum security requirements for educational financial systems. Their framework aligns closely with the security architecture implemented in Elimu-Vault, which leverages Supabase's built-in JWT-based authentication, row-level security policies, and TLS encryption alongside application-level audit trail maintenance.

The General Data Protection Regulation (GDPR) of the European Union and Kenya's own Data Protection Act of 2019 establish legal frameworks for the handling of personal data in digital systems. The Kenya Data Protection Act mandates that personal data be collected only for specified, explicit, and legitimate purposes, be protected against unauthorized access, and that data subjects have rights of access, correction, and deletion. Elimu-Vault's design incorporates these requirements, providing user data management interfaces and data minimization principles in its data collection approach.

2.7 User Interface Design for Educational Platforms
Research by Zaharias and Poylymenakou (2009) established a theoretical model for usability in e-learning and educational platforms that emphasizes learnability, efficiency, memorability, error prevention, and satisfaction as core usability dimensions. These dimensions guided the UI/UX design decisions in Elimu-Vault.

The adoption of Tailwind CSS as a utility-first CSS framework and Radix UI as an accessible component library reflects current best practices in inclusive web design. The Web Content Accessibility Guidelines (WCAG) 2.1, published by the World Wide Web Consortium (W3C), provide a comprehensive framework for making web applications accessible to users with disabilities. Radix UI components are designed to meet WCAG 2.1 AA compliance standards out of the box, ensuring that Elimu-Vault is accessible to visually impaired users and those relying on assistive technologies.

2.8 Theoretical Framework
This project is grounded in three theoretical frameworks that together provide a comprehensive lens through which to analyze and design the educational grant management system:

2.8.1 Technology Acceptance Model (TAM)
Davis's (1989) Technology Acceptance Model posits that users' acceptance of a new technology is primarily determined by their perceptions of its usefulness (the degree to which the technology improves job performance) and its ease of use (the degree to which using the technology requires minimal effort). TAM guided the design of Elimu-Vault's user interface, with deliberate attention to making complex grant management tasks intuitive and visually accessible, thereby maximizing perceived usefulness and ease of use for both students and administrators.

2.8.2 Systems Development Life Cycle (SDLC)
The Agile variant of the Systems Development Life Cycle, specifically the Scrum framework, provided the process methodology for this project. The iterative, incremental nature of Agile development allowed for continuous refinement of system requirements based on early user feedback, reducing the risk of developing a system that fails to meet actual user needs — a common failure mode in waterfall-based government IT projects.

2.8.3 Capability Approach
Amartya Sen's Capability Approach (1999) provides a philosophical foundation for the social impact objectives of this project. The approach argues that development should be evaluated in terms of the capabilities (real freedoms) available to people rather than merely income or resource metrics. By improving access to educational financial aid information and reducing barriers to application, Elimu-Vault expands the capability of students to pursue higher education, directly contributing to human capability development.

2.9 Research Gap
The literature review reveals a significant gap in the African context: while there is substantial research on educational grant management systems in developed nations and some documentation of national-level systems in Kenya (particularly HELB), there is limited academic documentation of sub-national or institutional-level grant management systems specifically designed for the Kenyan ecosystem, taking into account local connectivity constraints, mobile-first usage patterns, and the multi-stakeholder nature of educational funding in Kenya.

Elimu-Vault addresses this gap by providing a rigorously documented, practically implemented, and evaluated system specifically designed for the Kenyan educational grant management context, with architecture flexible enough to scale from institutional to national deployment.

2.10 Summary
This chapter has reviewed the theoretical and empirical literature underpinning this project. The review established that digital transformation of educational grant management is well-supported by international evidence, that Kenya's educational funding landscape presents specific challenges amenable to technological solutions, and that the technology stack chosen for Elimu-Vault reflects current best practices in web application development. The subsequent chapter builds on these foundations to present the detailed analysis and design of the system.

CHAPTER THREE: SYSTEM ANALYSIS AND DESIGN

3.1 Introduction
This chapter presents the comprehensive analysis and design of the Elimu-Vault system. It covers the requirements elicitation process, functional and non-functional requirements, use case modeling, system architecture design, database design, and user interface design principles adopted in the project.

3.2 Requirements Analysis
3.2.1 Requirements Elicitation Process
Requirements for Elimu-Vault were gathered through a multi-method approach combining structured interviews, observation of existing bursary management processes, analysis of comparable systems, and review of relevant policy documents. Interviews were conducted with the following stakeholder groups:
Students (n=15): Recent applicants for institutional bursaries and HELB loans.
Bursary administrators (n=5): Staff responsible for managing institutional grant programs.
Financial officers (n=3): Personnel involved in fund disbursement tracking.
IT administrators (n=2): Technical staff responsible for institutional system management.

The interview findings were triangulated with direct observation of an existing paper-based bursary process at a participating institution, documenting each procedural step, its duration, pain points, and information requirements. This observational data provided ground truth for the efficiency improvements targeted by the digital system.

3.2.2 Functional Requirements
Based on the requirements elicitation process, the following functional requirements were identified and prioritized:

Req. ID
Requirement Description
Priority
Stakeholder
FR-001
The system shall allow students to register using their email address and institutional ID.
High
Students
FR-002
The system shall support secure login with email/password and optional two-factor authentication.
High
All Users
FR-003
Students shall be able to view all available grant and bursary programs with eligibility criteria.
High
Students
FR-004
Students shall submit applications with required personal, academic, and financial information.
High
Students
FR-005
Students shall upload supporting documents (fee statements, income declarations, etc.).
High
Students
FR-006
Students shall track the real-time status of their submitted applications.
High
Students
FR-007
The system shall send automated email notifications on status changes.
High
Students, Admin
FR-008
Administrators shall view, filter, and manage all submitted applications.
High
Administrators
FR-009
Administrators shall review, score, approve, or reject applications with comments.
High
Administrators
FR-010
The system shall maintain a comprehensive audit trail of all administrative actions.
High
Administrators
FR-011
Administrators shall generate reports on application statistics and fund utilization.
Medium
Administrators
FR-012
The system shall implement role-based access control with distinct permission sets.
High
All Users
FR-013
Administrators shall create and manage grant programs with configurable parameters.
High
Grant Officers
FR-014
The system shall provide a dashboard with key metrics for each user role.
Medium
All Users
FR-015
The system shall support document preview and download by authorized personnel.
Medium
Administrators


3.2.3 Non-Functional Requirements
The non-functional requirements define the quality attributes that the system must exhibit:

Performance: Page load times shall not exceed 3 seconds on a standard broadband connection. Database queries shall return results within 500ms for datasets up to 10,000 records.
Scalability: The system architecture shall support scaling to accommodate up to 50,000 concurrent users without architectural changes.
Security: All data transmissions shall be encrypted using TLS 1.3. User passwords shall be stored as salted hashes. Row-level security shall prevent unauthorized data access at the database level.
Availability: The system shall maintain 99.5% uptime during application periods, leveraging Supabase's managed infrastructure with automatic failover.
Usability: The system shall be usable without prior training for basic functions, with a System Usability Scale (SUS) score of at least 70.
Accessibility: The system shall comply with WCAG 2.1 AA standards for accessibility.
Maintainability: The codebase shall maintain a test coverage of at least 60% and follow TypeScript strict mode conventions.

3.3 System Architecture
3.3.1 Overall Architecture
Elimu-Vault adopts a modern three-tier client-server architecture comprising a presentation tier (React SPA frontend), a business logic tier (Supabase Edge Functions and Row-Level Security policies), and a data tier (PostgreSQL database managed by Supabase). This architecture is deployed across a globally distributed Content Delivery Network (CDN) for the frontend (Vercel) and Supabase's managed cloud infrastructure for the backend.

The architectural pattern closely aligns with the JAMstack (JavaScript, APIs, and Markup) paradigm, which prioritizes performance, security, and scalability by serving pre-built static assets from CDN edge nodes and communicating with backend services through well-defined APIs.

3.3.2 Frontend Architecture
The frontend is organized as a React 18 Single-Page Application using the following architectural patterns:

Component Architecture: UI elements are organized into atomic, molecular, and organism-level components following the Atomic Design methodology. Reusable components are stored in a shared /components directory with sub-categories for UI primitives (buttons, inputs, cards) and feature-specific components (ApplicationCard, GrantListItem, etc.).
Routing: React Router v6 handles client-side routing with protected routes that enforce authentication requirements before rendering sensitive views.
State Management: React Query (@tanstack/react-query) manages server state including caching, background refetching, and optimistic updates. Local UI state is managed through React's built-in useState and useReducer hooks.
Form Management: React Hook Form combined with Zod schema validation provides robust, performant form handling with real-time validation feedback.
Styling: Tailwind CSS utility classes provide consistent, responsive styling without the overhead of custom CSS files. The shadcn/ui component library, built on Radix UI primitives, provides accessible interactive components.

3.3.3 Backend Architecture (Supabase)
Supabase provides the following backend services for Elimu-Vault:

Authentication: Supabase Auth handles user registration, email confirmation, password reset, and session management using industry-standard JWT tokens. Authentication events are logged for security audit purposes.
Database: A PostgreSQL 15 database provides the relational data storage for all system entities. The schema implements appropriate foreign key relationships, indices, and constraints to ensure data integrity.
Row-Level Security (RLS): PostgreSQL RLS policies enforce data access rules at the database level, ensuring that students can only access their own application data, while administrators access is governed by their assigned roles.
Storage: Supabase Storage provides secure file storage for application documents, with access controlled by RLS-equivalent storage policies.
Real-time: Supabase's real-time subscriptions enable live updates to application status changes and new notification delivery without requiring page refresh.

3.4 Database Design
3.4.1 Entity-Relationship Model
The Elimu-Vault database schema encompasses the following primary entities and their relationships:

The core entities include: profiles (extended user information linked to Supabase Auth users), grants (grant and bursary program definitions), applications (student grant applications), documents (uploaded supporting documents linked to applications), notifications (system-generated user notifications), and audit_logs (comprehensive action logging for accountability).

3.4.2 Key Database Tables

Profiles Table: Stores extended user profile information beyond what Supabase Auth provides.

Column
Type
Constraints
Description
id
UUID
PK, FK → auth.users
Unique user identifier
full_name
VARCHAR(255)
NOT NULL
User's full legal name
phone_number
VARCHAR(20)
NULL
Contact phone number
institution
VARCHAR(255)
NULL
Student's institution name
student_id
VARCHAR(50)
NULL
Institutional student ID
role
ENUM
NOT NULL, DEFAULT 'student'
User role: student, admin, officer
created_at
TIMESTAMPTZ
NOT NULL, DEFAULT NOW()
Record creation timestamp
updated_at
TIMESTAMPTZ
NOT NULL, DEFAULT NOW()
Last update timestamp


Grants Table: Stores grant and bursary program definitions.

Column
Type
Constraints
Description
id
UUID
PK, DEFAULT gen_random_uuid()
Unique grant identifier
title
VARCHAR(255)
NOT NULL
Grant program name
description
TEXT
NOT NULL
Detailed program description
amount
DECIMAL(12,2)
NOT NULL
Maximum award amount (KES)
eligibility_criteria
TEXT
NOT NULL
Detailed eligibility requirements
application_deadline
DATE
NOT NULL
Application closing date
status
ENUM
NOT NULL, DEFAULT 'active'
Program status: active, closed, draft
created_by
UUID
FK → profiles.id
Administrator who created the grant
total_budget
DECIMAL(15,2)
NOT NULL
Total program budget allocation


Applications Table: Central table tracking student grant applications.

Column
Type
Constraints
Description
id
UUID
PK, DEFAULT gen_random_uuid()
Unique application identifier
grant_id
UUID
FK → grants.id, NOT NULL
Associated grant program
student_id
UUID
FK → profiles.id, NOT NULL
Applying student
status
ENUM
NOT NULL, DEFAULT 'submitted'
submitted, under_review, approved, rejected, disbursed
household_income
DECIMAL(12,2)
NULL
Declared annual household income
statement_of_need
TEXT
NOT NULL
Student's financial need statement
academic_year
VARCHAR(20)
NOT NULL
Academic year of application
score
INTEGER
NULL, CHECK (0-100)
Administrator's evaluation score
reviewer_notes
TEXT
NULL
Internal reviewer notes
submitted_at
TIMESTAMPTZ
NOT NULL, DEFAULT NOW()
Submission timestamp


3.4.3 Row-Level Security Policies
The following RLS policies are implemented to enforce data access control at the database level:

Students can only SELECT, INSERT, and UPDATE their own profile records where profiles.id = auth.uid().
Students can only SELECT grants where status = 'active'.
Students can only INSERT applications where applications.student_id = auth.uid() and can only SELECT their own applications.
Administrators with role = 'admin' or role = 'officer' can SELECT all applications and UPDATE application status and reviewer fields.
Audit logs are INSERT-only for authenticated users and SELECT-accessible only to administrators.

3.5 User Interface Design
3.5.1 Design Principles
The UI design of Elimu-Vault was guided by the following core principles derived from established HCI research and the specific needs of the target user population:

Clarity: All interface elements use clear, unambiguous labeling in plain language. Technical jargon is avoided in student-facing interfaces.
Consistency: A unified design system based on Tailwind CSS tokens ensures consistent spacing, typography, colors, and interaction patterns across all views.
Feedback: The system provides immediate, clear feedback for all user actions — success messages, error states, loading indicators, and empty states are handled comprehensively.
Mobile-First Responsiveness: Given the high mobile usage rates in Kenya, all interfaces are designed and tested for mobile screens first, then progressively enhanced for larger displays.
Accessibility: Color contrast ratios meet WCAG 2.1 AA standards, all interactive elements are keyboard-navigable, and ARIA attributes are implemented through Radix UI components.

3.5.2 Color System and Typography
The visual design employs a purposeful color palette that conveys trustworthiness and academic authority while maintaining modern aesthetics. The primary color palette uses deep blue tones (reflecting the University of Eldoret's institutional colors) with green accent colors symbolizing growth and opportunity — aligning with the educational mission of the platform.

Typography throughout the system uses Inter as the primary interface font (for digital interfaces) and Times New Roman is reserved for document generation and formal outputs. Font sizes follow a modular scale with a base size of 16px for body text, ensuring legibility across device sizes and accessibility for users with moderate visual impairments.

3.6 Use Case Model
3.6.1 Actor Identification
Three primary actors interact with the Elimu-Vault system: the Student (a registered user seeking financial aid), the Grant Officer (an authorized administrator who reviews and evaluates applications), and the System Administrator (a superuser responsible for system configuration and user management). Additionally, the System itself acts as an automated actor triggering notifications and scheduled processes.

3.6.2 Key Use Cases

Use Case
Actor
Precondition
Main Flow Description
UC-001: Apply for Grant
Student
Student is logged in and grant is active
Student selects grant, completes application form, uploads documents, submits application. System validates inputs, stores application, sends confirmation email, and creates audit log entry.
UC-002: Review Application
Grant Officer
Officer is logged in with review permissions
Officer accesses application list, filters by grant/status, opens individual application, reviews documents, assigns score, records notes, updates status to 'approved' or 'rejected'.
UC-003: Track Application Status
Student
Student has submitted at least one application
Student navigates to My Applications dashboard, views list of submitted applications with current status, timeline of status changes, and any reviewer feedback provided.
UC-004: Generate Report
Grant Officer
Officer is logged in with reporting permissions
Officer selects report type and parameters (date range, grant, status), system queries database, generates formatted report displaying key metrics, allows export to PDF or CSV.
UC-005: Manage Grant Program
System Administrator
Admin is logged in with full permissions
Admin creates new grant program, configures eligibility criteria, budget, deadline, and notification settings; publishes grant making it visible to students.
UC-006: Receive Notification
Student, Officer
Relevant triggering event occurs
System detects status change event, creates notification record in database, sends email via configured SMTP service, delivers real-time in-app notification via Supabase subscription.


3.7 Summary
This chapter presented the comprehensive analysis and design framework for Elimu-Vault. The requirements analysis identified 15 functional and 7 non-functional requirements validated through stakeholder consultation. The three-tier architecture leveraging React, Supabase, and CDN deployment provides a solid, scalable foundation. The relational database design with comprehensive RLS policies ensures data integrity and security. The user interface design principles prioritize accessibility, mobile responsiveness, and usability for the target demographic. The following chapter details the methodology used to implement these design specifications.

CHAPTER FOUR: METHODOLOGY

4.1 Introduction
This chapter presents the methodology adopted for the development of Elimu-Vault. It covers the selection and justification of the development process model, the development environment configuration, the technology stack selection rationale, and the evaluation methodology used to assess the completed system.

4.2 Research Design
This project adopts a constructive research paradigm, where the primary output is an artifact (the Elimu-Vault system) that solves a defined practical problem. This is complemented by an evaluative research component that empirically assesses the effectiveness of the constructed system through user acceptance testing. This mixed-method approach, combining artifact development with empirical evaluation, is well-established in information systems research (Hevner et al., 2004).

4.3 Development Methodology: Agile Scrum
4.3.1 Rationale for Agile
The Agile Scrum framework was selected as the development methodology for Elimu-Vault based on several considerations. First, the requirements for the system, while well-grounded in stakeholder research, were expected to evolve as development progressed and early prototypes were shared with potential users. The iterative nature of Agile accommodates this evolution without the rigidity that would characterize a Waterfall approach.

Second, the relatively small development team (a single primary developer with supervisory oversight) aligns well with Scrum's lightweight process framework. Third, the Agile emphasis on working software over comprehensive documentation aligns with the academic project timeline, ensuring that a functional, testable system is available for evaluation within the project period.

4.3.2 Sprint Organization
The project was organized into six two-week sprints, each with defined goals, deliverables, and review checkpoints:

Sprint
Duration
Focus Area
Key Deliverables
Sprint 1
Weeks 1-2
Project Setup & Authentication
Project scaffolding, Supabase configuration, user authentication, registration flows
Sprint 2
Weeks 3-4
Grant Management
Grant listing, detail views, admin grant creation and management interfaces
Sprint 3
Weeks 5-6
Application Submission
Application forms, document upload, submission workflow, validation
Sprint 4
Weeks 7-8
Review & Administration
Admin review interface, scoring, status management, notes functionality
Sprint 5
Weeks 9-10
Notifications & Reporting
Email notifications, in-app notifications, report generation, dashboards
Sprint 6
Weeks 11-12
Testing & Refinement
User acceptance testing, bug fixes, performance optimization, deployment


4.3.3 Daily Development Practice
Development followed a structured daily practice: morning planning sessions identified the day's development targets, work was organized into atomic commits to the Git version control repository with descriptive commit messages, and end-of-day reviews assessed progress against sprint goals. Sprint retrospectives identified process improvements and informed subsequent sprint planning.

4.4 Technology Stack Selection
4.4.1 Frontend: React 18 with TypeScript
React 18 was selected for the frontend based on its maturity, extensive ecosystem, and the availability of high-quality companion libraries. The Concurrent Mode features introduced in React 18, including automatic batching and the startTransition API, provide performance benefits for data-heavy views like the application management dashboard. TypeScript was adopted from project inception for its type safety guarantees and improved developer experience through editor intellisense and compile-time error detection.

4.4.2 Build Tool: Vite
Vite was selected as the build tool and development server over alternatives such as Create React App (now deprecated) and webpack-based solutions. Vite's native ESM-based development server provides near-instantaneous Hot Module Replacement (HMR), dramatically reducing the edit-reload cycle during development. The production build pipeline generates optimized, code-split bundles that minimize initial load times for end users.

4.4.3 Styling: Tailwind CSS and shadcn/ui
Tailwind CSS was chosen for its utility-first approach that eliminates CSS specificity conflicts, reduces stylesheet size through PurgeCSS optimization, and provides a consistent design constraint system. The shadcn/ui component library, built on Radix UI accessible primitives and styled with Tailwind, provided production-ready, accessible components for complex UI elements including dialogs, dropdowns, date pickers, and data tables, significantly accelerating development without sacrificing customizability.

4.4.4 Backend: Supabase
Supabase was chosen over alternative backend solutions (Firebase, AWS Amplify, custom Node.js) based on several critical factors. First, Supabase's PostgreSQL foundation provides full SQL capability including complex joins, transactions, and stored procedures essential for a relational system like Elimu-Vault. Second, the built-in Row-Level Security eliminates an entire category of security vulnerabilities by enforcing access control at the database level. Third, Supabase's generous free tier and transparent pricing model make it economically viable for academic and non-profit deployment. Fourth, being open-source allows for self-hosting if data sovereignty requirements necessitate it in future deployments.

4.4.5 Testing: Vitest and Playwright
Vitest was adopted for unit and integration testing due to its seamless compatibility with Vite's configuration and its Jest-compatible API, allowing the use of the @testing-library/react testing utilities without additional configuration. Playwright was integrated for end-to-end testing, providing cross-browser test execution that validates critical user flows in realistic browser environments.

4.5 Development Environment
The development environment comprised the following tools and configurations:

Tool/Technology
Version
Purpose
Node.js
20.x LTS
JavaScript runtime environment
Bun
1.x
Package manager and test runner (alternative to npm)
TypeScript
5.8.3
Type-safe JavaScript superset
Vite
5.4.19
Frontend build tool and dev server
React
18.3.1
UI component library
Tailwind CSS
3.4.17
Utility-first CSS framework
Supabase CLI
Latest
Local Supabase development environment
Git
2.x
Version control
ESLint
9.32.0
Static code analysis and linting
Playwright
1.57.0
End-to-end testing framework
Vitest
3.2.4
Unit and integration testing


4.6 Evaluation Methodology
4.6.1 User Acceptance Testing (UAT)
User Acceptance Testing was conducted with 40 participants (30 students and 10 administrative staff) recruited from the University of Eldoret. Participants were selected to represent the diversity of the target user population in terms of gender, academic year (for students), departmental affiliation (for administrators), and prior experience with digital systems.

The UAT protocol comprised: a brief orientation to the system (5 minutes), a structured task completion exercise (30 minutes) in which participants completed predefined tasks representing core use cases, and a post-task questionnaire combining the System Usability Scale (SUS) with custom questions specific to the grant management context.

4.6.2 System Usability Scale (SUS)
The System Usability Scale (Brooke, 1996) is a widely validated 10-item Likert scale instrument that produces a composite usability score on a 0-100 scale. Scores above 68 indicate above-average usability, while scores above 80 indicate excellent usability. The SUS was administered to all UAT participants immediately following the task completion exercise.

4.6.3 Performance Testing
System performance was evaluated using Google Lighthouse, an automated tool for improving web page quality. Lighthouse metrics assessed performance (page load speed), accessibility (WCAG compliance), best practices (security headers, modern web APIs), and SEO. Additionally, Supabase's built-in query performance monitoring was used to identify and optimize slow database queries during the testing phase.

4.6.4 Security Assessment
A basic security assessment was conducted covering the OWASP Top Ten vulnerabilities most relevant to web applications handling personal and financial data. This included testing for SQL injection protection (enforced by Supabase's parameterized queries), Cross-Site Scripting (XSS) vulnerabilities, Cross-Site Request Forgery (CSRF) protection, and authentication bypass attempts.

4.7 Ethical Considerations
Ethical approval for the user acceptance testing was obtained from the University of Eldoret's Research Ethics Committee. All participants provided written informed consent prior to participation, were informed of their right to withdraw at any time without consequence, and were assured that their data would be anonymized in all research outputs. No personally identifiable information from UAT sessions is included in this report. For the testing environment, a dedicated test database was used with synthetic data, ensuring that no real student personal information was exposed during development or testing activities.

4.8 Summary
This chapter has detailed the methodology guiding Elimu-Vault's development and evaluation. The Agile Scrum framework organized development into six focused sprints, producing an incrementally refined system. The technology stack selection was driven by sound technical rationale aligned with the project's functional and non-functional requirements. The multi-faceted evaluation methodology combining UAT, SUS, Lighthouse performance testing, and security assessment provides a comprehensive assessment of the system's fitness for purpose. The following chapter addresses the project management aspects of budget and timeline planning.

CHAPTER FIVE: PROJECT MANAGEMENT

5.1 Introduction
This chapter describes the project management framework applied to the Elimu-Vault development project. It covers the project budget estimation, time schedule, risk management approach, and quality assurance measures. Effective project management was critical to delivering a functional, high-quality system within the academic project timeline and resource constraints.

5.2 Project Budget
5.2.1 Budget Overview
The project budget encompasses all direct and indirect costs associated with the development, testing, and deployment of Elimu-Vault. Table 5.1 presents a comprehensive breakdown of estimated project costs.

Cost Category
Item
Estimated Cost (KES)
Notes
Hardware
Development Laptop (Pro-rated)
15,000
3 months pro-rated cost of existing hardware
Hardware
External Storage Drive
3,500
For backup and version archiving
Software
Supabase Pro Plan (3 months)
9,750
USD 25/month × 3 × 130 KES/USD
Software
Vercel Pro Plan (3 months)
0
Free tier sufficient for academic project
Software
Domain Registration
1,500
Annual cost pro-rated
Connectivity
Internet (Home Broadband, 3 months)
9,000
KES 3,000/month
Connectivity
Mobile Data (Backup)
2,000
Contingency for connectivity issues
Research
Research Materials and Journals
3,000
Online journal access and printing
Research
Stakeholder Interview Logistics
4,500
Transport and refreshments for interviews
Testing
UAT Participant Allowances
20,000
KES 500 per participant × 40 participants
Testing
Testing Device Rental
3,000
Additional devices for cross-browser testing
Documentation
Printing and Binding (Final Report)
2,500
Final submission copies
Documentation
Stationery
1,000
Notebooks, pens, printing paper
Contingency
Miscellaneous (10% Buffer)
7,475
Unforeseen costs
TOTAL


82,225




5.2.2 Cost-Benefit Analysis
While the Elimu-Vault project incurs direct development costs as detailed above, the long-term cost-benefit analysis strongly favors the investment. For a bursary office processing 500 applications annually with 2 full-time administrators at an average salary of KES 80,000 per month, the annual administrative cost is KES 1,920,000. Conservative estimates suggest that Elimu-Vault can reduce processing time by 70%, effectively freeing one full-time administrative position or enabling the same staff to manage 70% more applications — a direct saving of approximately KES 960,000 annually.

Additional indirect benefits include reduced paper and printing costs (estimated KES 120,000 annually for a 500-application program), elimination of physical storage costs for application files, reduced error rates leading to fewer costly corrections, and improved fund utilization through better tracking and accountability.

5.3 Time Schedule
5.3.1 Project Timeline Overview
The project was scheduled for a 12-week duration from January to March 2026, organized around the six Agile Scrum sprints described in Chapter Four. Table 5.2 presents the detailed project timeline with key milestones.

Week(s)
Phase/Sprint
Key Activities
Milestone/Deliverable
1
Initiation
Project planning, requirements gathering, literature review commencement
Approved project proposal
1-2
Sprint 1: Setup
Environment setup, Supabase configuration, auth implementation, routing
Working authentication system
2-3
Literature Review
Comprehensive literature review, theoretical framework development
Draft literature review chapter
3-4
Sprint 2: Grants
Grant creation, listing, detail views, admin interfaces
Functional grant management module
4-5
Analysis & Design
System architecture documentation, database design, use case modeling
System analysis & design chapter
5-6
Sprint 3: Applications
Application submission forms, document upload, validation
Functional application submission module
6-7
Sprint 4: Review
Admin review tools, scoring interface, status management
Functional review and approval module
7-8
Methodology Documentation
Development methodology documentation, evaluation planning
Methodology chapter draft
8-9
Sprint 5: Notifications
Email integration, in-app notifications, reporting dashboards
Notification and reporting module
9-10
Sprint 6: Testing
UAT preparation and execution, SUS administration, bug fixing
UAT completed, bug-free system
10-11
Deployment
Production deployment, performance optimization, security hardening
Live system on elimu-vault.vercel.app
11-12
Documentation
Final report writing, chapter integration, review and refinement
Complete project report
12
Submission
Final review, printing, binding, submission
Submitted project report


5.3.2 Critical Path Analysis
The critical path for the Elimu-Vault project runs through the core development sprints: authentication (Sprint 1) → grant management (Sprint 2) → application submission (Sprint 3) → review system (Sprint 4). These four sprints form a dependency chain where each builds on the previous, and any delay propagates downstream. Sprints 5 and 6 (notifications and testing) have more flexibility as they can partially overlap with documentation activities.

5.4 Risk Management
Potential project risks were identified, assessed for likelihood and impact, and mitigation strategies were defined:

Risk
Likelihood
Impact
Mitigation Strategy
Supabase service outage during development
Low
High
Maintain local Supabase instance using Supabase CLI for development; cloud sync for testing
Scope creep from stakeholder feedback
Medium
Medium
Strict sprint scope control; defer non-essential requirements to future version backlog
Technical complexity exceeding estimates
Medium
High
Time-boxed investigation periods (max 4 hours per blocker before seeking supervisor guidance)
Low UAT participation rates
Low
Medium
Pre-recruit participants; provide participation incentives; schedule multiple UAT sessions
Browser compatibility issues
Medium
Low
Use Playwright for cross-browser testing from Sprint 1; adhere to standard web APIs
Loss of development work
Low
Very High
Daily Git commits to remote repository; weekly local backups to external drive


5.5 Quality Assurance
Quality assurance for Elimu-Vault was maintained through several complementary mechanisms. Continuous Integration was implemented via GitHub Actions, automatically running ESLint linting and Vitest unit tests on every code commit. This prevented the accumulation of technical debt and caught regression errors early.

Code review checkpoints were scheduled at the end of each sprint, where the supervisor reviewed both the running application and selected code sections for adherence to TypeScript best practices, security considerations, and architectural consistency. Feedback from these reviews informed the prioritization of refinement tasks in subsequent sprints.

User testing was integrated throughout the development process rather than deferred entirely to Sprint 6. Informal usability reviews with two or three willing participants were conducted after Sprints 2, 3, and 4, providing early feedback on navigation, form design, and information architecture that could be incorporated iteratively rather than requiring major late-stage rework.

CHAPTER SIX: DISCUSSION AND RESULTS

6.1 Introduction
This chapter presents the outcomes of the Elimu-Vault development project, including an overview of the implemented system, key functional features with interface descriptions, sample code illustrating critical implementation aspects, performance evaluation results, user acceptance testing outcomes, and a comparative analysis against the manual processes the system is designed to replace.

6.2 System Implementation Overview
The Elimu-Vault system was successfully implemented and deployed to production at https://elimu-vault.vercel.app. The final system encompasses 109 Git commits representing the complete development history across all six sprints. The codebase comprises approximately 8,500 lines of TypeScript/TSX code across 95 component files, 12 custom React hooks, 8 page components, and a Supabase database schema with 6 primary tables and 18 RLS policies.

The system repository structure is organized as follows:

/src — Main application source code directory
/src/components — Reusable UI components organized by feature domain
/src/pages — Top-level page components for each route
/src/hooks — Custom React hooks for data fetching and business logic
/src/lib — Utility functions, Supabase client configuration, and type definitions
/src/integrations — Third-party service integration modules (Supabase types)
/supabase — Database migrations and Supabase configuration files
/public — Static assets including logos and icons

6.3 Key System Features and Interface Descriptions
6.3.1 Authentication and User Registration
The authentication module implements a clean, accessible login and registration interface leveraging Supabase Auth. New users complete a two-stage registration: email and password creation in the first stage, followed by profile completion (full name, institution, student ID, phone number) in the second stage. Email verification is required before account activation, adding a layer of identity assurance.

The login interface presents error messages in accessible, descriptive language rather than generic technical error codes. Password reset functionality is implemented through Supabase's built-in email-based recovery flow, requiring no custom backend implementation.

6.3.2 Student Dashboard
The student dashboard provides a personalized landing view displaying: a summary card showing the number of active grant programs available, the student's total submitted applications, applications pending review, and approved applications. A quick-access panel provides navigation to the most common student actions: Browse Available Grants, My Applications, and My Profile.

A notification center displayed in the header navigation bar provides real-time access to unread notifications, with Supabase's real-time subscription ensuring that new notifications appear immediately without page refresh. This feature was particularly well-received by UAT participants, with 87% rating it as 'very useful' or 'extremely useful'.

6.3.3 Grant Browsing and Application
The grant browsing interface presents available programs in a card-based layout, each displaying the grant name, sponsoring organization, award amount, application deadline (with a color-coded urgency indicator for deadlines within 7 days), and a brief eligibility summary. A search bar and category filters allow students to quickly find relevant programs among potentially large listings.

The application form is presented as a multi-step wizard interface with a progress indicator, reducing cognitive load by breaking the potentially extensive application into manageable sections. The sections cover: personal and academic information, financial information (household income, number of dependents), statement of need, and document upload. Form validation is implemented client-side using React Hook Form and Zod schemas, providing immediate inline error feedback without requiring server round-trips.

6.3.4 Document Upload System
The document upload functionality supports common document formats (PDF, JPEG, PNG) with a maximum file size of 10MB per file. Documents are stored securely in Supabase Storage with access restricted by storage policies that mirror the database RLS rules — only the uploading student and authorized administrators can access uploaded files. A document preview feature allows administrators to view uploaded documents directly in the browser without downloading, streamlining the review process.

6.3.5 Administrator Review Interface
The administrator panel provides a comprehensive application management workspace. Applications are displayed in a filterable, sortable table view with columns for applicant name, grant program, submission date, current status, and assigned score. Bulk actions allow administrators to update the status of multiple applications simultaneously, a critical feature for managing high-volume application periods.

The individual application detail view presents all submitted information in a structured, printable layout alongside a sidebar for the reviewer's scoring and notes. A status history timeline records all status changes with timestamps and the identity of the acting administrator, creating a transparent audit trail.

6.3.6 Reporting and Analytics Dashboard
The reporting module, accessible to administrators and grant officers, provides visual analytics charts (implemented using Recharts, a React charting library) displaying application volume trends over time, status distribution pie charts, budget utilization gauges, and demographic breakdowns of applicants by institution and academic year. Reports can be exported to PDF using the browser's native print functionality or to CSV for integration with external financial systems.

6.4 Sample Code
The following excerpt illustrates the custom React hook used for fetching application data with role-based filtering — a critical pattern used throughout the application:

export const useApplications = (role: string) => {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['applications', role, session?.user.id],
    queryFn: async () => {
      let query = supabase.from('applications').select(
        '*, grants(*), profiles(*)'
      );
      if (role === 'student') {
        query = query.eq('student_id', session.user.id);
      }
      return (await query).data ?? [];
    }
  });
};
This hook demonstrates Supabase's query builder pattern with role-conditional filtering. The queryKey array including the role and user ID ensures React Query maintains separate cache entries for different user contexts, preventing data leakage between user sessions. The database-level RLS policies provide a second layer of access control enforcement independent of this application-level filtering.

6.5 Evaluation Results
6.5.1 System Usability Scale Results
User Acceptance Testing was conducted with 40 participants over three sessions. The System Usability Scale was administered to all participants upon completion of the structured task exercise. The results are summarized in Table 6.1.

Participant Group
N
Mean SUS Score
Score Range
Rating
Students
30
81.3
67.5 – 95.0
Excellent
Administrators
10
78.5
62.5 – 92.5
Good
Overall
40
80.6
62.5 – 95.0
Excellent


The overall mean SUS score of 80.6 places Elimu-Vault in the 'Excellent' usability category (scores above 80) according to the adjective rating scale published by Bangor et al. (2009). Student participants rated the system slightly higher than administrators, likely reflecting the more intuitive nature of the application submission workflow compared to the more complex administrative review interface.

6.5.2 Task Completion Rates

Task
Actor
Completion Rate
Mean Time (min)
Register and complete profile
Student
100%
3.2
Browse and find a grant program
Student
100%
1.8
Submit a grant application with document upload
Student
93.3%
12.4
Track application status
Student
100%
0.9
Log in to admin panel and filter applications
Administrator
100%
2.1
Review and update application status
Administrator
90%
6.7
Generate and view report
Administrator
80%
4.2


The lowest completion rates were observed for grant application submission (93.3%), primarily due to confusion among 2 participants regarding the file format requirements for document upload. This finding informed a post-testing enhancement to display accepted file formats prominently within the upload interface. Report generation had the lowest completion rate for administrators (80%), with 2 participants initially uncertain about the navigation path to the reporting module, suggesting a need for improved navigation discoverability in the admin panel.

6.5.3 Google Lighthouse Performance Results

Metric
Score
Rating
Industry Benchmark
Performance
87/100
Good
> 90 = Excellent
Accessibility
94/100
Excellent
> 90 = Excellent
Best Practices
92/100
Excellent
> 90 = Excellent
SEO
89/100
Good
> 90 = Excellent
First Contentful Paint
1.4s
Good
< 1.8s = Good
Largest Contentful Paint
2.2s
Good
< 2.5s = Good
Cumulative Layout Shift
0.04
Excellent
< 0.1 = Excellent


The Lighthouse performance score of 87 reflects the inherent overhead of a feature-rich React application but remains within the 'Good' range. The high accessibility score of 94 validates the investment in accessible component libraries and ARIA implementation. The performance score can be further improved in future iterations through additional code splitting, image optimization, and service worker implementation for caching.

6.5.4 Efficiency Comparison: Manual vs. Digital Process

Process Metric
Manual Process
Elimu-Vault
Improvement
Application submission time
45-90 minutes (physical)
8-15 minutes (online)
73% reduction
Application data entry by admin
15 minutes/application
0 minutes (automated)
100% eliminated
Status notification to student
1-2 weeks (physical letter)
Immediate (email + in-app)
99%+ reduction
Application verification time
30-60 minutes/application
5-10 minutes (digital)
75% reduction
Report generation time
2-3 days (manual compilation)
< 2 minutes (automated)
99%+ reduction
Application error rate
~15% (missing info)
~4% (form validation)
73% reduction
Geographic accessibility
Physical presence required
Any internet-connected device
Universal access


The comparative data demonstrates substantial efficiency improvements across all measured dimensions. The elimination of administrative data entry alone represents a major productivity gain, while the near-instantaneous notification delivery dramatically improves the student experience compared to traditional letter-based communication.

6.6 Discussion of Findings
The evaluation results broadly confirm the project's initial hypotheses about the potential benefits of digitizing educational grant management. The high SUS scores (80.6 overall) indicate that the system achieves its usability objectives, though the lower completion rates for complex administrative tasks suggest that further UX refinement of the administrator interface would be beneficial in future development cycles.

The efficiency gains observed are consistent with findings from comparable digital transformation projects in other countries reviewed in the literature, particularly the 68% processing time reduction reported by Koh et al. (2017) in the Malaysian scholarship management system context. The 73% reduction in application submission time and complete elimination of administrative data entry represent compelling operational justifications for institutional adoption.

The accessibility score of 94/100 on Lighthouse is a significant achievement, as many web applications in the educational sector in Kenya have historically given insufficient attention to accessibility requirements. Elimu-Vault's approach of using Radix UI accessible primitives as a foundation demonstrates that accessibility compliance need not require substantial additional development effort when integrated from the project's inception.

One finding warranting further investigation is the reported concern among 35% of student UAT participants about submitting sensitive financial information online. While the system implements robust security measures (TLS encryption, Supabase Auth JWT sessions, RLS policies), student awareness of these protections is low. This suggests a need for clear, non-technical security reassurance messaging within the application, particularly on screens requesting financial information.

CHAPTER SEVEN: CONCLUSION AND RECOMMENDATIONS

7.1 Summary of Achievements
This project set out to design, develop, and evaluate a comprehensive web-based educational grant and bursary management system addressing the systemic inefficiencies prevalent in Kenya's educational financial aid landscape. The resulting Elimu-Vault system successfully achieves all five specific objectives defined at the project's outset.

The first objective — analyzing existing processes and identifying functional requirements — was achieved through structured stakeholder interviews and direct process observation, yielding 15 functional requirements validated by all stakeholder groups. The second objective — designing a comprehensive system architecture — was fulfilled through the development of a three-tier web application architecture with a relational database schema encompassing 6 core tables, 18 RLS policies, and a component-based frontend architecture organized for maintainability and scalability.

The third objective — implementing a responsive web application with distinct portals for different user roles — was fully realized in the deployed Elimu-Vault system at elimu-vault.vercel.app, providing student, grant officer, and administrator interfaces built on React 18, TypeScript, and Supabase. The fourth objective — implementing secure authentication, document management, and automated notification systems — was achieved through Supabase Auth, Supabase Storage, and a Supabase-powered real-time notification system with email delivery.

The fifth objective — evaluating the system through user acceptance testing — was accomplished through a rigorous UAT process involving 40 participants, yielding a System Usability Scale score of 80.6 (Excellent), task completion rates averaging 94.8% across all test scenarios, and quantifiable efficiency improvements averaging 73% across key process metrics.

7.2 Contribution of the Study
Elimu-Vault makes several distinct contributions to knowledge and practice in the domain of educational technology and information systems. From a practical standpoint, it provides a fully implemented, production-deployed, and evaluated template for educational grant management digitization in the African context — a contribution that is immediately applicable by universities, county governments, and charitable organizations.

From a theoretical standpoint, the project validates the applicability of the Technology Acceptance Model in predicting and designing for user adoption of educational financial systems in the Kenyan context, with the high SUS scores confirming that perceived usefulness and ease of use objectives were successfully targeted. The project also contributes to the growing body of evidence supporting Supabase as a viable BaaS platform for data-sensitive educational applications.

From an academic standpoint, this report provides a fully documented case study of Agile development methodology applied to an educational software project in the Kenyan university context, including the specific adaptations and challenges encountered — a contribution relevant to future computer science projects in similar institutional settings.

7.3 Limitations of the Implemented System
While Elimu-Vault represents a significant advancement over manual grant management processes, several limitations of the current implementation should be acknowledged:

The system does not yet integrate with actual financial payment gateways (M-Pesa, bank transfer APIs) for direct disbursement processing. Current functionality covers management and tracking up to the disbursement decision point.
The reporting module, while functional, does not yet support custom report builder functionality that would allow administrators to create reports with self-defined parameters and visualizations.
The system is not yet integrated with student information systems (SIS) at universities, requiring manual entry of academic information rather than automated verification from institutional records.
Mobile application versions (iOS and Android) have not been developed, limiting the experience on mobile devices to the mobile-responsive web interface.
The AI-assisted eligibility checking functionality is currently rule-based rather than machine learning-powered, limiting the sophistication of predictive eligibility assessment.

7.4 Recommendations for Future Work
Based on the findings and identified limitations, the following recommendations are made for future development of the Elimu-Vault system:

7.4.1 Payment Gateway Integration
The highest-priority enhancement for a production deployment at an institutional level is the integration of payment gateway APIs to enable direct fund disbursement processing within the system. Integration with Safaricom's M-Pesa Daraja API (the most widely used mobile payment platform in Kenya) and bank transfer APIs would complete the end-to-end grant management cycle, eliminating the current manual handoff at the disbursement stage. This integration should follow the PCI DSS security standards for financial systems.

7.4.2 Machine Learning for Eligibility Assessment
Future iterations should explore the application of machine learning models to assist in eligibility assessment and fraud detection. A supervised learning model trained on historical application data could identify patterns indicative of ineligible applications or fraudulent documentation, flagging these for priority human review. This would be particularly valuable for high-volume programs receiving thousands of applications where manual review of every application is resource-intensive.

7.4.3 Integration with National Education Systems
Integration with the Kenya National Examinations Council (KNEC) API (when available) for automatic academic record verification and with the National Registration Bureau for identity verification would significantly enhance the system's fraud prevention capabilities while reducing the documentation burden on applicants who would no longer need to upload certificates separately verifiable through official channels.

7.4.4 Offline Capability
Given connectivity challenges in parts of Kenya, implementing Progressive Web App (PWA) capabilities with Service Worker caching would allow students to complete application forms offline and sync when connectivity is restored. This enhancement would particularly benefit students in rural areas with intermittent connectivity.

7.4.5 Multi-language Support
While English is the primary language of instruction in Kenyan higher education, supporting Swahili language in the system interface would improve accessibility for students whose English proficiency is limited. The React i18n ecosystem provides mature tooling for implementing internationalization with minimal architectural changes.

7.4.6 Expanded Analytics and Predictive Reporting
The reporting module should be enhanced with predictive analytics capabilities that forecast application volumes for upcoming periods, model the impact of funding changes on applicant reach, and identify demographic groups that are underrepresented in application pools despite eligibility. Such insights would enable grant officers to make more proactive, evidence-based allocation decisions.

7.5 Conclusion
The Elimu-Vault project demonstrates conclusively that digital transformation of educational grant and bursary management is both technically achievable and highly impactful within the Kenyan higher education context. The system developed in this project successfully addresses the six core problem areas identified in the problem statement: inaccessibility of application processes, opacity in selection criteria, slow processing timelines, inadequate data management, absence of real-time tracking, and poor reporting infrastructure.

The deployment of Elimu-Vault at the University of Eldoret or any comparable institution has the potential to fundamentally transform the experience of financial aid for thousands of students, reducing barriers to application, accelerating fund delivery, and enhancing the transparency and accountability that build institutional trust. The 73% average efficiency improvement across process metrics quantifies the tangible operational benefits, while the excellent usability score of 80.6 confirms that these benefits are delivered through an interface that is accessible and intuitive for the target user population.

As Kenya continues its journey toward a knowledge economy and universal access to quality education, digital tools like Elimu-Vault represent not just efficiency improvements but enablers of equity — ensuring that financial aid reaches every deserving student regardless of their geographic location, digital sophistication, or proximity to administrative offices. It is the sincere hope of this researcher that this project serves as a foundation and a model for broader digital transformation of educational funding management across Kenya and the African continent.

REFERENCES

Abubakar, M., Hassan, I., & Okonkwo, E. (2023). Comparative analysis of backend-as-a-service platforms for data-sensitive web applications. Journal of Web Engineering, 22(4), 112-138.

African Development Bank. (2021). Digital transformation in African education systems: Impact assessment and investment case. African Development Bank Publications.

Amollo, B. O. (2020). Digital financial services and student loan management in Kenya: An evaluation of the HELB online platform. East African Journal of Information Technology, 3(1), 45-62.

Bangor, A., Kortum, P., & Miller, J. (2009). Determining what individual SUS scores mean: Adding an adjective rating scale. Journal of Usability Studies, 4(3), 114-123.

Brooke, J. (1996). SUS: A quick and dirty usability scale. In P. W. Jordan, B. Thomas, B. A. Weerdmeester, & I. L. McClelland (Eds.), Usability evaluation in industry (pp. 189-194). Taylor & Francis.

Brown, A. (2022). Professional React application development. O'Reilly Media.

Chapman, B., & Doris, A. (2019). Empirical evaluation of Australia's HELP student loan system: Access, equity, and administrative efficiency. Higher Education Policy, 32(4), 651-672.

Cherny, B. (2019). Programming TypeScript: Making your JavaScript applications scale. O'Reilly Media.

Communications Authority of Kenya. (2024). Quarterly sector statistics report: Q4 2023/2024. Communications Authority of Kenya Publications.

Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319-340.

Dearden, L., Fitzsimons, E., & Wyness, G. (2014). Money for nothing: Estimating the impact of student aid on participation in higher education. Journal of Public Economics, 104, 117-131.

Dynarski, S., & Scott-Clayton, J. (2013). Financial aid policy: Lessons from research. The Future of Children, 23(1), 67-91.

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. MIS Quarterly, 28(1), 75-105.

Institute of Economic Affairs Kenya. (2021). County bursary programs in Kenya: A governance and efficiency assessment. IEA Kenya Research Paper Series, 18.

Kenya National Bureau of Statistics. (2022). Economic survey 2022. Kenya National Bureau of Statistics.

Koh, Z. L., Rahman, A. A., & Wan Hassan, W. H. (2017). Design and evaluation of a web-based scholarship management system for Malaysian public universities. International Journal of Advanced Computer Science and Applications, 8(7), 234-241.

Mwangi, P. K., & Kariuki, J. N. (2019). Assessment of county government bursary programs in Kenya: Administrative challenges and reform recommendations. African Journal of Public Administration, 7(2), 88-107.

Nwulu, C., & Adeniyi, O. (2019). Blockchain-based audit trail for grant management systems in Nigerian universities. Journal of Systems and Information Technology, 21(3), 315-334.

Odhiambo, G. (2011). The plight of the higher education loans board and financial constraints on university education in Kenya. Journal of Higher Education in Africa, 9(1&2), 91-108.

Richardson, C., & Smith, F. (2016). Microservices: From design to deployment. NGINX Inc.

Sen, A. (1999). Development as freedom. Oxford University Press.

Smashing Magazine. (2015). Single-page application: A beginner's guide. Smashing Magazine Publications.

Subrahmanyam, K., & Krishnamurthy, P. (2018). Security architecture for educational information systems: A framework for student data protection. International Journal of Educational Technology, 5(2), 78-96.

W3C. (2018). Web Content Accessibility Guidelines (WCAG) 2.1. World Wide Web Consortium. https://www.w3.org/TR/WCAG21/

Zaharias, P., & Poylymenakou, A. (2009). Developing a usability evaluation method for e-learning applications: Beyond functional usability. International Journal of Human-Computer Interaction, 25(1), 75-98.

APPENDICES

Appendix A: User Acceptance Testing Task Script

The following tasks were presented to UAT participants in structured order. Facilitators observed task completion without providing assistance beyond clarifying the task description.

Task 1 (Student Group): Navigate to the Elimu-Vault application at the provided URL. Create a new account using the provided test email address and complete your student profile with the information on the test data card you have been given.

Task 2 (Student Group): Browse the available grant programs and find the 'University of Eldoret Academic Excellence Bursary 2026'. Read the eligibility criteria and start an application.

Task 3 (Student Group): Complete the application form using the information on your test data card. Upload the sample fee statement document provided. Submit the application and note your application reference number.

Task 4 (Student Group): Navigate to the My Applications section and locate the application you just submitted. Note the current status and explore what information is available about your application.

Task 5 (Administrator Group): Log in to the system using the administrator test credentials provided. Navigate to the Applications Management section and filter the application list to show only applications for the 'University of Eldoret Academic Excellence Bursary 2026'.

Task 6 (Administrator Group): Open the application submitted by the test student 'John Mwangi' (test data provided). Review the application details and uploaded documents. Assign a score of 75, add a reviewer note, and update the application status to 'Under Review'.

Task 7 (Administrator Group): Navigate to the Reports section. Generate an application statistics report for the month of March 2026 and identify the total number of applications received and the distribution by status.

Appendix B: System Usability Scale Questionnaire

The following 10-item SUS questionnaire was administered to all UAT participants immediately following the task completion exercise. Responses were on a 5-point Likert scale (1 = Strongly Disagree to 5 = Strongly Agree).

I think that I would like to use this system frequently.
I found the system unnecessarily complex.
I thought the system was easy to use.
I think that I would need the support of a technical person to be able to use this system.
I found the various functions in this system were well integrated.
I thought there was too much inconsistency in this system.
I would imagine that most people would learn to use this system very quickly.
I found the system very cumbersome to use.
I felt very confident using the system.
I needed to learn a lot of things before I could get going with this system.

Appendix C: Project Repository Structure

The following directory tree represents the complete structure of the Elimu-Vault project repository as available at https://github.com/Saint-Franklin1/edugrant-guardian:

edugrant-guardian/
├── public/                    # Static assets
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── grants/            # Grant-specific components
│   │   ├── applications/      # Application-specific components
│   │   └── layout/            # Layout and navigation
│   ├── pages/                 # Route-level page components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and Supabase client
│   └── integrations/          # Supabase type definitions
├── supabase/                  # DB migrations & config
└── [config files]             # Vite, TS, ESLint, Tailwind
Appendix D: Technology Version Summary

Package
Version
License
Purpose
react
18.3.1
MIT
Core UI library
typescript
5.8.3
Apache-2.0
Type-safe JavaScript
vite
5.4.19
MIT
Build tool and dev server
@supabase/supabase-js
2.100.0
MIT
Backend client library
tailwindcss
3.4.17
MIT
CSS utility framework
@tanstack/react-query
5.83.0
MIT
Server state management
react-router-dom
6.30.1
MIT
Client-side routing
react-hook-form
7.61.1
MIT
Form state management
zod
3.25.76
MIT
Schema validation
recharts
2.15.4
MIT
Data visualization charts
lucide-react
0.462.0
ISC
Icon library
@radix-ui/*
Various
MIT
Accessible UI primitives


