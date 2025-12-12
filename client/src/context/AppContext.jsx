import React, {useState, createContext, useEffect } from "react";
import { jobsData } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";
import {io} from "socket.io-client"
import { useLocation } from "react-router-dom";
import { useRef } from "react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendURL = import.meta.env.VITE_BACKEND_URL
    const {user} = useUser()
    const {getToken} = useAuth()
    const [searchFilter, setSearchFilter] = useState({
        title: '',
        location: ''
    });
    const [isSearched, setIsSearched] = useState(false);
    const [jobs, setJobs] = useState([])
    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)
    const [companyToken, setcompanyToken] = useState(null)
    const [companyData, setcompanyData] = useState(null)
    const [userData, setUserData] = useState(null)
    const [userApplications, setUserApplications] = useState([])
    const [totalJobs, settotalJobs] = useState(0)
    const [applyJobs, setapplyJobs] = useState(0)
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const socketRef = useRef(null);
    const location = useLocation();
    const isRecruiter = location.pathname.includes("/dashboard");
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [unseenMessage, setUnseenMessage] = useState({})
    const [savedJobs, setSavedJobs] = useState([]);
     const [jobTitles, setJobTitles] = useState([]);
    const [isSavedJobsOpen, setIsSavedJobsOpen] = useState(false);
  const [isJobRecommend, setIsJobRecommend] = useState(false)
  const [recommendedJobs, setRecommendedJobs] = useState([])
     const [token, setToken] = useState(null);
     const [jobsPagination, setJobsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    hasMore: false
});

    
useEffect(() => {
  const fetchToken = async () => {
    const fetchedToken = await getToken();
    setToken(fetchedToken);
  };
  fetchToken();
}, [getToken]);


    // const fetchJobs = async () => {
    //     try {
    //         const { data } = await axios.get(`${backendURL}/api/jobs`);
    //         if (data.success) {
    //             setJobs(data.jobs);
    //             console.log(data.jobs);
    //         } else {
    //             toast.error(data.message);
    //         }
    //     } catch (err) {
    //         console.error("Error fetching jobs:", err);
    //         toast.error(err.response?.data?.message || err.message);
    //     }
    // };

    const fetchJobs = async (page = 1, limit = 50) => {
    try {
        const { data } = await axios.get(`${backendURL}/api/jobs`, {
            params: { page, limit }
        });
        if (data.success) {
            setJobs(data.jobs);
            setJobsPagination(data.pagination);
            console.log(data.jobs);
        } else {
            toast.error(data.message);
        }
    } catch (err) {
        console.error("Error fetching jobs:", err);
        toast.error(err.response?.data?.message || err.message);
    }
};

    const fetchCompanyData = async () => {
        try {
            if (!companyToken) {
                toast.error("Authorization token is missing");
                return;
            }
    
            const { data } = await axios.get(backendURL + "/api/company/company", {
                headers: {
                    Authorization: `Bearer ${companyToken}`
                }
            });
            if (data.success) {
                setcompanyData(data.company);
                console.log(data);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error(`Error in fetchCompanyData: ${err}`);
            toast.error(err.response?.data?.message || err.message);
        }
    };
    const fetchUserApplicationData = async () => {
        try {
            const token = await getToken();
            const userId = user?.id; 

            if (!userId) {
                toast.error("User ID not found");
                return;
            }
    
            const { data } = await axios.get(
                `${backendURL}/api/users/applications/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            if (data.success) {
                setUserApplications(data.applications); 
                console.log(data.applications)
               const titles = data.applications
    .map(app => app.jobId?.title)
    .filter((title, index, self) => title && self.indexOf(title) === index); 

         setJobTitles(titles);  

            } else {
                toast.error(data.message);
                console.error("Error in fetchUserApplicationData:", data.message);
            }
        } catch (err) {
            toast.error("Failed to fetch applications");
            console.error(`Error in fetchUserApplicationData: ${err.message}`);
        }
    };
    const fetchUserData = async () => {
        try {
            const token = await getToken();
            const userId = user?.id; 
            
            if (!userId) {
                console.error("User ID is missing");
                toast.error("User ID is required");
                return;
            }
    
            const { data } = await axios.get(`${backendURL}/api/users/user/${userId}`, { 
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (data.success) {
                setUserData(data.user);
            } else {
                console.error(`Some error in fetch user data in try: ${data.message}`);
                toast.error(data.message);
            }
        } catch (err) {
            console.error(`Some error in fetch user data in catch: ${err.message}`);
            toast.error(err.message);
        }
    };
    const fetchTotalJobs = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/jobs/count/total`);
      settotalJobs(res.data.totalJobs);
    } catch (err) {
      console.error("Error fetching total jobs:", err);
    }
    };
  
    const fetchApplicationCount = async () => {
  try {
    const userId = user?.id;
    if (!userId) {
      console.warn("User ID missing. Skipping application count fetch.");
      return;
    }

    const token = await getToken();

    const { data } = await axios.get(
      `${backendURL}/api/users/applications/count/${userId}`, 
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (data.success) {
      setapplyJobs(data.totalApplications); // Assuming backend sends totalApplications count
    } else {
      console.error("Failed to fetch application count:", data.message);
    }
  } catch (error) {
    console.error("Error fetching application count:", error);
  }
    };

    const fetchSavedJobs = async () => {
  try {
    const token = await getToken();
    const userId = user?.id;
    if (!userId) return;

    const { data } = await axios.get(`${backendURL}/api/users/saved-jobs/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) {
      setSavedJobs(data.savedJobs);
    }
  } catch (err) {
    console.error("Error fetching saved jobs:", err.message);
  }
    };
    
 const fetchJobRecommendations = async (userId) => {
    try {
      const token = await getToken()
      const res = await fetch(`${backendURL}/api/users/recommendations/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setRecommendedJobs(data.jobs)
    } catch (err) {
      console.error('Failed to load recommendations', err)
    }
  }

const saveJobForUser = async (jobId) => {
  try {
    const token = await getToken();
    const userId = user?.id;
    if (!userId) return;

    const { data } = await axios.post(`${backendURL}/api/users/save-job/${userId}`, { jobId }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) {
      toast.success(data.message);
      fetchSavedJobs(); // refresh
    }
  } catch (err) {
    console.error("Error saving job:", err.message);
  }
};
const unsaveJobForUser = async (jobId) => {
  try {
    const token = await getToken();
    const userId = user?.id;
    if (!userId) return;

    const { data } = await axios.post(`${backendURL}/api/users/unsave-job/${userId}`, { jobId }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.success) {
      toast.success(data.message);
      fetchSavedJobs(); // refresh
    }
  } catch (err) {
    console.error("Error unsaving job:", err.message);
  }
};

    // useEffect(()=>{
    //     fetchJobs()
    //     const storedCompanyToken = localStorage.getItem('companyToken')
    //     if(storedCompanyToken){
    //         setcompanyToken(storedCompanyToken)
    //     }

    // },[])

    useEffect(()=>{
    fetchJobs(1, 50) // Load first 50 jobs initially
    const storedCompanyToken = localStorage.getItem('companyToken')
    if(storedCompanyToken){
        setcompanyToken(storedCompanyToken)
    }
},[])

    useEffect(()=>{
      if(user){
        fetchUserData()
        fetchUserApplicationData()
        fetchTotalJobs()
        fetchApplicationCount()
        fetchSavedJobs()
        fetchJobRecommendations()
      }
    }, [user])

    useEffect(()=>{
        if(companyToken){
        fetchCompanyData() 
        }
    },[companyToken])

    console.log(userData)
    const userId = user?.id;
  const recruiterId = companyData?._id;

  useEffect(() => {
  const id = isRecruiter ? companyData?._id : user?.id;
  const model = isRecruiter ? "Company" : "User";

  // If not logged in or no job titles, do not proceed
  if ((!user && !companyToken) || jobTitles.length === 0 || !id || !model) return;

  // Prevent reconnecting if socket is already active
  if (!socketRef.current) {
    const socketConnection = io(backendURL, {
      query: {
        id,
        model,
        jobTitles: JSON.stringify(jobTitles),
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketConnection.on("connect", () => {
      console.log("Socket connected:", socketConnection.id);
      setSocket(socketConnection); // optional, if you use socket elsewhere
    });

    socketConnection.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socketConnection.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socketRef.current = socketConnection;
  }

  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null); // optional cleanup
    }
  };
}, [user?.id, companyData?._id, companyToken, isRecruiter, backendURL, jobTitles]);

  useEffect(() => {
      const fetchContacts = async () => {
        try {
          const params = isRecruiter ? { recruiterId } : { userId };
          const token = await getToken();
          const { data } = await axios.get(`${backendURL}/api/contacts`, {
            params,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          if (data.success) {
            const sortedContacts = data.contacts.sort((a, b) => {
              const aOnline = isRecruiter ? a.isUserOnline : a.isRecruiterOnline;
              const bOnline = isRecruiter ? b.isUserOnline : b.isRecruiterOnline;
              return bOnline - aOnline;
            });
            setContacts(sortedContacts);
            setUnseenMessage(data.unseenMessage)
            setFilteredContacts(sortedContacts);
          }
        } catch (err) {
          console.error("Failed to fetch contacts", err);
          setContacts([]);
          setFilteredContacts([]);
        }
      };
  
      if ((isRecruiter && recruiterId) || (!isRecruiter && userId)) {
        fetchContacts();
      }
    }, [isRecruiter, userId, recruiterId, backendURL]);
console.log(userId)
console.log(recruiterId)
console.log(companyData)
    const value = {
        setSearchFilter,searchFilter,isSearched,setIsSearched, jobs, setJobs,
         showRecruiterLogin, setShowRecruiterLogin, companyToken, setcompanyToken, companyData,
        setcompanyData, backendURL, userData, setUserData, userApplications, setUserApplications,
        fetchUserData, fetchUserApplicationData, totalJobs, settotalJobs, applyJobs, setapplyJobs,
        isRecruiter, socket, onlineUsers, contacts, filteredContacts,
        setFilteredContacts,setContacts, setOnlineUsers,
        savedJobs, setSavedJobs, fetchSavedJobs, saveJobForUser, unsaveJobForUser,
        setIsSavedJobsOpen, isSavedJobsOpen, token, 
        userId: userData?._id,       
  companyId: companyData?._id ,
  isJobRecommend,
    setIsJobRecommend, fetchJobs,
    recommendedJobs,
    fetchJobRecommendations,
    jobsPagination,
    setJobsPagination
    }; 
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
