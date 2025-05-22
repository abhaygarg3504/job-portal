import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useAuth, useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Bell, CalendarDays } from 'lucide-react';
import InterviewCalendarModal from '../pages/interviewCalenderModel';

const Navbar = () => {
    const { openSignIn } = useClerk(); 
    const { user, isSignedIn } = useUser(); 
    const navigate = useNavigate();
    const { setShowRecuriterLogin, backendURL, companyData } = useContext(AppContext);
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

    console.log(user?.id)

    return (
        <div className='shadow py-4'>
            <div className='container px-4 2xl:px-20 mx-auto flex justify-between item-center'>
                <img onClick={() => navigate('/')} className='cursor-pointer' src={assets.logo} alt="Logo" />
                
               {
     user && (
    <div className='flex items-center gap-3'>
      {/* 📅 Calendar Button */}
      {/* <button
        onClick={() => setIsCalendarOpen(true)}
        className="text-blue-600 hover:text-blue-800"
        title="Interview Calendar"
      >
        <CalendarDays size={22} />
      </button>

      {/* 🔔 Notification Bell */}
      {/* <a href="/chat-system" target="_blank">
        <Bell />
      </a>

      {/* 📅 Interview Calendar Modal */}
     {/* <InterviewCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />  */}

      <div className="relative inline-block text-left">
        <a
          href="/subscribe"
          target="_blank"
          className="bg-blue-600 text-white p-2.5 px-10 rounded-lg"
        >
          Subscription
        </a>
      </div>
      <Link to="/application">Applied Jobs</Link>
      <p className="max-sm:hidden">
        Hello, {user.firstName} {user.lastName || ''}
      </p>
      <UserButton />
      <button
        onClick={() => setIsCalendarOpen(true)}
        className="text-blue-600 hover:text-blue-800"
        title="Interview Calendar"
      >
        <CalendarDays size={22} />
      </button>
      
      {/* 📅 Interview Calendar Modal */}
      <InterviewCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      {/* 🔔 Notification Bell */}
      <a href="/chat-system" target="_blank">
        <Bell />
      </a>

    </div>
  )
}

            </div>
        </div>
    );
};

export default Navbar;
