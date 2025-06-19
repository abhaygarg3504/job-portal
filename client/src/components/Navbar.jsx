import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import InterviewCalendarModal from '../pages/interviewCalenderModel';
import { Bell, CalendarDays, Bookmark } from 'lucide-react';

const Navbar = () => {
    const { openSignIn } = useClerk(); 
    const { user, isSignedIn } = useUser(); 
    const navigate = useNavigate();
    const { setShowRecuriterLogin, backendURL, setIsSavedJobsOpen, isSavedJobsOpen } = useContext(AppContext);
    const [isUserStored, setIsUserStored] = useState(false); 
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const isRecruiter = location.pathname.includes("/dashboard");   
    const sendUserDataToBackend = async () => {
        if (!user || isUserStored) return;
    
        const userData = {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.primaryEmailAddress?.emailAddress || '',
            image: user.imageUrl || '',
            resume: '',
        };
    
        // console.log("🔄 Sending user data to backend...", userData);
    
        try {
            const response = await fetch(`${backendURL}/api/users/user`, { 
                method: "POST",  
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData), 
            });
    
            const data = await response.json();
            if (response.ok) {
                // console.log("✅ User stored successfully:", data);
                setIsUserStored(true);
            } else {
                console.error("❌ Error storing user:", data.message);
            }
        } catch (error) {
            console.error("❌ Server error:", error);
        }
    };
    

    // Call function when user logs in (only once)
    useEffect(() => {
        if (isSignedIn && user && !isUserStored && backendURL) {
            sendUserDataToBackend();
        }
    }, [isSignedIn, user, backendURL]); // Add missing dependencies

    return (
        <div className='shadow py-4'>
            <div className='container px-4 2xl:px-20 mx-auto flex justify-between item-center'>
                <img onClick={() => navigate('/')} className='cursor-pointer' src={assets.logo} alt="Logo" />
                
                {
                    user ? (
                        <div className='flex items-center gap-3'>
                          {/* 📅 Calendar Button */}
      <button
        onClick={() => setIsCalendarOpen(true)}
        className="text-blue-600 hover:text-blue-800"
        title="Interview Calendar"
      >
        <CalendarDays size={22} />
      </button>

      {/* 🔔 Notification Bell */}
      <a href="/chat-system" target="">
        <Bell />
      </a>

      {/* 📅 Interview Calendar Modal */}
      <InterviewCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      <div className="relative inline-block text-left">
        <a
          href="/subscribe"
          target=""
          className="bg-blue-600 text-white p-2.5 px-10 rounded-lg"
        >
          Subscription
        </a>
      </div>
       <div className="relative inline-block text-left">
        <a
          href="/blogs"
          target=""
          className="bg-blue-600 text-white p-2.5 px-10 rounded-lg"
        >
          Blogs
        </a>
      </div>
       <button 
                className="text-blue-600 hover:text-blue-800"
                onClick={() => setIsSavedJobsOpen(!isSavedJobsOpen)}
                title="Saved Jobs"
              >
                <Bookmark size={22} />
              </button>
                            <Link to={`/application`}>DashBoard</Link>
                            <p className='max-sm:hidden'>Hello, {user.firstName} {user.lastName || ''}</p>
                            <UserButton />
                        </div>
                    ) : (
                        <div className='flex gap-4'>
                            <button onClick={() => setShowRecuriterLogin(true)} className='text-gray-600'>Recruiter Login</button>
                            <button onClick={() => openSignIn()} className='bg-blue-600 text-white px-6 sm:px-8 rounded-full'>Login</button>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default Navbar;