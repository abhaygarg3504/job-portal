// import React, { useContext } from 'react'
// import { assets } from '../assets/assets'
// import {useClerk, UserButton, useUser} from '@clerk/clerk-react';
// import { Link, useNavigate } from 'react-router-dom';
// import { AppContext } from '../context/AppContext';

// const Navbar = () => {

//     const {openSignIn} = useClerk()
//     const {user} = useUser()
//     const navigate = useNavigate()
//     const { setShowRecuriterLogin } = useContext(AppContext)

//   return (
//     <div className='shadow py-4'>
//       <div className='container px-4 2xl:px-20 mx-auto flex justify-between item-center'>
       
//       <img onClick={()=>navigate('/')} className='cursor-pointer' src={assets.logo} alt="" />
//       {
//         user ? <div className='flex items-center gap-3'>
//             <Link to='/application'>Applied Jobs</Link>
//             <p></p>
//             <p className='max-sm:hidden'>Hello, {user.firstName+" " + (user.lastName == null ? "" : user.lastName)}</p>
//             <UserButton/>
//         </div> 
//         : 
//         <div className='flex gap-4'>
//         <button onClick={e=>setShowRecuriterLogin(true)} className='text-gray-600'>Recruiter Login</button>
//         <button onClick={e=>{
//            openSignIn()
//         }} className='bg-blue-600 text-white px-6 sm:px-8 rounded-full'>Login</button>
//          </div>
//       }
//       </div>
//     </div>
    
//   )
// }

// export default Navbar

import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
    const { openSignIn } = useClerk();
    const { user, isSignedIn } = useUser(); 
    const navigate = useNavigate();
    const { setShowRecuriterLogin, backendURL } = useContext(AppContext);
    const [isUserStored, setIsUserStored] = useState(false); 
    
    const sendUserDataToBackend = async () => {
        if (!user || isUserStored) return; 

        const userData = {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.primaryEmailAddress?.emailAddress || '', // Handle null case
            image: user.imageUrl || '',
            resume: '', // Optional field
        };

        console.log("🔄 Sending user data to backend...", userData); // Debugging log

        try {
            const response = await fetch(backendURL+ `/api/users/user`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("✅ User stored successfully:", data);
                setIsUserStored(true); // Prevent duplicate API calls
            } else {
                console.error("❌ Error storing user:", data.error);
            }
        } catch (error) {
            console.error("❌ Server error:", error);
        }
    };

    // Call function when user logs in (only once)
    useEffect(() => {
        if (isSignedIn && !isUserStored) {
            sendUserDataToBackend();
        }
    }, [isSignedIn]); // Runs when user logs in

    return (
        <div className='shadow py-4'>
            <div className='container px-4 2xl:px-20 mx-auto flex justify-between item-center'>
                <img onClick={() => navigate('/')} className='cursor-pointer' src={assets.logo} alt="Logo" />
                
                {
                    user ? (
                        <div className='flex items-center gap-3'>
                            <Link to='/application'>Applied Jobs</Link>
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
