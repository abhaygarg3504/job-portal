import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import InterviewCalendarModal from '../pages/interviewCalenderModel';
import { Bell, CalendarDays, Bookmark, Menu, X, MessageCircle } from 'lucide-react';

const Navbar = () => {
  const { openSignIn } = useClerk();
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    setShowRecuriterLogin,
    backendURL,
    setIsSavedJobsOpen,
    isSavedJobsOpen,
  } = useContext(AppContext);

  const [isUserStored, setIsUserStored] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sendUserDataToBackend = async () => {
    if (!user || isUserStored) return;
    const userData = {
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.primaryEmailAddress?.emailAddress || '',
      image: user.imageUrl || '',
      resume: '',
    };
    try {
      const response = await fetch(`${backendURL}/api/users/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (response.ok) setIsUserStored(true);
      else console.error('❌ Error storing user:', data.message);
    } catch (error) {
      console.error('❌ Server error:', error);
    }
  };

  useEffect(() => {
    if (isSignedIn && user && !isUserStored && backendURL) {
      sendUserDataToBackend();
    }
  }, [isSignedIn, user, backendURL]);

  return (
    <div className="shadow py-4 bg-white">
      <div className="container px-4 2xl:px-20 mx-auto flex justify-between items-center">
        <img
          onClick={() => navigate('/')}
          className="cursor-pointer w-32"
          src={assets.logo}
          alt="Logo"
        />

        {/* Desktop Links */}
        {isSignedIn && user ? (
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="text-blue-600 hover:text-blue-800"
              title="Interview Calendar"
            >
              <CalendarDays size={22} />
            </button>
            <Link to="/chat-system" className="text-gray-700 hover:text-gray-900" title="Chat">
              <MessageCircle size={22} />
            </Link>
            <Link
              to="/subscribe"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg"
            >
              Subscription
            </Link>
            <Link
              to="/blogs"
              className="bg-blue-600 text-white py-2 px-4 rounded-lg"
            >
              Blogs
            </Link>
            <button
              onClick={() => setIsSavedJobsOpen(!isSavedJobsOpen)}
              className="text-blue-600 hover:text-blue-800"
              title="Saved Jobs"
            >
              <Bookmark size={22} />
            </button>
            <Link
              to="/application"
              className="text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <p className="max-sm:hidden">Hello, {user.firstName}</p>
            <UserButton />
          </div>
        ) : (
          <div className="hidden md:flex gap-4">
            <button
              onClick={() => setShowRecuriterLogin(true)}
              className="text-gray-600"
            >
              Recruiter Login
            </button>
            <button
              onClick={() => openSignIn()}
              className="bg-blue-600 text-white py-2 px-4 rounded-full"
            >
              Login
            </button>
          </div>
        )}

        {/* Mobile Hamburger */}
        {isSignedIn && user && (
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        )}
        {/* Mobile Auth Buttons */}
        {!isSignedIn && (
          <div className="md:hidden flex gap-2">
            <button
              onClick={() => setShowRecuriterLogin(true)}
              className="text-gray-600"
            >
              Recruiter Login
            </button>
            <button
              onClick={() => openSignIn()}
              className="bg-blue-600 text-white py-2 px-4 rounded-full"
            >
              Login
            </button>
          </div>
        )}

        {/* Mobile Side Drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="relative bg-white w-64 p-6 transform transition-transform duration-300 ease-in-out slide-in">
              <button
                className="absolute top-4 right-4"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
              <nav className="flex flex-col gap-4 mt-8">
                <button
                  onClick={() => {
                    setIsCalendarOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <CalendarDays size={20} />
                  Calendar
                </button>
                <Link
                  to="/chat-system"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <Bell size={20} />
                  Chat
                </Link>
                <Link
                  to="/subscribe"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg"
                >
                  Subscription
                </Link>
                <Link
                  to="/blogs"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 px-4 bg-blue-600 text-white rounded-lg"
                >
                  Blogs
                </Link>
                <button
                  onClick={() => {
                    setIsSavedJobsOpen(!isSavedJobsOpen);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <Bookmark size={20} />
                  Saved Jobs
                </button>
                <Link
                  to="/application"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  Dashboard
                </Link>
                <div className="pt-4 border-t">
                  <p>Hello, {user.firstName}</p>
                  <UserButton />
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Interview Calendar Modal */}
        <InterviewCalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
        />
      </div>
    </div>
  );
};

export default Navbar;
