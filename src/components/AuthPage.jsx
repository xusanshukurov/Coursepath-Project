import React, { useState } from 'react';
import target from '../assets/authImages/target.png';
import mentor from '../assets/authImages/mentor.png';
import certificate from '../assets/authImages/certificate.png';
import coding from '../assets/authImages/coding.png';
import enter from '../assets/authImages/enter.png';
import learning from '../assets/authImages/learning.png'
import logo from '../assets/authImages/logo.png'
import SignUpModal from './SignInModal';
import SignInModal from './SignInModal';
import VantaBackground from './VantaBackground';

function AuthPage() {
    const [open, setOpen] = useState(false)
    
  return (
    <>
        <VantaBackground/>
        <header className='flex justify-between items-center fixed w-full px-4 sm:px-8 lg:px-20 py-2 sm:py-3 bg-[#160b2c] border-b border-gray-800 z-50'>
            <div>
                <img src={logo} alt="LearnHub" className="w-[120px] sm:w-[150px] lg:w-[180px]"/>
            </div>
            <button onClick={() => setOpen(true)} className='flex gap-1 items-center px-3 py-[6px] text-white font-semibold text-[13px] sm:text-[15px] bg-blue-800 rounded-xl shadow-[0_-0px_20px_-5px_rgba(0,0,0,0.9)] hover:shadow-[0_5px_30px_-5px_rgba(0,0,500,0.9)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-in-out font-sans'>
                <img width={20} src={enter} alt="" />
                Boshlash
            </button>
        </header>
        <div id='bg' className='flex flex-col lg:flex-row justify-center lg:justify-between pt-20 lg:pt-17 items-center min-h-screen px-4 sm:px-8 lg:px-20 pb-8 gap-8 lg:gap-0'>
            <div className="w-full lg:max-w-[50%] text-center lg:text-left">
                <div>
                    <span className='inline-block py-2 px-2.5 text-[12px] sm:text-[13px] text-[#4DA6F3] font-semibold bg-[#142a4b] rounded-2xl border border-[#1D3C6D]'>Kelajak Kasblar Platformasi</span>
                    <h1 className='mt-6 sm:mt-8 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight lg:leading-11'>Yangi ko'nikmalarni o'zingizga<br className="hidden sm:block" /> qulay vaqtda o'rganing</h1>
                    <p className='max-w-[350px] mx-auto lg:mx-0 mt-4 sm:mt-6 text-[14px] sm:text-[15px] text-[#6b8694]'>Eng talabgor dasturlash tillari va freymvorklarni bizning darslarimiz yordamida o'zlashtiring</p>
                    <h2 className='max-w-[600px] mx-auto lg:mx-0 mt-6 sm:mt-8 text-[15px] sm:text-[17px] font-semibold bg-linear-to-r from-[#0d7a75] via-[#093246] to-transparent p-1 pl-4 sm:pl-5 rounded-xl'>Loyihamiz orqali nimalarga erishasiz:</h2>
                    <div className='flex mt-6 sm:mt-10 gap-6 sm:gap-8 justify-center lg:justify-start'>
                        <div className='flex flex-col items-center'>
                            <img src={mentor} alt="" width={49}/>
                            <h3 className='text-[11px] sm:text-[12px] mt-1'>Mentor Ko'magi</h3>
                        </div>
                        <div className='flex flex-col items-center'>
                            <img src={target} alt="" width={50}/>
                            <h3 className='text-[11px] sm:text-[12px] mt-1 text-center'>Dolzarb Texnologiyalar</h3>
                        </div>
                        <div className='flex flex-col items-center'>
                            <img src={certificate} alt="" width={50}/>
                            <h3 className='text-[11px] sm:text-[12px] mt-1'>Sertifikat</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-center lg:justify-end">
                <img src={learning} alt="" className='w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[530px]'/>
            </div>

            {open && <SignInModal open={open} closeModal={() => setOpen(false)}/>}
        </div>
    </>
  )
}

export default AuthPage