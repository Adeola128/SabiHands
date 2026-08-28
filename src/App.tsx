import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import MinimalProfileLayout from './layouts/MinimalProfileLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';

import ForVolunteers from './pages/ForVolunteers';
import ForOrganizations from './pages/ForOrganizations';
import Community from './pages/Community';
import CommunityRecommendations from './pages/CommunityRecommendations';
import Membership from './pages/Membership';
import About from './pages/About';
import CertificateVerification from './pages/CertificateVerification';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import NotFound from './pages/NotFound';
import ErrorPage from './pages/ErrorPage';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyContact from './pages/auth/VerifyContact';
import VolunteerOnboarding from './pages/auth/VolunteerOnboarding';
import OrganizationOnboarding from './pages/auth/OrganizationOnboarding';
import OrgVerificationPending from './pages/auth/OrgVerificationPending';
import JoinTeam from './pages/auth/JoinTeam';

const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout'));
const DashboardRedirect = React.lazy(() => import('./components/DashboardRedirect'));
const VolunteerDashboard = React.lazy(() => import('./pages/volunteer/VolunteerDashboard'));
const BrowseGigs = React.lazy(() => import('./pages/volunteer/BrowseGigs'));
const MyApplications = React.lazy(() => import('./pages/volunteer/MyApplications'));
const VolunteerInvitations = React.lazy(() => import('./pages/volunteer/VolunteerInvitations'));
const ApplyGig = React.lazy(() => import('./pages/volunteer/ApplyGig'));
const GigDetail = React.lazy(() => import('./pages/volunteer/GigDetail'));
const MyGigs = React.lazy(() => import('./pages/volunteer/MyGigs'));
const GigCheckIn = React.lazy(() => import('./pages/volunteer/GigCheckIn'));
const MyCertificates = React.lazy(() => import('./pages/volunteer/MyCertificates'));
const CertificateDetail = React.lazy(() => import('./pages/volunteer/CertificateDetail'));
const VolunteerProfile = React.lazy(() => import('./pages/volunteer/VolunteerProfile'));
const EditProfile = React.lazy(() => import('./pages/volunteer/EditProfile'));
const SubmitWork = React.lazy(() => import('./pages/volunteer/SubmitWork'));
const OrgDashboard = React.lazy(() => import('./pages/organization/OrgDashboard'));
const ManageGigs = React.lazy(() => import('./pages/organization/ManageGigs'));
const PostGig = React.lazy(() => import('./pages/organization/PostGig'));
const EditGig = React.lazy(() => import('./pages/organization/EditGig'));
const ReviewSubmissions = React.lazy(() => import('./pages/organization/ReviewSubmissions'));
const OrgGigDetail = React.lazy(() => import('./pages/organization/OrgGigDetail'));
const ReviewApplicants = React.lazy(() => import('./pages/organization/ReviewApplicants'));
const VolunteerDetailOrg = React.lazy(() => import('./pages/organization/VolunteerDetailOrg'));
const MarkAttendance = React.lazy(() => import('./pages/organization/MarkAttendance'));
const IssueCertificates = React.lazy(() => import('./pages/organization/IssueCertificates'));
const OrgSettings = React.lazy(() => import('./pages/organization/OrgSettings'));
const TeamMembers = React.lazy(() => import('./pages/organization/TeamMembers'));
const ImpactDashboard = React.lazy(() => import('./pages/organization/ImpactDashboard'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Messages = React.lazy(() => import('./pages/Messages'));
const OrganizationProfile = React.lazy(() => import('./pages/organization/OrganizationProfile'));
import PublicVolunteerProfile from './pages/public/PublicVolunteerProfile';
import PublicOrganizationProfile from './pages/public/PublicOrganizationProfile';
import PublicGigDetail from './pages/public/PublicGigDetail';
import PublicPostDetail from './pages/public/PublicPostDetail';
import ProgrammaticLandingPage from './pages/public/ProgrammaticLandingPage';
import GuidesDirectory from './pages/public/guides/GuidesDirectory';
import VolunteerNoExperience from './pages/public/guides/VolunteerNoExperience';
import VerifyNGO from './pages/public/guides/VerifyNGO';

import AdminLogin from './pages/auth/AdminLogin';
const AdminLayout = React.lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const OrgVerificationQueue = React.lazy(() => import('./pages/admin/OrgVerificationQueue'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));
const GigModeration = React.lazy(() => import('./pages/admin/GigModeration'));
const CertificateRegistry = React.lazy(() => import('./pages/admin/CertificateRegistry'));
const SupportDisputes = React.lazy(() => import('./pages/admin/SupportDisputes'));
const ReportsAnalytics = React.lazy(() => import('./pages/admin/ReportsAnalytics'));

import PermissionDenied from './pages/system/PermissionDenied';
import Maintenance from './pages/system/Maintenance';

const SupportChatWidget = React.lazy(() => import('./components/SupportChatWidget'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <React.Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<MainLayout />} errorElement={<ErrorPage />}>
          <Route index element={<Home />} />

          <Route path="volunteers" element={<ForVolunteers />} />
          <Route path="organizations" element={<ForOrganizations />} />
          <Route path="community" element={<Community />} />
          <Route path="membership" element={<Membership />} />
          <Route path="about" element={<About />} />
          <Route path="verify" element={<CertificateVerification />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="contact" element={<Contact />} />
          <Route path="terms" element={<Legal type="terms" />} />
          <Route path="privacy" element={<Legal type="privacy" />} />
          
          {/* Programmatic SEO Hubs */}
          <Route path="volunteer-opportunities/nigeria" element={<ProgrammaticLandingPage type="nigeria" />} />
          <Route path="volunteer-opportunities/ngo/nigeria" element={<ProgrammaticLandingPage type="ngo" />} />
          <Route path="volunteer-opportunities/remote" element={<ProgrammaticLandingPage type="remote" />} />
          <Route path="nysc-volunteer-opportunities" element={<ProgrammaticLandingPage type="graduate" />} />
          <Route path="nysc-volunteer-opportunities" element={<ProgrammaticLandingPage type="graduate" />} />
          <Route path="locations/:location/volunteer-opportunities" element={<ProgrammaticLandingPage type="location" />} />
          <Route path="skills/:skill" element={<ProgrammaticLandingPage type="skill" />} />

          {/* Practical Guides */}
          <Route path="guides" element={<GuidesDirectory />} />
          <Route path="guides/volunteer-in-nigeria-with-no-experience" element={<VolunteerNoExperience />} />
          <Route path="guides/verify-ngo" element={<VerifyNGO />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Public Entity Profiles (Minimal Header) */}
        <Route path="/" element={<MinimalProfileLayout />} errorElement={<ErrorPage />}>
          <Route path="volunteer/:slug" element={<PublicVolunteerProfile />} />
          <Route path="organization/:id" element={<PublicOrganizationProfile />} />
          <Route path="org/:id" element={<PublicOrganizationProfile />} />
          <Route path="gig/:id" element={<PublicGigDetail />} />
          <Route path="post/:id" element={<PublicPostDetail />} />
        </Route>

        {/* Auth & Onboarding Routes (Standalone full-screen) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-contact" element={<VerifyContact />} />
        <Route path="/onboarding/volunteer" element={<VolunteerOnboarding />} />
        <Route path="/onboarding/organization" element={<OrganizationOnboarding />} />
        <Route path="/onboarding/pending" element={<OrgVerificationPending />} />
        <Route path="/join-team" element={<JoinTeam />} />

        {/* Dashboard Routes - Volunteer */}
        <Route path="/dashboard/volunteer" element={<DashboardLayout role="volunteer" />}>
          <Route index element={<VolunteerDashboard />} />
          <Route path="gigs" element={<BrowseGigs />} />
          <Route path="gigs/:id" element={<GigDetail />} />
          <Route path="gigs/:id/apply" element={<ApplyGig />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="invitations" element={<VolunteerInvitations />} />
          <Route path="my-gigs" element={<MyGigs />} />
          <Route path="gigs/:applicationId/submit" element={<SubmitWork />} />
          <Route path="check-in" element={<GigCheckIn />} />
          <Route path="certificates" element={<MyCertificates />} />
          <Route path="certificates/:id" element={<CertificateDetail />} />
          <Route path="profile" element={<VolunteerProfile />} />
          <Route path="settings" element={<EditProfile />} />
        </Route>

        {/* Global Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardRedirect />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="messages" element={<Messages />} />
          <Route path="community" element={<Community />} />
          <Route path="community/recommendations" element={<CommunityRecommendations />} />
          <Route path="organization/profile" element={<OrganizationProfile />} />
        </Route>

        {/* Dashboard Routes - Organization */}
        <Route path="/dashboard/org" element={<DashboardLayout role="organization" />}>
          <Route index element={<OrgDashboard />} />
          <Route path="gigs" element={<ManageGigs />} />
          <Route path="gigs/new" element={<PostGig />} />
          <Route path="gigs/:id" element={<OrgGigDetail />} />
          <Route path="gigs/:id/edit" element={<EditGig />} />
          <Route path="gigs/:id/submissions" element={<ReviewSubmissions />} />
          <Route path="gigs/:id/applicants" element={<ReviewApplicants />} />
          <Route path="gigs/:id/attendance" element={<MarkAttendance />} />
          <Route path="gigs/:id/certificates" element={<IssueCertificates />} />
          <Route path="volunteers/:id" element={<VolunteerDetailOrg />} />
          <Route path="settings" element={<OrgSettings />} />
          <Route path="team" element={<TeamMembers />} />
          <Route path="impact" element={<ImpactDashboard />} />
        </Route>

        {/* Dashboard Routes - Internal Admin */}
        <Route path="/hq-login" element={<AdminLogin />} />
        <Route path="/hq" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="org-verification" element={<OrgVerificationQueue />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="gig-moderation" element={<GigModeration />} />
          <Route path="certificates" element={<CertificateRegistry />} />
          <Route path="support" element={<SupportDisputes />} />
          <Route path="reports" element={<ReportsAnalytics />} />
        </Route>

        {/* System Routes */}
        <Route path="/403" element={<PermissionDenied />} />
        <Route path="/maintenance" element={<Maintenance />} />
      </Routes>
        </React.Suspense>
      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          duration: 4000, 
          style: { borderRadius: '12px', padding: '16px', color: 'var(--ink)' }
        }} 
      />
        <React.Suspense fallback={null}><SupportChatWidget /></React.Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
