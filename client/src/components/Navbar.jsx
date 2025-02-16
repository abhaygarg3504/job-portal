import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import {useClerk, UserButton, useUser} from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar = () => {

    const {openSignIn} = useClerk()
    const {user} = useUser()
    const navigate = useNavigate()
    const { setShowRecuriterLogin } = useContext(AppContext)

  return (
    <div className='shadow py-4'>
      <div className='container px-4 2xl:px-20 mx-auto flex justify-between item-center'>
       
      <img onClick={()=>navigate('/')} className='cursor-pointer' src={assets.logo} alt="" />
      {
        user ? <div className='flex items-center gap-3'>
            <Link to='/application'>Applied Jobs</Link>
            <p></p>
            <p className='max-sm:hidden'>Hello, {user.firstName+" " + (user.lastName == null ? "" : user.lastName)}</p>
            <UserButton/>
        </div> 
        : 
        <div className='flex gap-4'>
        <button onClick={e=>setShowRecuriterLogin(true)} className='text-gray-600'>Recruiter Login</button>
        <button onClick={e=>{
           openSignIn()
        }} className='bg-blue-600 text-white px-6 sm:px-8 rounded-full'>Login</button>
         </div>
      }
      </div>
    </div>
    
  )
}

export default Navbar
