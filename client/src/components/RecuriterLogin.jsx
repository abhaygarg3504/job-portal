import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from "axios"
import {useNavigate} from "react-router-dom"
import { toast } from 'react-toastify'

const RecruiterLogin = () => {
  const navigate = useNavigate()
  const [state, setState] = useState('Login') // 'Login', 'Sign Up', 'Forgot Password', 'Verify OTP', 'Reset Password'
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [image, setImage] = useState(false)

  // Forgot password states
  const [otp, setOtp] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [isTextDataSubmitted, setIsTextDataSubmitted] = useState(false)

  const { setShowRecruiterLogin, backendURL, setcompanyToken, setcompanyData } = useContext(AppContext)

  const submitHandler = async(e) => {
    e.preventDefault()
    
    if(state === "Sign Up" && !isTextDataSubmitted){
      return setIsTextDataSubmitted(true)
    }

    try{
      if(state === "Login"){
        const { data } = await axios.post(backendURL+'/api/company/login', {email, password})

        if(data.success){
          setcompanyData(data.company)
          setcompanyToken(data.token)
          localStorage.setItem('companyToken', data.token)  
          setShowRecruiterLogin(false)
          navigate('/dashboard')
        } else{
          toast.error(data.message)
        }

      } else if(state === "Sign Up"){
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
          setShowRecruiterLogin(false)
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

  // Forgot Password Functions
  const sendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setLoading(true)
    try {
      await axios.post(`${backendURL}/api/company/setUpOtp`, { email })
      toast.success("OTP sent to your email")
      setState('Verify OTP')
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP")
      return
    }

    setLoading(true)
    try {
      await axios.post(`${backendURL}/api/company/verifyOtp`, { email, otp })
      toast.success("OTP verified")
      setState('Reset Password')
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP")
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error("Both password fields are required")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      await axios.post(`${backendURL}/api/company/resetPassword`, { email, password })
      toast.success("Password changed successfully")
      // Reset all states
      setState('Login')
      setEmail('')
      setOtp('')
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPasswordClick = () => {
    setState('Forgot Password')
    setPassword('')
    setName('')
    setIsTextDataSubmitted(false)
  }

  const backToLogin = () => {
    setState('Login')
    setEmail('')
    setOtp('')
    setPassword('')
    setConfirmPassword('')
    setIsTextDataSubmitted(false)
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const getTitle = () => {
    switch(state) {
      case 'Login': return 'Recruiter Login'
      case 'Sign Up': return 'Recruiter Sign Up'
      case 'Forgot Password': return 'Forgot Password'
      case 'Verify OTP': return 'Verify OTP'
      case 'Reset Password': return 'Reset Password'
      default: return 'Recruiter Login'
    }
  }

  const getSubtitle = () => {
    switch(state) {
      case 'Login': return 'Welcome back please login and continue'
      case 'Sign Up': return 'Welcome! Please sign up and continue'
      case 'Forgot Password': return 'Enter your email to receive OTP'
      case 'Verify OTP': return 'Enter the OTP sent to your email'
      case 'Reset Password': return 'Enter your new password'
      default: return 'Welcome back please login and continue'
    }
  }

  return (
    <div className='absolute top-0 left-0 z-10 right-0 bottom-0 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
      <form onSubmit={submitHandler} className='relative bg-white p-10 rounded-xl text-slate-500' action="">
        <h2 className='text-center text-2xl text-neutral-700 font-medium'>{getTitle()}</h2>
        <p className='text-sm text-center'>{getSubtitle()}</p>
        
        {/* Sign Up Image Upload */}
        {state === "Sign Up" && isTextDataSubmitted ? (
          <>
            <div className='flex items-center gap-4 my-10'>
              <label htmlFor="image">
                <img className='w-16 rounded-full' src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                <input onChange={e=>setImage(e.target.files[0])} type="file" id='image' hidden />
              </label>
              <p>Upload Company <br />Logo</p>
            </div>
          </>
        ) : 
        /* Regular Login/Sign Up Form */
        (state === 'Login' || state === 'Sign Up') ? (
          <>
            {state !== 'Login' && (
              <div className='px-4 py-2 border flex items-center gap-2 rounded-full mt-5'>
                <img src={assets.person_icon} alt="" />
                <input className='outline-none text-sm' placeholder='Company Name' type="text" required onChange={(e)=>setName(e.target.value)} />
              </div>
            )}
             
            <div className='px-4 py-2 border flex items-center gap-2 rounded-full mt-5'>
              <img src={assets.email_icon} alt="" />
              <input type="email" placeholder='Email' className='outline-none text-sm' required onChange={(e)=>setEmail(e.target.value)} />
            </div>
            
            <div className='px-4 py-2 border flex items-center gap-2 rounded-full mt-5'>
              <img src={assets.lock_icon} alt="" />
              <input className='outline-none text-sm' type="password" placeholder='Password' required onChange={(e)=>setPassword(e.target.value)} />
            </div>
          </>
        ) : 
        /* Forgot Password Form */
        state === 'Forgot Password' ? (
          <div className='px-4 py-2 border flex items-center gap-2 rounded-full mt-5'>
            <img src={assets.email_icon} alt="" />
            <input 
              type="email" 
              placeholder='Enter your email' 
              className='outline-none text-sm' 
              value={email}
              required 
              onChange={(e)=>setEmail(e.target.value)} 
            />
          </div>
        ) : 
        /* Verify OTP Form */
        state === 'Verify OTP' ? (
          <div className='px-4 py-2 border flex items-center gap-2 rounded-full mt-5'>
            <img src={assets.lock_icon} alt="" />
            <input 
              type="text" 
              placeholder='Enter 6-digit OTP' 
              className='outline-none text-sm' 
              value={otp}
              required 
              onChange={(e)=>setOtp(e.target.value)} 
            />
          </div>
        ) : 
        /* Reset Password Form */
        state === 'Reset Password' ? (
          <>
            <div className='px-4 py-2 border flex items-center gap-2 rounded-full mt-5'>
              <img src={assets.lock_icon} alt="" />
              <input 
                type="password" 
                placeholder='New Password' 
                className='outline-none text-sm' 
                value={password}
                required 
                onChange={(e)=>setPassword(e.target.value)} 
              />
            </div>
            <div className='px-4 py-2 border flex items-center gap-2 rounded-full mt-5'>
              <img src={assets.lock_icon} alt="" />
              <input 
                type="password" 
                placeholder='Confirm Password' 
                className='outline-none text-sm' 
                value={confirmPassword}
                required 
                onChange={(e)=>setConfirmPassword(e.target.value)} 
              />
            </div>
          </>
        ) : null}

        {/* Forgot Password Link */}
        {state === "Login" && (
          <p className='text-sm text-blue-600 mt-4 cursor-pointer my-4' onClick={handleForgotPasswordClick}>
            Forgot Password?
          </p>
        )}

        {/* Submit Button */}
        <button 
          type={state === 'Forgot Password' ? 'button' : 'submit'} 
          onClick={state === 'Forgot Password' ? sendOtp : state === 'Verify OTP' ? verifyOtp : state === 'Reset Password' ? resetPassword : undefined}
          disabled={loading}
          className='bg-blue-600 rounded-full w-full text-white py-2 mt-4 disabled:opacity-50'
        >
          {loading ? 'Processing...' : 
           state === 'Login' ? 'Login' : 
           state === 'Sign Up' ? (isTextDataSubmitted ? 'Create Account' : 'Next') :
           state === 'Forgot Password' ? 'Send OTP' :
           state === 'Verify OTP' ? 'Verify OTP' :
           state === 'Reset Password' ? 'Reset Password' : 'Submit'}
        </button>

        {/* Toggle between Login/Sign Up */}
        {(state === 'Login' || state === 'Sign Up') && (
          state === 'Login' ?
          <p className='text-center mt-5'>Don't have any account? <span className='text-blue-600 cursor-pointer' onClick={()=> setState("Sign Up")}>Sign Up</span></p> : 
          <p className='text-center mt-5'>Already have an Account? <span className='text-blue-600 cursor-pointer' onClick={()=> setState("Login")}>Login</span></p>
        )}

        {/* Back to Login for Forgot Password Flow */}
        {(state === 'Forgot Password' || state === 'Verify OTP' || state === 'Reset Password') && (
          <p className='text-center mt-5'>
            <span className='text-blue-600 cursor-pointer' onClick={backToLogin}>Back to Login</span>
          </p>
        )}

        <img onClick={e => setShowRecruiterLogin(false)} src={assets.cross_icon} className='absolute top-5 right-5 cursor-pointer' alt="" />
      </form>
    </div>
  )
}

export default RecruiterLogin
