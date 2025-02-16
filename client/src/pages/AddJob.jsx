import React, { useEffect, useRef, useState } from 'react'
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill styles
import { JobCategories, JobLocations } from '../assets/assets';
const AddJob = () => {

    const [title, settitle] = useState('')
    const [location, setlocation] = useState('Banglore')
    const [category, setcategory] = useState('Programming')
    const [level, setlevel] = useState('Beginner Level')
    const [salary, setsalary] = useState(0)

    const editorRef = useRef(null)
    const quillRef = useRef(null)

    useEffect(()=>{
        // initiate quill only once
        if(!quillRef.current && editorRef.current){
          quillRef.current = new Quill(editorRef.current, {
            theme:'snow'
          })
        }
    })

  return (
    <form className='conatiner p-4 flex flex-col w-full items-start gap-3 '>
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
  )
}

export default AddJob
