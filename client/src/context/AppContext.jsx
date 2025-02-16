import React, {useState, createContext, useEffect } from "react";
import { jobsData } from "../assets/assets";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    const [searchFilter, setSearchFilter] = useState({
        title: '',
        location: ''
    });

    const [isSearched, setIsSearched] = useState(false);
    const [jobs, setJobs] = useState([])
    const [showRecuriterLogin, setShowRecuriterLogin] = useState(false)

    const fetchJobs = () => {
        setJobs(jobsData)
    }

    useEffect(()=>{
        fetchJobs()
    },[])

    const value = {
        setSearchFilter,searchFilter,isSearched,setIsSearched, jobs, setJobs, showRecuriterLogin, setShowRecuriterLogin
    }; 
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
