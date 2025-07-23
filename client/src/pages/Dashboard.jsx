import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Bell, CalendarDays, MessageCircle } from 'lucide-react';
import RecriuterCalender from './RecruiterCalender';
import Footer from '../components/Footer';
import CompanyNavbar from './CompanyNavbar';

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
            <NavLink to='/dashboard/chat-system' className={({ isActive }) =>
              `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                isActive ? 'bg-blue-100 border-r-4 border-blue-500' : ''
              }`
            }>
              <MessageCircle className='cursor-pointer' />
              <p className='max-sm:hidden'>Chat System</p>
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
