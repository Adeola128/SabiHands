import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import ForVolunteers from './pages/ForVolunteers';
import ForOrganizations from './pages/ForOrganizations';
import Community from './pages/Community';
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

import DashboardLayout from './layouts/DashboardLayout';
import DashboardRedirect from './components/DashboardRedirect';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import BrowseGigs from './pages/volunteer/BrowseGigs';
import MyApplications from './pages/volunteer/MyApplications';
import VolunteerInvitations from './pages/volunteer/VolunteerInvitations';
import ApplyGig from './pages/volunteer/ApplyGig';
import GigDetail from './pages/volunteer/GigDetail';
import MyGigs from './pages/volunteer/MyGigs';
import GigCheckIn from './pages/volunteer/GigCheckIn';
import MyCertificates from './pages/volunteer/MyCertificates';
import CertificateDetail from './pages/volunteer/CertificateDetail';
import VolunteerProfile from './pages/volunteer/VolunteerProfile';
import EditProfile from './pages/volunteer/EditProfile';
import SubmitWork from './pages/volunteer/SubmitWork';
import OrgDashboard from './pages/organization/OrgDashboard';
import ManageGigs from './pages/organization/ManageGigs';
import PostGig from './pages/organization/PostGig';
import EditGig from './pages/organization/EditGig';
import ReviewSubmissions from './pages/organization/ReviewSubmissions';
import OrgGigDetail from './pages/organization/OrgGigDetail';
import ReviewApplicants from './pages/organization/ReviewApplicants';
import VolunteerDetailOrg from './pages/organization/VolunteerDetailOrg';
import MarkAttendance from './pages/organization/MarkAttendance';
import IssueCertificates from './pages/organization/IssueCertificates';
import OrgSettings from './pages/organization/OrgSettings';
import TeamMembers from './pages/organization/TeamMembers';
import MembershipBilling from './pages/organization/MembershipBilling';
import ImpactDashboard from './pages/organization/ImpactDashboard';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import OrganizationProfile from './pages/organization/OrganizationProfile';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrgVerificationQueue from './pages/admin/OrgVerificationQueue';
import UserManagement from './pages/admin/UserManagement';
import GigModeration from './pages/admin/GigModeration';
import CertificateRegistry from './pages/admin/CertificateRegistry';
import BillingAdmin from './pages/admin/BillingAdmin';
import SponsoredPlacement from './pages/admin/SponsoredPlacement';
import SupportDisputes from './pages/admin/SupportDisputes';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';

import PermissionDenied from './pages/system/PermissionDenied';
import Maintenance from './pages/system/Maintenance';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} errorElement={<ErrorPage />}>
          <Route index element={<Home />} />
          <Route path="how-it-works" element={<HowItWorks />} />
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
          <Route path="*" element={<NotFound />} />
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
          <Route path="billing" element={<MembershipBilling />} />
          <Route path="impact" element={<ImpactDashboard />} />
        </Route>

        {/* Dashboard Routes - Internal Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="org-verification" element={<OrgVerificationQueue />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="gig-moderation" element={<GigModeration />} />
          <Route path="certificates" element={<CertificateRegistry />} />
          <Route path="billing" element={<BillingAdmin />} />
          <Route path="sponsored" element={<SponsoredPlacement />} />
          <Route path="support" element={<SupportDisputes />} />
          <Route path="reports" element={<ReportsAnalytics />} />
        </Route>

        {/* System Routes */}
        <Route path="/403" element={<PermissionDenied />} />
        <Route path="/maintenance" element={<Maintenance />} />
      </Routes>
      <Toaster 
        position="bottom-right" 
        toastOptions={{ 
          duration: 4000, 
          style: { borderRadius: '12px', padding: '16px', color: 'var(--ink)' }
        }} 
      />
    </BrowserRouter>
  );
};

export default App;
