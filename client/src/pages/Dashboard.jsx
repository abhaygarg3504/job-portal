import React, { useContext, useEffect } from 'react'
import { assets } from '../assets/assets'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';

function Dashboard() {
    const navigate = useNavigate();

    const { companyData, setcompanyToken,setcompanyData } = useContext(AppContext);

    // Function to logout a comapny
    const logout = () => {
        setcompanyToken(null)
        localStorage.removeItem('companyToken')
        setcompanyData(null)
        navigate('/')
    }

    useEffect(()=>{
      if(companyData){
        navigate('/dashboard/manage-jobs')
      }
    }, [companyData])

    return (
        <div className='min-h-screen'>
        
            {/* Navbar for recruiter login */}
            <div className='shadow py-4'>
                <div className='px-5 flex justify-between items-center'>
                    <img onClick={() => navigate('/')} className='max-sm:w-32 cursor-pointer' src={assets.logo} alt="" />
                    {
                        companyData && (
                            <div className='flex items-center gap-3'>
                        <p className='max-sm:hidden'>Welcome, {companyData.name}</p>
                        <div className='relative group'>
                            <img className='w-8 border rounded-full' src={companyData.image} alt="" />
                            <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12'>
                                <ul className='list-none m-0 p-2 bg-white rounded-md border text-sm'>
                                    <li onClick={ logout} className='py-1 px-2 cursor-pointer pr-10'>Logout</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                        )
                    }
                </div>
            </div>

            {/* Sidebar + Content Container */}
            <div className='flex items-start'>
                
                {/* Sidebar */}
                <div className='inline-block min-h-screen border-r-2'>
                    <ul className='flex flex-col items-start pt-5 text-gray-800 '>
                        <NavLink 
                            className={({ isActive }) => 
                                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive ? 'bg-blue-100 border-r-4 border-blue-500' : ''}`
                            } 
                            to='/dashboard/add-job'>
                            <img src={assets.add_icon} alt="" />
                            <p className='max-sm:hidden'>Add Job</p>
                        </NavLink>
                        <NavLink 
                            className={({ isActive }) => 
                                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive ? 'bg-blue-100 border-r-4 border-blue-500' : ''}`
                            } 
                            to='/dashboard/manage-jobs'>
                            <img src={assets.home_icon} alt="" />
                            <p className='max-sm:hidden'>Manage Jobs</p>
                        </NavLink>
                        <NavLink 
                            className={({ isActive }) => 
                                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${isActive ? 'bg-blue-100 border-r-4 border-blue-500' : ''}`
                            } 
                            to='/dashboard/view-application'>
                            <img src={assets.person_tick_icon} alt="" />
                            <p className='max-sm:hidden'>View Applications</p>
                        </NavLink>
                    </ul>
                </div>

                {/* Main Content Area - Outlet Renders Here */}
                <div >
                    <Outlet />
                </div>

            </div>

        </div>
    );
}

export default Dashboard;
