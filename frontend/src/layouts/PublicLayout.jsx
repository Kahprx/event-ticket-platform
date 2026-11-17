import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import MobileNav from "../components/MobileNav.jsx";
import ChatbotButton from "../components/ChatbotButton.jsx";
import ChatbotWindow from "../components/ChatbotWindow.jsx";
import ToastStack from "../components/Toast.jsx";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
      <ChatbotButton />
      <ChatbotWindow />
      <ToastStack />
    </div>
  );
}
