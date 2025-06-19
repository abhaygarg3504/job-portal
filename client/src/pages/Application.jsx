import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { assets, jobsApplied } from '../assets/assets';
import moment from 'moment';
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import UserAnalytics from './UserAnalytics';
import { Switch, FormControlLabel } from "@mui/material";

const Application = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
 
  const { backendURL, totalJobs, applyJobs, userData, userApplications, 
    fetchUserData,fetchUserApplicationData, userId,isJobRecommand,setIsJobRecommend} = useContext(AppContext);

     const quillExperienceRef = useRef(null);
const quillAchievementsRef = useRef(null);

const [skills, setSkills] = useState(userData?.skills || []);
const [education, setEducation] = useState(userData?.education || []);
const [experience, setExperience] = useState(userData?.experience?.join('\n') || '');
const [achievements, setAchievements] = useState(userData?.achievements?.join('\n') || '');
const [enabled, setEnabled] = useState(userData?.showApplications ?? true);
 const update = async (val) => {
    const token = await getToken();
    await axios.put(
      `${backendURL}/api/users/settings/applications-visibility/${userId}`,
      { enabled: val },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEnabled(val);
    fetchUserData();  // refresh userData
  };

  useEffect(()=>{
   update()
  },[backendURL, userId])

 useEffect(() => {
    if (userData) {
      setSkills(userData.skills || []);
      setEducation(userData.education || []);
      setExperience((userData.experience || []).join('\n'));
      setAchievements((userData.achievements || []).join('\n'));
    }
  }, [userData]);

   useEffect(() => {
  if (isEdit) {
    // Ensure DOM elements exist
    const experienceElem = document.getElementById("experience-editor");
    const achievementsElem = document.getElementById("achievements-editor");

    if (experienceElem && !quillExperienceRef.current) {
      quillExperienceRef.current = new Quill(experienceElem, { theme: "snow" });
      quillExperienceRef.current.root.innerHTML = experience;
    }

    if (achievementsElem && !quillAchievementsRef.current) {
      quillAchievementsRef.current = new Quill(achievementsElem, { theme: "snow" });
      quillAchievementsRef.current.root.innerHTML = achievements;
    }
  }
}, [isEdit]);  // Run only when isEdit becomes true


const updateResume = async () => {
  try {
    if (!resume) {
      toast.error("Please select a resume file");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    const token = await getToken();
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    const { data } = await axios.post(
      `${backendURL}/api/users/update-resume/${userId}`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.success) {
      await fetchUserData(); 
       toast.success(data.message);
    } 
     else {
        toast.error("Resume upload failed. Please try again.");
      }
  } catch (err) {
    console.error("Error in update-resume:", err);
    toast.error(err.message);
  } finally {
    setIsEdit(false);
    setResume(null);
  }
};
 const handleSaveProfile = async () => {
    const token = await getToken();
    const experienceHtml = quillExperienceRef.current?.root.innerHTML || '';
    const achievementsHtml = quillAchievementsRef.current?.root.innerHTML || '';

    try {
      await axios.put(`${backendURL}/api/users/update/${userId}`, {
        skills,
        education,
        experience: experienceHtml.split('<br>'),
        achievements: achievementsHtml.split('<br>')
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Profile updated successfully!");
      fetchUserData();
      setIsEdit(false);
    } catch (err) {
      toast.error("Failed to update profile");
      console.error(err);
    }
  };

useEffect(() => {
    const fetchActivityGraph = async () => {
      try {
        const { data } = await axios.get(
          `${backendURL}/api/users/activity-graph/${userId}`
        );
        if (data.success && data.graph) {
          setActivityData(
            Object.entries(data.graph).map(([date, count]) => ({ date, count }))
          );
        }
      } catch (err) {
        console.error("Error fetching activity graph:", err);
      }
    };

    fetchActivityGraph();
  }, [backendURL, userId]);

  const availableYears = Array.from(
    new Set(activityData.map(item => moment(item.date).year()))
  )
    .sort((a, b) => b - a);

  const valuesForYear = activityData
    .filter(item => moment(item.date).year() === selectedYear)
    .map(item => ({ date: item.date, count: item.count }));


const openResume = () => {
  if (!userData.resume) {
    toast.error("No resume found");
    return;
  }
  // This will open the PDF in a new tab and the browser’s built‑in viewer will kick in
  window.open(userData.resume, "_blank");
};
const handleDownloadExcel = async () => {
  const token = await getToken();
  const response = await fetch(`${backendURL}/api/users/applications/excel/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "applications.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

  useEffect(()=>{
   if(user){
    fetchUserApplicationData()
    // fetchActivityGraph()
   }
  },[user])

 const handleParseResume = async () => {
  try {
    if (!userData.resume) {
      toast.error("No resume uploaded. Please upload one first.");
      return;
    }

    const token = await getToken();
    const { data } = await axios.post(
      `${backendURL}/api/users/parse-resume/${userId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.success) {
      const { skills, education, experience, achievements } = data.parsed;

      // Set state
      setSkills(skills || []);
      setEducation(education || []);
      setExperience((experience || []).join('\n'));
      setAchievements((achievements || []).join('\n'));

      // Set HTML in Quill editors
      if (quillExperienceRef.current)
        quillExperienceRef.current.root.innerHTML = (experience || []).join('<br>');

      if (quillAchievementsRef.current)
        quillAchievementsRef.current.root.innerHTML = (achievements || []).join('<br>');

      toast.success('Resume parsed and profile auto-filled!');
    } else {
      toast.error('Parsing failed');
    }
  } catch (err) {
    console.error(err);
    toast.error('Error occurred while parsing resume');
  }
};

  const percent = () => {
    const fields = [skills, education, experience.trim(), achievements.trim()];
    const filled = fields.filter(f => Array.isArray(f) ? f.length > 0 : f).length;
    return Math.round((filled / 4) * 100);
  };


  return (
    <>
      <Navbar />
      <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
  <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
    
    {/* Profile Image */}
    <div className="relative self-center md:self-start">
      <img
        src={userData?.image}
        alt="Profile"
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-gray-300"
      />
      {userData?.isPro && (
        <span className="absolute top-0 right-0 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full shadow-md font-semibold">
          PRO
        </span>
      )}
    </div>

    {/* User Info */}
    <div className="flex-1 w-full">
      <h2 className="text-xl sm:text-2xl font-bold">{userData?.name}</h2>
      <p className="text-gray-600 text-sm sm:text-base">{userData?.email}</p>
      <p className="text-gray-600 text-sm sm:text-base">Slug For Public Profile: {userData?.slug}</p>
      <button
        onClick={() => setIsEdit(!isEdit)}
        className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
      >
        {isEdit ? 'Cancel' : 'Edit Profile'}
      </button>

      {/* Application Progress */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-20 h-20 mx-auto sm:mx-0">
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-blue-500"
              strokeWidth="4"
              strokeDasharray={`${(applyJobs / totalJobs) * 100}, 100`}
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 
                 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium">{applyJobs}/{totalJobs}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 text-center sm:text-left">Jobs Applied</p>
      </div>
      <div>
         <FormControlLabel
      control={
        <Switch
          checked={enabled}
          onChange={e => update(e.target.checked)}
          color="primary"
        />
      }
      label="Show my applications on public profile"
    />
      </div>

      {/* Profile Completion */}
      <div className="mt-4">
        <p className="text-sm sm:text-base">Profile Completion: {percent()}%</p>
        <div className="w-full bg-gray-200 h-2 rounded mt-1">
          <div
            className="h-2 bg-green-500 rounded"
            style={{ width: `${percent()}%` }}
          />
        </div>
      </div>

      {/* Edit Mode */}
      {isEdit ? (
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Skills</label>
            <input
              className="w-full border p-2 mt-1 text-sm rounded"
              value={skills.join(', ')}
              onChange={e => setSkills(e.target.value.split(',').map(s => s.trim()))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Education</label>
            <textarea
              className="w-full border p-2 mt-1 text-sm rounded"
              rows={3}
              value={education.join('\n')}
              onChange={e => setEducation(e.target.value.split('\n'))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Experience</label>
            <div id="experience-editor" className="h-40 bg-white border rounded mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Achievements</label>
            <div id="achievements-editor" className="h-40 bg-white border rounded mt-1" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSaveProfile}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <h4 className="font-semibold">Skills</h4>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {skills.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Education</h4>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {education.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Experience</h4>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {experience.split('\n').map((ex, i) => <li key={i}>{ex}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Achievements</h4>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {achievements.split('\n').map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  </div>
</div>

        
        <h2 className='text-xl font-semibold'>Your Resume</h2>

        <div className='flex gap-2 mb-6 mt-3'>
          {isEdit || (userData && !userData.resume) ? (
            <>
              <label className='flex items-center' htmlFor="resumeUpload">
                <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2'>
                  {resume ? resume.name : "Select Resume"}
                </p>
                <input
                  id='resumeUpload'
                  onChange={e => setResume(e.target.files[0])}
                  type="file"
                  hidden
                  accept='application/pdf'
                />
                <img src={assets.profile_upload_icon} alt="Upload Icon" />
              </label>
              <button
                onClick={updateResume}
                className='bg-green-100 border border-green-400 rounded-lg px-4 py-2'
              >
                Save
              </button>
            </>
          ) : (
            <div className='flex gap-2'>
           <button onClick={openResume}>Resume</button>
              <button
                onClick={() => setIsEdit(true)}
                className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2'
              >
                Edit
              </button>
            </div>
          )}
                 {/* only when not editing and a resume URL exists */}
{!isEdit && userData?.resume && (
  <button
    onClick={handleParseResume}
    className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
  >
    Parse Resume
  </button>
)}

 <button
      onClick={() => setIsJobRecommend(prev => !prev)}
      className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded cursor-pointer hover:bg-blue-700"
    >
      Get Job Recommended
    </button>
        </div>

 
   <div className='flex justify-between mr-10'>
        <h2 className="text-xl font-semibold my-6">Application Activity</h2>
        <div className="mb-4">
          <label htmlFor="year-select" className="font-medium mr-2">Select Year:</label>
          <select
            id="year-select"
            className="border px-3 py-1 rounded"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        <CalendarHeatmap
          startDate={new Date(`${selectedYear}-01-01`)}
          endDate={new Date(`${selectedYear}-12-31`)}
          values={valuesForYear}
          classForValue={value => {
            if (!value || value.count === 0) return 'color-empty';
            return `color-github-${Math.min(value.count, 4)}`;
          }}
          tooltipDataAttrs={value => ({
            'data-tooltip-id': 'heatmap-tooltip',
            'data-tooltip-html': value.date
              ? `${value.date}<br/>${value.count} application(s)`
              : 'No data',
          })}
          showWeekdayLabels
        />
        <Tooltip id="heatmap-tooltip" />
      </div>

<button onClick={handleDownloadExcel} className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded
                        cursor-pointer hover:bg-blue-700">
  Download CSV(Applications)
</button>

        <h2 className='text-xl font-semibold mb-4'>Jobs Applied</h2>

        <table className='min-w-full bg-white border rounded-lg'>
          <thead>
            <tr>
              <th className='py-3 px-4 border-b text-left'>Company</th>
              <th className='py-3 px-4 border-b text-left'>Job Title</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Location</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Date</th>
              <th className='py-3 px-4 border-b text-left'>Status</th>
              <th className='py-3 px-4 border-b text-left'>Interview Date</th>
            </tr>
          </thead>
          <tbody>
            {userApplications.reverse().map((job, index) => (
              <tr key={index}>
                <td className='py-2 px-2 flex items-center gap-2 border-b'>
  {job.companyId ? (
    <>
      <img className='w-8 h-8' src={job.companyId.image} alt={job.companyId.name} />
      {job.companyId.name}
    </>
  ) : (
    <span className="text-sm text-gray-400 italic">Unknown Company</span>
  )}
</td>

               <td className='py-2 px-4 border-b'>
  {job.jobId?.title || <span className="text-gray-400 italic">N/A</span>}
</td>
<td className='py-2 px-4 border-b max-sm:hidden'>
  {job.jobId?.location || <span className="text-gray-400 italic">N/A</span>}
</td>

                <td className='py-2 px-4 border-b max-sm:hidden'>{moment(job.date).format('ll')}</td>
                <td className='py-2 px-4 border-b'>
                  <span className={`${job.status === 'Accepted' ? 'bg-green-200' : job.status === 'Rejected' ? 'bg-red-200' : 'bg-blue-200'} px-4 py-1.5 rounded`}>
                    {job.status}
                  </span>
                  
                </td>
              <td className='py-2 px-4 border-b'>
  {job.status === 'Accepted' && job.interviewDate ? (
    <span className="text-sm text-gray-600">
      {moment(job.interviewDate).format('ll')}
    </span>
  ) : (
    <span className="text-sm text-gray-400 italic">N/A</span>
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>

        <UserAnalytics/>
      </div>
      <Footer />
    </>
  );
};

export default Application;