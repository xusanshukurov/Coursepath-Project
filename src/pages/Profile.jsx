import React, { useEffect, useRef, useState } from 'react'
import { Mail, Globe, Edit3, Star, Video, Eye, Pen, PencilSparklesIcon, PencilSparkles, Edit, Edit2, Edit3Icon } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { Avatar } from '../components/Avatar';


function Profile() {

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const inputRefs = useRef({});

  const { profile, user, updateProfile, loading } = useAuth();


  useEffect(() => {

    if (!profile) return;

    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");

  }, [profile]);


  const handleSubmit = async (e) => {

    e.preventDefault();

    await updateProfile(firstName, lastName);

  };

  const inputValues = [
    { label: "Ism", stateValue: firstName, change: setFirstName, for: false },
    { label: "Familiya", stateValue: lastName, change: setLastName, for: false },
    { label: "Email", value: profile?.email, for: true },
    { label: "Joylashuv", value: "Uzbekistan", for: true },
  ]

  return (
    <div className='px-4 sm:px-6 lg:px-8' style={{ fontFamily: "Inter, sans-serif" }}>
      {loading && <Loader/>}
      <div className="mb-6">
        <h1 style={{ color: "#e6edf3", fontSize: "clamp(20px,5vw,26px)", fontWeight: 700, marginBottom: "4px" }}>Profil & Sozlamalar</h1>
        <p className='text-[#8b949e] text-[13px]'>Hisobingiz va sozlamalaringizni boshqaring.</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-xl p-5 flex flex-col items-center text-center" style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="relative mb-3">
            {profile.avatar ? <img src={profile?.avatar} alt="avatar" className='w-[65px] rounded-full'/> : <Avatar profile={profile} size={65} font={23} />}
            <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#3b82f6", border: "2px solid #0d1117", cursor: "pointer" }}>
              <Edit3 size={10} color="#fff" />
            </button>
          </div>
          <div style={{ color: "#e6edf3", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>{profile?.first_name} {profile?.last_name}</div>
          <div className="px-3 py-1 rounded-full text-xs mb-4 bg-[rgba(59,130,246,0.15)] border-[1px] border-[rgba(59,130,246,0.3)] text-[#58a6ff]">{profile?.role === "user" ? "O'quvchi" : "O'qituvchi"}</div>
        </div>
        <div className="flex flex-col gap-4 flex-1">
          <div className="rounded-xl p-5 bg-[#161b22] border-[1px] border-[rgba(255,255,255,0.07)]">
            <div className='text-[#e6edf3] text-[15px] font-bold mb-[16px]'>Shaxsiy malumotlar</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inputValues.map((field) => (
                <div key={field.label} className='relative'>
                  <label form={field.label} className='text-[#8b949e] text-[12px] block mb-[6px]'>{field.label}</label>
                  <input
                    id={field.label}
                    ref={(el) => (inputRefs.current[field.label] = el)}
                    value={field?.stateValue ?? field?.value ?? ""}
                    onChange={(e) => field.change && field.change(e.target?.value)}
                    style={{ width: "100%", background: "#1c2128", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "#e6edf3", fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    readOnly={field.for}
                  />
                  {field.label === "Ism" || field.label === "Familiya" ? <Edit className='absolute right-2 top-9' size={20} onClick={() => inputRefs.current[field.label]?.focus()} /> : ""}
                </div>
              ))}
            </div>
            <button onClick={handleSubmit} className="mt-6 px-5 py-3 rounded-xl active:scale-95 transition-all duration-150 bg-[#3b82f6] text-[#ffff] border-none cursor-pointer text-[14px] font-bold">
              Saqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile