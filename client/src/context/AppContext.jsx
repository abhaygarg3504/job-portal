import React, {useState, createContext, useEffect } from "react";
import { jobsData } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

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
    const [showRecuriterLogin, setShowRecuriterLogin] = useState(false)
    const [companyToken, setcompanyToken] = useState(null)
    const [companyData, setcompanyData] = useState(null)

    const [userData, setUserData] = useState(null)
    const [userApplications, setUserApplications] = useState([])
    const [totalJobs, settotalJobs] = useState(0)
    const [applyJobs, setapplyJobs] = useState(0)

    // functtion to fecth jobs
    const fetchJobs = async () => {
        try {
            const { data } = await axios.get(`${backendURL}/api/jobs`);
            if (data.success) {
                setJobs(data.jobs);
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
    // function to fetch user Applied aplications data
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
                setUserApplications(data.applications); // ✅ Store applications in state
            } else {
                toast.error(data.message);
                console.error("Error in fetchUserApplicationData:", data.message);
            }
        } catch (err) {
            toast.error("Failed to fetch applications");
            console.error(`Error in fetchUserApplicationData: ${err.message}`);
        }
    };
    

    // function to use fetch user Data
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


    useEffect(()=>{
        fetchJobs()
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
      }
    }, [user])

    useEffect(()=>{
        if(companyToken){
            fetchCompanyData() 
        }

    },[companyToken])

    const value = {
        setSearchFilter,searchFilter,isSearched,setIsSearched, jobs, setJobs,
         showRecuriterLogin, setShowRecuriterLogin, companyToken, setcompanyToken, companyData,
        setcompanyData, backendURL, userData, setUserData, userApplications, setUserApplications,
        fetchUserData, fetchUserApplicationData, totalJobs, settotalJobs, applyJobs, setapplyJobs
    }; 
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
