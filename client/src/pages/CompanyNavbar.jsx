import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { CalendarDays } from 'lucide-react';
import RecriuterCalender from './RecruiterCalender';

function CompanyNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyData, setcompanyToken, setcompanyData } = useContext(AppContext);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Check if we're on dashboard chat-system page
  const isDashboardChatSystem = location.pathname === '/dashboard/chat-system';

  const logout = () => {
    setcompanyToken(null);
    localStorage.removeItem('companyToken');
    setcompanyData(null);
    navigate('/');
  };

  return (
    <>
      {/* Navbar */}
      <div className='shadow py-4'>
        <div className='px-5 flex justify-between items-center'>
          <img
            onClick={() => navigate('/')}
            className='max-sm:w-32 cursor-pointer'
            src={assets.logo}
            alt='Logo'
          />

          {/* Dashboard Navigation - Only show on dashboard/chat-system */}
          {isDashboardChatSystem && (
            <div className='hidden md:flex items-center gap-2'>
              <NavLink 
                to={`/dashboard/profile/${companyData?._id}`} 
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 gap-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                  }`
                }
              >
                <img src={assets.profile_icon} className='h-5 w-5' alt='' />
                <span className='text-sm font-medium'>Profile</span>
              </NavLink>

              <NavLink 
                to='/dashboard/add-job' 
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 gap-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                  }`
                }
              >
                <img src={assets.add_icon} className='h-5 w-5' alt='' />
                <span className='text-sm font-medium'>Add Job</span>
              </NavLink>

              <NavLink 
                to='/dashboard/manage-jobs' 
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 gap-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                  }`
                }
              >
                <img src={assets.home_icon} className='h-5 w-5' alt='' />
                <span className='text-sm font-medium'>Manage Jobs</span>
              </NavLink>

              <NavLink 
                to='/dashboard/view-application' 
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 gap-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                  }`
                }
              >
                <img src={assets.person_tick_icon} className='h-5 w-5' alt='' />
                <span className='text-sm font-medium'>Applications</span>
              </NavLink>

              <NavLink 
                to='/dashboard/blogs' 
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 gap-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
                  }`
                }
              >
                <img src={assets.blog_icon} className='w-5 h-5' alt='' />
                <span className='text-sm font-medium'>Blogs</span>
              </NavLink>
            </div>
          )}

          {/* Mobile Dashboard Navigation Dropdown */}
          {isDashboardChatSystem && (
            <div className='md:hidden relative group'>
              <button className='flex items-center px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'>
                <span className='text-sm font-medium'>Dashboard</span>
                <svg className='w-4 h-4 ml-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>
              
              <div className='absolute hidden group-hover:block right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20'>
                <div className='py-2'>
                  <NavLink 
                    to={`/dashboard/profile/${companyData?._id}`}
                    className='flex items-center px-4 py-2 gap-2 hover:bg-gray-100 text-gray-700'
                  >
                    <img src={assets.profile_icon} className='h-5 w-5' alt='' />
                    <span className='text-sm'>Profile</span>
                  </NavLink>
                  
                  <NavLink 
                    to='/dashboard/add-job'
                    className='flex items-center px-4 py-2 gap-2 hover:bg-gray-100 text-gray-700'
                  >
                    <img src={assets.add_icon} className='h-5 w-5' alt='' />
                    <span className='text-sm'>Add Job</span>
                  </NavLink>
                  
                  <NavLink 
                    to='/dashboard/manage-jobs'
                    className='flex items-center px-4 py-2 gap-2 hover:bg-gray-100 text-gray-700'
                  >
                    <img src={assets.home_icon} className='h-5 w-5' alt='' />
                    <span className='text-sm'>Manage Jobs</span>
                  </NavLink>
                  
                  <NavLink 
                    to='/dashboard/view-application'
                    className='flex items-center px-4 py-2 gap-2 hover:bg-gray-100 text-gray-700'
                  >
                    <img src={assets.person_tick_icon} className='h-5 w-5' alt='' />
                    <span className='text-sm'>Applications</span>
                  </NavLink>
                  
                  <NavLink 
                    to='/dashboard/blogs'
                    className='flex items-center px-4 py-2 gap-2 hover:bg-gray-100 text-gray-700'
                  >
                    <img src={assets.blog_icon} className='w-5 h-5' alt='' />
                    <span className='text-sm'>Blogs</span>
                  </NavLink>
                </div>
              </div>
            </div>
          )}

          {companyData && (
            <div className='flex items-center gap-4'>
              {/* Calendar icon */}
              <button className="text-blue-600 hover:text-blue-800" type='button'>
                <CalendarDays
                  className='cursor-pointer'
                  onClick={() => {
                    if (companyData?._id) {
                      setIsCalendarOpen(true);
                    }
                  }}
                />
              </button>
              
              <p className='max-sm:hidden'>Welcome, {companyData.name}</p>

              <div className='relative group'>
                <img className='w-8 border rounded-full' src={companyData.image} alt='Profile' />
                <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12'>
                  <ul className='list-none m-0 p-2 bg-white rounded-md border text-sm'>
                    <li onClick={logout} className='py-1 px-2 cursor-pointer pr-10'>
                      Logout
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Modal */}
      {companyData && (
        <RecriuterCalender
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          recruiterId={companyData._id} 
        />
      )}
    </>
  );
}

export default CompanyNavbar;
