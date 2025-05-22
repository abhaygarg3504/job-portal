// import React, { useContext, useEffect, useState } from 'react';
// import { useAuth, useUser } from '@clerk/clerk-react';
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import axios from 'axios';
// import { AppContext } from '../context/AppContext';

// const InterviewCalendarModal = ({ isOpen, onClose, companyId: propCompanyId }) => {
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [interviews, setInterviews] = useState([]);
//   const { user } = useUser();
//   const { getToken } = useAuth();
//   const { backendURL, companyData } = useContext(AppContext);

//   // Recruiter will pass companyId as a prop, otherwise fallback to context
//   const companyId = propCompanyId || companyData?._id;
//   const userId = user?.id;

//   const isRecruiter = Boolean(companyId);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     const fetchInterviews = async () => {
//       try {
//         const token = await getToken();
//         const params = isRecruiter ? { companyId } : { userId };

//         // Avoid unnecessary request if IDs are missing
//         if ((isRecruiter && !companyId) || (!isRecruiter && !userId)) {
//           console.warn('Missing companyId or userId');
//           return;
//         }

//         const { data } = await axios.get(`${backendURL}/api/contacts/interviews`, {
//           params,
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (data.success) {
//           setInterviews(data.interviews);
//         } else {
//           console.error('Failed to load interviews:', data.message);
//         }
//       } catch (error) {
//         console.error('Error fetching interviews:', error?.response?.data || error.message);
//       }
//     };

//     fetchInterviews();
//   }, [isRecruiter, userId, companyId, backendURL, getToken]);

//   const getInterviewDetails = (date) => {
//     const dateStr = new Date(date).toDateString();
//     return interviews
//       .filter((interview) => new Date(interview.interviewDate).toDateString() === dateStr)
//       .map((interview, i) => (
//         <div key={i} className="text-sm text-blue-700 font-medium">
//           {isRecruiter
//             ? `${interview.userName} - ${interview.jobTitle}`
//             : `${interview.companyName} - ${interview.jobTitle}`}
//         </div>
//       ));
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white w-[90%] md:w-[70%] h-[80%] p-6 rounded-2xl shadow-lg relative overflow-y-auto">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold"
//         >
//           &times;
//         </button>
//         <h2 className="text-2xl font-semibold mb-4 text-center">Interview Calendar</h2>
//         <Calendar
//           tileContent={({ date, view }) =>
//             view === 'month' ? <div>{getInterviewDetails(date)}</div> : null
//           }
//           className="w-full"
//         />
//       </div>
//     </div>
//   );
// };

// export default InterviewCalendarModal;
import React, { useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

// const InterviewCalendarModal = ({ isOpen, onClose, companyId: propCompanyId }) => {
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [interviews, setInterviews] = useState([]);
//   const { user } = useUser();
//   const { getToken } = useAuth();
//   const { backendURL, companyData } = useContext(AppContext);

//   const companyId = propCompanyId || companyData?._id;
//   const userId = user?.id;
//   const isRecruiter = Boolean(propCompanyId || companyData?._id);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     const fetchInterviews = async () => {
//       try {
//         const token = await getToken();
//         const params = isRecruiter ? { companyId } : { userId };

//         if ((isRecruiter && !companyId) || (!isRecruiter && !userId)) {
//           console.warn('Missing companyId or userId');
//           return;
//         }

//         const { data } = await axios.get(`${backendURL}/api/contacts/interviews`, {
//           params,
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (data.success) {
//           setInterviews(data.interviews);
//         } else {
//           console.error('Failed to load interviews:', data.message);
//         }
//       } catch (error) {
//         console.error('Error fetching interviews:', error?.response?.data || error.message);
//       }
//     };

//     fetchInterviews();
//   }, [isRecruiter, userId, companyId, backendURL, getToken]);

//   const getInterviewDetails = (date) => {
//     const dateStr = new Date(date).toDateString();
//     return interviews
//       .filter((interview) => new Date(interview.interviewDate).toDateString() === dateStr)
//       .map((interview, i) => (
//         <div key={i} className="text-sm text-blue-700 font-medium">
//           {isRecruiter
//             ? `${interview.userName} - ${interview.jobTitle}`
//             : `${interview.companyName} - ${interview.jobTitle}`}
//         </div>
//       ));
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//       <div className="bg-white w-[90%] md:w-[70%] h-[80%] p-6 rounded-2xl shadow-lg relative overflow-y-auto">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold"
//         >
//           &times;
//         </button>
//         <h2 className="text-2xl font-semibold mb-4 text-center">Interview Calendar</h2>
//         <Calendar
//           tileContent={({ date, view }) =>
//             view === 'month' ? <div>{getInterviewDetails(date)}</div> : null
//           }
//           className="w-full"
//         />
//       </div>
//     </div>
//   );
// };


const InterviewCalendarModal = ({ isOpen, onClose, companyId: propCompanyId }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [interviews, setInterviews] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();
  const { backendURL, companyData } = useContext(AppContext);

  const userId = user?.id;

  // TRUE recruiter if explicitly passed via prop
  const isRecruiter = !!propCompanyId;
  const companyId =  companyData?._id;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const token = await getToken();
        const params = isRecruiter ? { companyId } : { userId };

        if ((isRecruiter && !companyId) || (!isRecruiter && !userId)) {
          console.warn('Missing companyId or userId');
          return;
        }

        const { data } = await axios.get(`${backendURL}/api/contacts/interviews`, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.success) {
          setInterviews(data.interviews);
        } else {
          console.error('Failed to load interviews:', data.message);
        }
      } catch (error) {
        console.error('Error fetching interviews:', error?.response?.data || error.message);
      }
    };

    fetchInterviews();
  }, [isRecruiter, userId, companyId, backendURL, getToken]);

  // ✅ Fix: Display correct data depending on role
  const getInterviewDetails = (date) => {
    const dateStr = new Date(date).toDateString();
    return interviews
      .filter((interview) => new Date(interview.interviewDate).toDateString() === dateStr)
      .map((interview, i) => (
        <div key={i} className="text-sm text-blue-700 font-medium">
          {isRecruiter
            ? `${interview.userName} - ${interview.jobTitle}`
            : `${interview.companyName} - ${interview.jobTitle}`}
        </div>
      ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] md:w-[70%] h-[80%] p-6 rounded-2xl shadow-lg relative overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-center">Interview Calendar</h2>
        <Calendar
          tileContent={({ date, view }) =>
            view === 'month' ? <div>{getInterviewDetails(date)}</div> : null
          }
          className="w-full"
        />
      </div>
    </div>
  );
};


export default InterviewCalendarModal;
