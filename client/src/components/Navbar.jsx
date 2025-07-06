import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import InterviewCalendarModal from '../pages/interviewCalenderModel';
import {  CalendarDays, Bookmark, Menu, X, MessageCircle } from 'lucide-react';
import SlideInMenu from './SliderMenu';

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
    const backdrop = {
    visible: { opacity: 0.5 },
    hidden: { opacity: 0 }
  };

  const panel = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
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

         <SlideInMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          user={user}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onToggleSavedJobs={() => setIsSavedJobsOpen(!isSavedJobsOpen)}
        />

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
