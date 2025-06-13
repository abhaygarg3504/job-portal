import React, {useRef, useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'


const Hero = () => {

    const {setSearchFilter, setIsSearched} = useContext(AppContext)
    const titleRef = useRef(null);
    const locationRef = useRef(null);
     const [listeningField, setListeningField] = useState(null);

  // Web Speech API setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  const startListening = (field) => {
    if (!recognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    setListeningField(field);
    recognition.start();
  };
  
  if (recognition) {
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (listeningField === "title") {
        titleRef.current.value = transcript;
      } else if (listeningField === "location") {
        locationRef.current.value = transcript;
      }
      setListeningField(null);
    };
    recognition.onerror = () => setListeningField(null);
    recognition.onend = () => setListeningField(null);
  }


    const onSearch = () =>{
        setSearchFilter({
        title: titleRef.current.value,
        location: locationRef.current.value
       })
       setIsSearched(true)
       console.log({
        title: titleRef.current.value,
        location: locationRef.current.value
       })
    }

  return (
    <div className='container 2xl:px-20 mx-auto my-10'>
      <div className='bg-gradient-to-r from-purple-800 to-purple-950 
            text-white py-16 text-center mx-2 rounded-xl'>
      <h2 className='text-2xl md:text-3xl lg:text-4xl font-medium  mb-4'>
        Over 10000+ jobs to apply</h2>
        <p className='mb-8 max-w-xl mx-auto text-sm font-light px-5 '>
            Your Next Big Carrer Starts Right Here - Explore Best Oppotunity and 
            Take the First Step Towards Your Future</p>
        <div className='flex items-center justify-between bg-white rounded text-gray-600 max-w-xl
                 pl-4 mx-4 sm:mx-auto'>
        <div className='flex items-center'>
            <img className='h-4 sm:h-5' src={assets.search_icon} alt="" />
            <input type="text"placeholder='Search for jobs'
             className='max-sm:text-ps p-2 outline-none bg-white rounded outline none w-full'
             ref={titleRef} />
             <button
              type="button"
              onClick={() => startListening("title")}
              className="ml-2"
              title="Speak job title"
            >
              <img src={assets.mic_icon} alt="Mic" className="h-5 w-5" />
            </button>
           </div>
           <div className='flex items-center'>
             <img className='h-4 sm:h-5' src={assets.location_icon} alt="" />
            <input type="text"placeholder='Location'
             className='max-sm:text-ps p-2 rounded outline-none bg-white outline none w-full'
             ref={locationRef} />
              <button
              type="button"
              onClick={() => startListening("location")}
              className="ml-2"
              title="Speak location"
            >
              <img src={assets.mic_icon} alt="Mic" className="h-5 w-5" />
            </button>
        </div>
        <button onClick={onSearch} className='bg-blue-600 px-6 py-2 rounded text-white m-1'>
            Search</button>
        </div>
        </div>

        <div className='border border-gray-300 shadow-md mx-2 mt-5 p-6 rounded-md flex'>
        <div className='flex justify-center gap-10 lg:gap-16 flex-wrap'>
            <p className='font-medium'> Trusted by</p>
                <img className='h-6' src={assets.adobe_logo} alt="" />
                <img className='h-6' src={assets.accenture_logo} alt="" />
                <img className='h-6' src={assets.microsoft_logo} alt="" />
                <img className='h-6' src={assets.amazon_logo} alt="" />
                <img className='h-6' src={assets.walmart_logo} alt="" />
                <img className='h-6' src={assets.samsung_logo} alt="" />
         
        </div>
        </div>

    </div>
  )
}

export default Hero