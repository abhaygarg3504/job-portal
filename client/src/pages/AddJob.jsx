import React, { useContext, useEffect, useRef, useState } from 'react'
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; 
import { JobCategories, JobLocations } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
const AddJob = () => {

    const [title, settitle] = useState('')
    const [location, setlocation] = useState('Banglore')
    const [category, setcategory] = useState('Programming')
    const [level, setlevel] = useState('Beginner Level')
    const [salary, setsalary] = useState(0)
    const editorRef = useRef(null)
    const quillRef = useRef(null)
     const [uploading, setUploading] = useState(false);
    const { backendURL, companyToken } = useContext(AppContext)
   
    const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await axios.post(
        `${backendURL}/api/company/upload-jobs-excel`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${companyToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success(`${response.data.jobsPosted} jobs posted successfully!`);
      } else {
        toast.error('Upload succeeded but jobs were not posted.');
      }
    } catch (err) {
      console.error('Excel upload failed:', err);
      toast.error('Excel upload failed');
    } finally {
      setUploading(false);
    }
  };

    const onSubmitHandler = async(e)=> {
        e.preventDefault()
        try{
            const description = quillRef.current.root.innerHTML
            const { data } = await axios.post(backendURL+'/api/company/post-job', 
                {title, description, location, category, level, salary},
                {headers : {Authorization: `Bearer ${companyToken}`}}
            
            )
            if(data.success){
                toast.success('Job Added Successfully')
                settitle('')
                setsalary(0)
                quillRef.current.root.innerHTML = ''
            } else{
                toast.error(data.message)
            }

        }
        catch(err){
            console.error(`Error in onSubmitHandler add jobs: ${err}`);
            toast(err.message)
        }

    }
    useEffect(()=>{
        if(!quillRef.current && editorRef.current){
          quillRef.current = new Quill(editorRef.current, {
            theme:'snow'
          })
        }
    })
  return (
    <div>
    <form onSubmit={onSubmitHandler} className='conatiner p-4 flex flex-col w-full items-start gap-3 '>
        <div className='w-full'>
            <p className='mb-2'>Job Title</p>
            <input type="text" placeholder='Type Here' 
            onChange={e=>settitle(e.target.value)} value={title} required
            className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded '
            />
        </div>

        <div className='w-full max-w-lg'>
            <p className='my-2'>Job Description</p>
            <div ref={editorRef}>
            </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
            <div><p className='mb-2'>Job Category</p>
            <select className='w-full px-3 py-2 border-2 border-gray-300 rounded ' onChange={e => setcategory(e.target.value)}>
                {JobCategories.map((category, index)=>(
                    <option value={category} key={index}>{category}</option>
                ))}
            </select>
            </div>

            <div><p className='mb-2'>Job Location</p>
            <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setlocation(e.target.value)}>
                {JobLocations.map((location, index)=>(
                    <option value={location} key={index}>{location}</option>
                ))}
            </select>
            </div>

            <div><p className='mb-2'>Job Level</p>
            <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setcategory(e.target.value)}>
               <option value="Beginner Level">Beginner Level</option>
               <option value="Intermediate Level">Intermediate Level</option>
               <option value="Senior Level">Senior Level</option>
            </select>
            </div>

        </div>

        <div>
            <p className='mb-2'>Job Salary</p>
            <input min={0} className='w-full px-3 py-2 border-2 border-gray-300 rounded sm:w-[120px]' type="Number" onChange={e=>setsalary(e.target.value)} placeholder='25000' required />
        </div>
        <button className='w-28 py-3 mt-4 bg-black rounded text-white'>ADD</button>
    </form>
     <div className="mt-10 p-4 bg-gray-50 border border-dashed border-gray-300 rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Upload Excel to Add Jobs</h2>
        <label
          htmlFor="excelUpload"
          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Choose Excel File
        </label>
        <input
          id="excelUpload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleExcelUpload}
          disabled={uploading}
          className="hidden"
        />
        {uploading && (
          <p className="text-gray-600 mt-3">Uploading... Please wait.</p>
        )}
      </div>
     
    </div>
  )
}

export default AddJob
