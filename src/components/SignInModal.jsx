'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { data, Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase.Client'
import { log } from 'three'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'

export default function SignInModal({ open, closeModal }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('')
  const [inputErrors, setInputErrors] = useState({})

  const navigate = useNavigate()

  const { signUpNewUser, signInUser , signInGoogle, GoogleLoading } = useAuth();


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const handleSignUp = async (e) => {
    e.preventDefault();

    const tempErrors = {};

    if (!firstName.trim()) {
      tempErrors.firstName = "Ism kiritilmagan!";
    }
    if (!lastName.trim()) {
      tempErrors.lastName = "Familiya kiritilmagan!";
    }
    if (!email.trim()) {
      tempErrors.email = "Email kiritilmagan!";
    }
    if (!password) {
      tempErrors.password = "Parol kiritilmagan!";
    } else if (password.length < 6) {
      tempErrors.password = "Parol kamida 6 ta belgidan iborat bo'lishi kerak!";
    }
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = "Parollar bir-biriga mos kelmadi!";
    }

    if (Object.keys(tempErrors).length > 0) {
      setInputErrors(tempErrors);
      return;
    }
    setInputErrors({});

    setLoading(true);

    try {
      const result = await signUpNewUser({ email, password, firstName, lastName });

      if (result.success) {
        navigate('/')
        toast.success("Siz ro'yhatdan o'tdizngiz, tabriklayman")
        setError('')
      } else if (result.error) {
        console.log(result.error);
        if (result.error.message == 'User already registered') {
          setError("Email ro'yhatdan o'tgan boshqa email kiriting");
        } else {
          setError(`${result.error.message}`)
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault();


    const tempErrors = {};

    if (!email.trim()) {
      tempErrors.email = "Email kiritilmagan!";
    }
    if (!password) {
      tempErrors.password = "Parol kiritilmagan!";
    }

    if (Object.keys(tempErrors).length > 0) {
      setInputErrors(tempErrors);
      return;
    }
    setInputErrors({});
    setLoading(true);

    try {
      const result = await signInUser({ email, password });

      if (result.success) {
        toast.success("Muvofaqiyatli tizimga kirdingiz!");
        navigate('/')
      } else if (result.error) {
        console.log(result.error);
        if (result.error.message == 'Invalid login credentials') {
          setError('Email yoki parol xato kiritilgan !')
        } else {
          setError(`${result.error.message}`)
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  

  return (
    <div>
      <Dialog open={open} onClose={closeModal} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/50 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >

              {isSignUp === false ? (
                <>
                  <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className='flex items-center justify-center gap-3'>
                      <h3 className='text-center text-xl font-bold'>Tizimga kirish</h3>
                    </div>
                    <div className='px-6 mt-5'>
                      <form onSubmit={handleSignIn}>
                        <label htmlFor='email' name="email" className='mt-6 ml-1 inline-block text-[14px] text-gray-300'>Email manzili</label><br />
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email kiriting...' className='mt-1 w-full text-white text-[15px] px-3 py-2 rounded-xl border border-[#bbb6b696] outline-none box-border' />
                        {inputErrors.email && <span className="text-red-500 text-xs block mt-1 ml-1">{inputErrors.email}</span>}
                        <label htmlFor='password' className='mt-3 ml-1 inline-block text-[14px] text-gray-300'>Parolingiz</label><br />
                        <input type={`${showPassword ? 'text' : 'password'}`} id='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Parol kiriting...' className='mt-1 w-full text-white text-[15px] px-3 py-2 rounded-xl border border-[#bbb6b696] outline-none box-border' />
                        {inputErrors.password && <span className="text-red-500 text-xs block mt-1 ml-1">{inputErrors.password}</span>}
                        <button type="button" onClick={togglePasswordVisibility} className='w-fit cursor-pointer text-start text-[13px] pl-1 text-blue-500'>
                          {showPassword ? 'Yashirish' : "Parolni ko'rsatish"}
                        </button>
                        {error && <p className='text-red-500 ml-1 mt-1 text-xs'>{error}</p>}
                        <button type="submit" disabled={loading} className="flex w-full mt-4 rounded-xl items-center justify-center bg-cyan-500! hover:bg-cyan-400! text-black! tracking-[0.2em]! font-bold! py-2 sm:py-2 transition-all! shadow-[0_0_15px_rgba(34,211,238,0.2)]! hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]! text-xs sm:text-sm! disabled:opacity-50">
                          <span className='flex items-center'>{loading ? 'Yuborilmoqda...' : 'Davom etish'}<svg width={30} className='inline-block' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" classname="cl-buttonArrowIcon "><path d="M9.5 8.25 6 6v4.5l3.5-2.25Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg></span>
                        </button>
                        <button onClick={signInGoogle} disabled={GoogleLoading} className={`duration-300 ${GoogleLoading ? 'animate-pulse' : ''} w-full mt-5 py-2 cursor-pointer px-4 border bg-gray-50 border-gray-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-transparent hover:border-gray-300 hover:text-white transition-all duration-300 font-semibold text-gray-700 active:scale-[0.98] disabled:opacity-30`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>Google bilan kirish</button>
                      </form>
                    </div>
                  </div>
                  <div className="justify-center bg-gray-700/25 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6">
                    <p className='text-[13px] text-white'>Akountingiz yo'qmi ? // <a onClick={() => { setIsSignUp(true), setError(''), setEmail(''), setPassword(''), setShowPassword('') }} className='cursor-pointer text-cyan-500 font-bold'>Ro'yhatdan o'tish</a></p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h1 className='text-center text-xl font-bold'>Ro'yhatdan o'tish</h1>
                    <div className='px-6 mt-6'>
                      <form onSubmit={handleSignUp}>
                        <div className='flex flex-col sm:flex-row gap-4'>
                          <div className='flex flex-col flex-1'>
                            <label htmlFor='ism' className='ml-1 inline-block text-[14px] text-gray-300'>Ism</label>
                            <input type="text" name="ism" id="ism" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder='Shaxzod' className='w-full mt-1 text-white text-[15px] px-3 py-2 rounded-xl border border-[#bbb6b696] outline-none' />
                            {inputErrors.firstName && <span className="text-red-500 text-xs block mt-1 ml-1">{inputErrors.firstName}</span>}
                          </div>
                          <div className='flex flex-col flex-1'>
                            <label htmlFor='familiya' className='ml-1 inline-block text-[14px] text-gray-300'>Familiya</label>
                            <input type="text" name="familiya" id="familiya" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder='Ziyodullayev' className='w-full mt-1 text-white text-[15px] px-3 py-2 rounded-xl border border-[#bbb6b696] outline-none' />
                            {inputErrors.lastName && <span className="text-red-500 text-xs block mt-1 ml-1">{inputErrors.lastName}</span>}
                          </div>
                        </div>
                        <label htmlFor='email' className='mt-3 ml-1 inline-block text-[14px] text-gray-300'>Email manzili</label><br />
                        <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Emailingizni kiriting' className='mt-1 w-full text-white text-[15px] px-3 py-2 rounded-xl border border-[#bbb6b696] outline-none' />
                        {inputErrors.email && <span className="text-red-500 text-xs block mt-1 ml-1">{inputErrors.email}</span>}
                        <div className='flex flex-col sm:flex-row gap-4 mt-3'>
                          <div className='flex flex-col flex-1'>
                            <label htmlFor='password-field' className='ml-1 inline-block text-[14px] text-gray-300'>Parol yarating</label>
                            <input type={`${showPassword ? 'text' : 'password'}`} id="password-field" value={password} onChange={(e) => setPassword(e.target.value)} className='w-full mt-1 text-white text-[15px] px-3 py-2 rounded-xl border border-[#bbb6b696] outline-none' />
                            {inputErrors.password && <span className="text-red-500 text-xs block mt-1 ml-1">{inputErrors.password}</span>}
                            <button type="button" onClick={togglePasswordVisibility} className='w-fit cursor-pointer text-start text-[13px] pl-1 text-blue-500'>
                              {showPassword ? 'Yashirish' : "Parolni ko'rsatish"}
                            </button>
                          </div>
                          <div className='flex flex-col flex-1'>
                            <label htmlFor='confirm-password-field' className='ml-1 inline-block text-[14px] text-gray-300'>Parolni tasdiqlang</label>
                            <input type={`${showPassword ? 'text' : 'password'}`} id="confirm-password-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className='w-full mt-1 text-white text-[15px] px-3 py-2 rounded-xl border border-[#bbb6b696] outline-none' />
                            {inputErrors.confirmPassword && <span className="text-red-500 text-xs block mt-1 ml-1">{inputErrors.confirmPassword}</span>}
                          </div>
                        </div>
                        {error && <p className='text-red-500 ml-1 mt-1 text-xs'>{error}</p>}
                        <button type="submit" disabled={loading} className="flex w-full mt-4 rounded-xl items-center justify-center bg-cyan-500! hover:bg-cyan-400! text-black!  font-bold! py-2 sm:py-2 transition-all! shadow-[0_0_15px_rgba(34,211,238,0.2)]! hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]! text-xs sm:text-sm! disabled:opacity-50">
                          <span className='flex items-center'>{loading ? 'Yuborilmoqda...' : 'Ro\'yhatdan o\'tish'}<svg width={30} className='inline-block' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" classname="cl-buttonArrowIcon "><path d="M9.5 8.25 6 6v4.5l3.5-2.25Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg></span>
                        </button>
                        <button onClick={signInGoogle} disabled={GoogleLoading} className={`duration-300 ${GoogleLoading ? 'animate-pulse' : ''} w-full mt-5 py-2 cursor-pointer px-4 border bg-gray-50 border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-transparent hover:border-gray-300 hover:text-white transition-all duration-300 font-semibold text-gray-700 active:scale-[0.98] disabled:opacity-30`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>Google bilan kirish</button>
                      </form>
                    </div>
                  </div>
                  <div className="justify-center bg-gray-700/25 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6">
                    <p className='text-[13px] text-white'>Ro'yhatdan o'tganmisiz ? // <a onClick={() => { setIsSignUp(false), setError(''), setEmail(''), setPassword(''), setConfirmPassword(''), setShowPassword(false) }} className='cursor-pointer text-cyan-500 font-bold'>Kirish</a></p>
                  </div>
                </>
              )}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
