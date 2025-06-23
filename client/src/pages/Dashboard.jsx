import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Bell, CalendarDays, MessageCircle } from 'lucide-react';
import RecriuterCalender from './RecruiterCalender';
import Footer from '../components/Footer';

function Dashboard() {
  const navigate = useNavigate();
  const { companyData, setcompanyToken, setcompanyData } = useContext(AppContext);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const logout = () => {
    setcompanyToken(null);
    localStorage.removeItem('companyToken');
    setcompanyData(null);
    navigate('/');
  };

  useEffect(() => {
    if (companyData) {
      navigate('/dashboard/manage-jobs');
    }
  }, [companyData]);

  return (
    <div className='min-h-screen'>
      {/* Navbar */}
      <div className='shadow py-4'>
        <div className='px-5 flex justify-between items-center'>
          <img
            onClick={() => navigate('/')}
            className='max-sm:w-32 cursor-pointer'
            src={assets.logo}
            alt='Logo'
          />

          {companyData && (
            <div className='flex items-center gap-4'>
              {/* Chat bell icon */}
              <a href='/dashboard/chat-system' target='_blank' rel='noopener noreferrer'>
                <MessageCircle className='cursor-pointer' />
              </a>

              {/* Calendar icon */}
             <button className="text-blue-600 hover:text-blue-800" type='calendar'>
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

      {/* Sidebar + Outlet */}
      <div className='flex items-start'>
        <div className='inline-block min-h-screen border-r-2'>
          <ul className='flex flex-col items-start pt-5 text-gray-800'>
             <NavLink to={`/dashboard/profile/${companyData?._id}`} className={({ isActive }) =>
              `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                isActive ? 'bg-blue-100 border-r-4 border-blue-500' : ''
              }`
            }>
              <img src={assets.profile_icon} className='h-6 w-6' alt='' />
              <p className='max-sm:hidden'>Profile</p>
            </NavLink>
            <NavLink to='/dashboard/add-job' className={({ isActive }) =>
              `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                isActive ? 'bg-blue-100 border-r-4 border-blue-500' : ''
              }`
            }>
              <img src={assets.add_icon} alt='' />
              <p className='max-sm:hidden'>Add Job</p>
            </NavLink>
            <NavLink to='/dashboard/manage-jobs' className={({ isActive }) =>
              `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                isActive ? 'bg-blue-100 border-r-4 border-blue-500' : ''
              }`
            }>
              <img src={assets.home_icon} alt='' />
              <p className='max-sm:hidden'>Manage Jobs</p>
            </NavLink>
            <NavLink to='/dashboard/view-application' className={({ isActive }) =>
              `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                isActive ? 'bg-blue-100 border-r-4 border-blue-500' : ''
              }`
            }>
              <img src={assets.person_tick_icon} alt='' />
              <p className='max-sm:hidden'>View Applications</p>
            </NavLink>
             <NavLink to='/dashboard/blogs' className={({ isActive }) =>
              `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                isActive ? 'bg-blue-100 border-r-4 border-blue-500' : ''
              }`
            }>
              <img src={assets.blog_icon} className='w-6 h-6' alt='' />
              <p className='max-sm:hidden'>Blogs</p>
            </NavLink>
          </ul>
        </div>

        <div >
          <Outlet />
        </div>
      </div>

      {/* Calendar Modal */}
      {companyData  && (
        <RecriuterCalender
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          recruiterId={companyData._id} 
        />
      )}
      <Footer/>
    </div>
  );
}

export default Dashboard;
