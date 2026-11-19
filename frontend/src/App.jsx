import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import RequireAdmin from "./components/RequireAdmin.jsx";

import HomePage from "./pages/HomePage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import EventDetailPage from "./pages/EventDetailPage.jsx";
import SeatSelectionPage from "./pages/SeatSelectionPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PaymentResultPage from "./pages/PaymentResultPage.jsx";
import MyTicketsPage from "./pages/MyTicketsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ChatbotPage from "./pages/ChatbotPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import AdminOverviewPage from "./pages/admin/AdminOverviewPage.jsx";
import AdminEventsPage from "./pages/admin/AdminEventsPage.jsx";
import AdminTicketsPage from "./pages/admin/AdminTicketsPage.jsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.jsx";
import AdminAccountsPage from "./pages/admin/AdminAccountsPage.jsx";
import AdminRolesPage from "./pages/admin/AdminRolesPage.jsx";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage.jsx";
import AdminLocationsPage from "./pages/admin/AdminLocationsPage.jsx";
import AdminChatbotPage from "./pages/admin/AdminChatbotPage.jsx";
import AdminReportsPage from "./pages/admin/AdminReportsPage.jsx";

// Mỗi lần đổi trang thì cuộn về đầu, trừ khi người dùng đi tới anchor (#).
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="events/:id/select" element={<SeatSelectionPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="payment/:result" element={<PaymentResultPage />} />
          <Route path="payment-result" element={<PaymentResultPage />} />
          <Route path="my-tickets" element={<MyTicketsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="chatbot" element={<ChatbotPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="login" element={<LoginPage />} />

        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminOverviewPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="tickets" element={<AdminTicketsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="accounts" element={<AdminAccountsPage />} />
          <Route path="roles" element={<AdminRolesPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="users" element={<Navigate to="/admin/customers" replace />} />
          <Route path="locations" element={<AdminLocationsPage />} />
          <Route path="chatbot" element={<AdminChatbotPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
