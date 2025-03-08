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
    
            // console.log("Company Token:", companyToken);
    
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

    // function to use fetch user Data
    const fetchUserData = async () => {
        try {
            const token = await getToken();
            const userId = user?.id; // ✅ Get user ID from Clerk
    
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
        fetchUserData
    }; 
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
