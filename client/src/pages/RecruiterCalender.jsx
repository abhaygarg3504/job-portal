import React, { useContext, useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { X, Calendar as CalendarIcon, Users, Building, Clock } from 'lucide-react';

const RecriuterCalender = ({ isOpen, onClose, companyId: propCompanyId }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [interviews, setInterviews] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { backendURL, companyData } = useContext(AppContext);

  const companyId = propCompanyId || companyData?._id;
  const userId = user?.id;
  const isRecruiter = Boolean(propCompanyId || companyData?._id);

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

  const getInterviewsForDate = (date) => {
    const dateStr = new Date(date).toDateString();
    return interviews.filter((interview) => 
      new Date(interview.interviewDate).toDateString() === dateStr
    );
  };

  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dayInterviews = getInterviewsForDate(date);
    if (dayInterviews.length === 0) return null;

    return (
      <div className="mt-1">
        <div className="flex flex-wrap gap-1 justify-center">
          {dayInterviews.length > 2 && (
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          )}
        </div>
        <div className="text-xs text-center mt-1 font-medium text-gray-600">
          {dayInterviews.length}
        </div>
      </div>
    );
  };

  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const dayInterviews = getInterviewsForDate(date);
    let className = 'calendar-tile relative min-h-16 p-2 ';
    
    if (dayInterviews.length > 0) {
      className += 'has-interviews ';
    }
    
    return className;
  };

  const selectedDateInterviews = getInterviewsForDate(selectedDate);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full h-full max-w-7xl max-h-[95vh] rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CalendarIcon size={28} />
            <div>
              <h2 className="text-2xl font-bold">Interview Calendar</h2>
              <p className="text-blue-100 text-sm">
                {isRecruiter ? 'Manage your company interviews' : 'Track your upcoming interviews'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-gray-50 rounded-xl p-6 h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h3>
                
              </div>
              
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={getTileContent}
                tileClassName={getTileClassName}
                className="professional-calendar"
              />
            </div>
          </div>

          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedDateInterviews.length} interview{selectedDateInterviews.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>

            <div className="space-y-4">
              {selectedDateInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-sm">No interviews scheduled for this day</p>
                </div>
              ) : (
                selectedDateInterviews.map((interview, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />
                        <span className="font-medium text-gray-800">
                          {isRecruiter ? interview.userName : interview.companyName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-gray-500" />
                        <span className="text-gray-600 text-sm">{interview.jobTitle}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecriuterCalender;