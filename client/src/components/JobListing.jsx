import React, {useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { assets, JobCategories, JobLocations, jobsData } from '../assets/assets';
import JobCard from './JobCard';

const JobListing = () => {
    const { isSearched, searchFilter, setSearchFilter, jobs } = useContext(AppContext);

    const [showFilter, setShowFilter] = useState(true)
    const [currentpage, setcurrentpage] = useState(1)
    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedLocations, setSelectedLocations] = useState([])

    const [jobsFilter, setJobsFilter] = useState(jobs)

    const handleCategoryChange = (category)=>{
        setSelectedCategories(
            prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev,category] 
        )
    }

    const handleLocationChange = (location)=> {
        setSelectedLocations(
            prev => prev.includes(location) ? prev.filter(c => c !== location) : [...prev,location] 
        )
    }

    useEffect(() => {
        const matchCategory = job => selectedCategories.length === 0 || selectedCategories.includes(job.category);
        const matchLocation = job => selectedLocations.length === 0 || selectedLocations.includes(job.location);
        const matchTitle = job => searchFilter.title === "" || job.title.toLowerCase().includes(searchFilter.title.toLowerCase());
        const matchSearchLocation = job => searchFilter.location === "" || job.location.toLowerCase().includes(searchFilter.location.toLowerCase());

        const newFilteredJobs = jobs.filter(
            job =>
            matchCategory(job) && matchLocation(job) && matchTitle(job) && matchSearchLocation(job)
        ).reverse();

        setJobsFilter(newFilteredJobs);
        setcurrentpage(1);
    }, [jobs, selectedCategories, selectedLocations, searchFilter]);

    return (
        <div className='container 2xl:px-20 mx-auto flex flex-col lg:flex-row py-8 max-lg:space-y-8'>
            <div>
                {/* Search job section */}
            </div>
            <div className='w-full lg:w-1/4 bg-white px-4'>
                {/* Comes from searching */}
                {isSearched && (searchFilter.title !== "" || searchFilter.location !== "") && (
                    <div>
                        <h3 className='font-medium text-lg mb-4'>Current Search</h3>
                       <div className='mb-4 text-gray-600 gap-3'>
                       {searchFilter.title && (
                            <span className='inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded'>
                                {searchFilter.title}
                                <img onClick={e=> setSearchFilter(prev => ({...prev,title:""}))} src={assets.cross_icon} className='cursor-pointer' alt="" />
                            </span>
                        )}
                        {searchFilter.location && (
                            <span  className='inline-flex items-center gap-2.5 bg-red-50 border border-red-200 px-4 py-1.5 rounded' >
                                {searchFilter.location}
                              <img onClick={e=> setSearchFilter(prev => ({...prev,location:""}))}  src={assets.cross_icon} className='cursor-pointer' alt="" />
                            </span>
                        )}
                        </div>
                    </div>
                )}

                <button onClick={e=> setShowFilter(prev => !prev)} className='max-sm:hidden rounded px-6 py-1.5 border border-gray-400 lg:hidden'>
                    {showFilter ? "Close" : "Filter"}
                </button>

                {/* Category Search */}
                <div>
                    <h4 className='font-medium text-lg py-4'>Search by Categories</h4>
                    <ul className="space-y-4 text-gray-600">
    {JobCategories.map((category, index) => (
        <li className="flex gap-3 items-center" key={index}>
            <input className='scale-125' type="checkbox"
            onChange={()=>{handleCategoryChange(category)}}
            checked={selectedCategories.includes(category)}
            />
            {category}
        </li>
              ))}
             </ul>
                </div>

                  {/* Location Search */}
                  <div>
                    <h4 className='font-medium text-lg py-4'>Search by Locations</h4>
                    <ul className="space-y-4 text-gray-600">
    {JobLocations.map((category, index) => (
        <li className="flex gap-3 items-center" key={index}>
            <input className='scale-125' type="checkbox" 
            onChange={()=>{handleLocationChange(location)}}
            checked={selectedLocations.includes(location)}
            />
            {category}
        </li>
              ))}
             </ul>
                </div>
            </div>

            {/* Job Listing */}
            <section className='w-full lg:w-3/4 text-gray-800 max-lg:px-4 '>
            <h3 className='font-medium text-3xl py-2' id='job-list'>Latest Jobs</h3>
            <p className='mb-8'>Get Your Desired Jobs from Top Companies</p>
         <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 '>
            {
                jobsFilter.slice((currentpage-1)*6,currentpage*6).map((job,index)=>(
                    <JobCard key={index} job={job}/>
                ))
            }
         </div>
           {/* pagination page */}
            
           {jobsFilter.length > 0 && (
                <div className='flex items-center justify-center space-x-2 mt-10'>
                    <a href="#job-list">
              <img className='cursor-pointer' onClick={()=> setcurrentpage(Math.max(currentpage-1),1)} src={assets.left_arrow_icon} alt="" />
                    </a>
                    {Array.from({length: Math.ceil(jobsFilter.length/6)}).map((_, index)=>(
                <a href='#job-list'>
                    <button onClick={()=> setcurrentpage(index+1)} className={`w-10 h-10 cursor-pointer flex items-center justify-center border border-gray-500 rounded ${currentpage === index+1 ? 'bg-blue-200 text-blue-500' : 'text-gray-500'}`}>
                        {index+1}
                    </button>
                </a>
                    ))}
                    <a href="#job-list">
                <img className='cursor-pointer' onClick={()=> setcurrentpage(Math.min(currentpage+1, Math.ceil(jobsFilter.length/6)))}  src={assets.right_arrow_icon} alt="" />
                    </a>
                </div>
            )}
            </section>
        </div>
    );
};

export default JobListing;
