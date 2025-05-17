import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from "axios"
import {useNavigate} from "react-router-dom"
import { toast } from 'react-toastify'


const RecuriterLogin = () => {

  const navigate = useNavigate()
  
  const [state, setState] = useState('Login')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [image, setimage] = useState(false)

  const [isTextDataSubmitted, setisTextDataSubmitted] = useState(false)

  const { setShowRecuriterLogin, backendURL, setcompanyToken, setcompanyData } = useContext(AppContext)

  const submitHandler = async(e)=>{
    e.preventDefault()
    if(state === "Sign Up" && !isTextDataSubmitted){
     return setisTextDataSubmitted(true)
    }

    try{

      if(state === "Login"){
        const { data } = await axios.post(backendURL+'/api/company/login', {email, password})

        if(data.success){
          setcompanyData(data.company)
          setcompanyToken(data.token)
          localStorage.setItem('companyToken', data.token)  
          setShowRecuriterLogin(false)
          navigate('/dashboard')
        } else{
          toast.error(data.message)
        }

      } else{

        const formData = new FormData()
        formData.append('name', name)
        formData.append('email', email)
        formData.append('password', password)
        formData.append('image', image)

        const {data} = await axios.post(backendURL+'/api/company/register', formData)
        if(data.success){
          setcompanyData(data.company)
          setcompanyToken(data.token)
          localStorage.setItem('companyToken', data.token)  
          setShowRecuriterLogin(false)
          navigate('/dashboard')
        } else{
          toast.error(data.message)
        }
      }

    }
    catch(err){
      console.log(`error in submitHandler : ${err}`)
      toast.error(err.message)
    }

  }

  useEffect(()=>{
    document.body.style.overflow = 'hidden'

    return ()=>{
      document.body.style.overflow = 'unset'
    }

  })

  return (
    <div className='absolute top-0 left-0 z-10 right-0 bottom-0 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
      <form onSubmit={submitHandler} className='relative bg-white p-10 rounded-xl text-slate-500 ' action="">
        <h2 className='text-center text-2xl text-neutral-700 font-medium '>Recruiter {state}</h2>
        <p className='text-sm'>Welcome back please Sign Up and Continue</p>
        {state === "Sign Up" && isTextDataSubmitted 
        ? <>
        
        <div className='flex items-center gap-4 my-10'>
          <label htmlFor="image">
            <img className='w-16 rounded-full' src={ image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
            <input onChange={e=>setimage(e.target.files[0])} type="file" id='image' hidden />
          </label>
          <p>Upload Company <br />Logo</p>
        </div>

        </> 
        :
        <>
        {state !== 'Login' && (
        <div className='px-4 py-2 border flex items-center gap-2 rounded-full mt-5 '>
        <img src={assets.person_icon} alt="" />
        <input className='outline-none text-sm' placeholder='Company Name' type="text" required onChange={(e)=>setName(e.target.value)} />
      </div>
        )}
         
         <div className='px-4 py-2 border flex items-center gap-2 rounded-full mt-5 '>
           <img src={assets.email_icon} alt="" />
           <input type="email" placeholder='Email' className='outline-none text-sm' required onChange={(e)=>setEmail(e.target.value)} />
         </div>
         <div className='px-4 py-2 border flex items-center gap-2 rounded-full mt-5 '>
           <img src={assets.lock_icon} alt="" />
           <input className='outline-none text-sm' type="password" placeholder='Password' required onChange={(e)=>setPassword(e.target.value)} />
         </div>
         </>
        }

        {state === "Login" && (
   <a className='text-sm text-blue-600 mt-4 cursor-pointer my-4' 
   href="/forgotPassword" target='_blank' > 
    Forgot Password?</a>
        )}

        <button type='submit' className='bg-blue-600 rounded-full w-full text-white py-2 mt-4 \'>
          {state === 'Login' ? 'Login' : isTextDataSubmitted? 'Create Account' : 'Next'}
        </button>

       {
        state === 'Login' ?
        <p className='text-center mt-5'>Don't have any account? <span className='text-blue-600 cursor-pointer' onClick={()=> setState("Sign Up")}>Sign Up</span></p> : 
        <p className='text-center mt-5'>Already have an Account? <span className='text-blue-600 cursor-pointer' onClick={()=> setState("Login")}>Login</span></p>
       }

       <img onClick={e => setShowRecuriterLogin(false)} src={assets.cross_icon} className='absolute top-5 right-5 cursor-pointer' alt="" />

      </form>
    </div>
  )
}

export default RecuriterLogin
