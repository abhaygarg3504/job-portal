import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Application from './pages/Application'
import ApplyJob from './pages/ApplyJob'
import RecuriterLogin from './components/RecuriterLogin'
import { AppContext } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplication from './pages/ViewApplicaton'
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { ToastContainer, toast } from 'react-toastify';
import ForgotPassword from './pages/ForgetPassword'
import Subscribe from './pages/Subscribe'
import ChatSystem from './pages/ChatSystem' 
import SavedJobsPanel from './pages/SavedJobsPanel'
import BlogPage from './pages/BlogPage'

const App = () => {
  const { showRecuriterLogin, companyToken, isSavedJobsOpen, setIsSavedJobsOpen } = useContext(AppContext)
 
  return (
    <div>
      { showRecuriterLogin && <RecuriterLogin />}
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/forgotPassword' element={<ForgotPassword/>}/>
        <Route path='/application' element={<Application />} />
        <Route path='/apply-job/:id' element={<ApplyJob />} />
        <Route path='/subscribe' element={<Subscribe/>}/>
         <Route path="/chat-system" element={<ChatSystem />} />
         <Route path="/blogs" element={<BlogPage />} />
          <Route path="/dashboard/chat-system" element={<ChatSystem />} />

        <Route path='/dashboard' element={<Dashboard />}>
          {
            companyToken ? <>
            <Route path='add-job' element={<AddJob />} />
          <Route path='manage-jobs' element={<ManageJobs />} />
          <Route path='view-application' element={<ViewApplication />} />
            <Route path="blogs" element={<BlogPage />} />
              {/* <Route path="/chat-system" element={<ChatSystem />} /> */}
           </> : null
          }
        </Route>
        
      </Routes>
      <SavedJobsPanel 
        isOpen={isSavedJobsOpen}
        onClose={() => setIsSavedJobsOpen(false)}
      />
    </div>
  )
}

export default App
