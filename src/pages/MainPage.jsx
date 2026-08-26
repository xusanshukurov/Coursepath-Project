import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  BarChart2,
  User,
  ChevronRight,
  ShieldCheck,
  LogOut,
  X,
  Menu,
  AlertTriangle,
} from "lucide-react";
import logo from '../assets/authImages/logo.png'

import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';

function MainPage() {
  const { signOut, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ logOutTarget, setLogOutTarget ] = useState(null)
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const sidebarItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/kurslar', icon: BookOpen, label: 'Kurslar' },
    { to: '/manbalar', icon: FolderOpen, label: 'Manbalar' },
    { to: '/jarayon', icon: BarChart2, label: 'Jarayon' },
    { to: '/profil', icon: User, label: 'Profil' }
  ];

  const bottomNavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Asosiy' },
    { to: '/kurslar', icon: BookOpen, label: 'Kurslar' },
    { to: '/manbalar', icon: FolderOpen, label: 'Manbalar' },
    { to: '/jarayon', icon: BarChart2, label: 'Jarayon' },
    ...(profile?.role === 'admin'
      ? [{ to: '/boshqaruv', icon: ShieldCheck, label: 'Admin' }]
      : [{ to: '/profil', icon: User, label: 'Profil' }]
    )
  ];

  const handleSignOut = () => {
    signOut();
  };

  const isVideoPage = /^\/kurslar\/[^/]+$/.test(location.pathname);

  return (
    <>
      <div className='flex flex-col lg:flex-row h-screen overflow-hidden bg-[#0D1117]'>
        <div className={`lg:hidden flex items-center justify-between px-4 py-3 bg-[#0b0f16] border-b border-[#1B1F25] sticky top-0 z-30 flex-shrink-0 ${isVideoPage ? 'hidden' : ''}`}>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className='p-2 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#e6edf3] hover:bg-[rgba(255,255,255,0.1)] active:scale-95 transition-all cursor-pointer'
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <img src={logo} alt="LearnHub" className="h-6 object-contain" />
          </div>
          <div className="flex items-center gap-2">
            {profile?.avatar ? (
              <img src={profile?.avatar} alt="avatar" className='w-8 h-8 rounded-full border border-[rgba(255,255,255,0.1)]' />
            ) : (
              <Avatar profile={profile} size={32} font={13} />
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            className='lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity'
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <nav className={`
          fixed top-0 left-0 h-screen w-[256px] flex flex-col justify-between bg-[#0b0f16] border-r border-[#1B1F25] z-50 transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div>
            <div className='flex items-center justify-between p-4'>
              <img src={logo} alt="LearnHub" width={140} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className='lg:hidden p-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] text-[#8b949e] hover:text-white cursor-pointer'
              >
                <X size={18} />
              </button>
            </div>
            <div className='border-t border-[#1B1F25]'>
              {profile?.role === "admin" && (
                <div className="px-4 pt-4">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
                    <ShieldCheck size={13} style={{ color: "#a78bfa" }} />
                    <span style={{ color: "#a78bfa", fontSize: "11px", fontWeight: 600, fontFamily: "Inter, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      Admin panel
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className='p-3 pt-4 overflow-y-auto max-h-[calc(100vh-220px)]' style={{ scrollbarWidth: "none" }}>
              <p className='text-[10px] text-[#8b949e] px-3 pb-2 font-extrabold'>NAVIGATSIYA</p>
              <ul className='flex flex-col pt-1 gap-1'>
                {sidebarItems.map((item, index) => (
                  <li key={index}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `w-full flex items-center gap-3 px-3 py-2.5 border rounded-xl transition-all duration-150 text-[14px] ${isActive
                          ? 'bg-[rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.3)] text-[#58a6ff] font-semibold'
                          : 'border-transparent text-[#8b949e] hover:text-[#e6edf3] hover:bg-[rgba(255,255,255,0.03)]'
                        }`
                      }
                    >
                      <div className='flex items-center gap-3 flex-1'>
                        <item.icon size={18} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={14} className='opacity-40' />
                    </NavLink>
                  </li>
                ))}
              </ul>
              {profile?.role === "admin" && (
                <>
                  <div className="px-3 pb-2 mt-4" style={{ color: "#8b949e", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>
                    Admin boshqaruvi
                  </div>
                  <NavLink
                    to={'/boshqaruv'}
                    className={({ isActive }) =>
                      `w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 text-[14px] ${isActive
                        ? 'bg-[rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.3)] text-[#58a6ff] font-semibold'
                        : 'border-transparent text-[#8b949e] hover:text-[#e6edf3] hover:bg-[rgba(255,255,255,0.03)]'
                      }`
                    }
                  >
                    <div className='flex items-center gap-3'>
                      <ShieldCheck size={18} />
                      <span>Kurslarni Boshqarish</span>
                    </div>
                    <ChevronRight size={14} className='opacity-40' />
                  </NavLink>
                </>
              )}
            </div>
          </div>
          <div className='flex flex-col gap-2 p-3 py-4 border-t border-[#1B1F25] bg-[#0b0f16]'>
            <button onClick={() => setLogOutTarget(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#8b949e] border border-transparent hover:border-[rgba(248,81,73,0.2)] hover:bg-[rgba(248,81,73,0.08)] hover:text-[#f85149] transition-all duration-150 cursor-pointer">
              <LogOut size={15} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}>Chiqish</span>
            </button>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
              {profile?.avatar ? <img src={profile?.avatar} alt="avatar" className='w-8 h-8 rounded-full object-cover' /> : <Avatar profile={profile} size={32} font={14} />}
              <div className="flex-1 min-w-0">
                <div className='text-[#e6edf3] text-[13px] font-semibold overflow-hidden whitespace-nowrap' style={{ fontFamily: "Inter, sans-serif", textOverflow: "ellipsis" }}>
                  {profile?.first_name} {profile?.last_name}
                </div>
                <div className='text-[11px] text-[#8b949e]'>
                  {profile?.role === 'admin' ? "O'qituvchi" : "Student"}
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className={`w-full flex-1 lg:pl-64 ${isVideoPage ? 'p-0 min-h-0 flex flex-col overflow-hidden' : 'overflow-y-auto pt-4 sm:pt-6 pb-24 lg:pb-10 overflow-hidden'}`} style={{ scrollbarWidth: "none" }}>
          <Outlet />
        </main>

        <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f16]/95 backdrop-blur-lg border-t border-[#1B1F25] flex items-center justify-around py-2 px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] ${isVideoPage ? 'hidden' : ''}`}>
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all duration-150 ${isActive
                  ? 'text-[#58a6ff] font-semibold scale-105'
                  : 'text-[#8b949e] hover:text-[#c9d1d9]'
                }`
              }
            >
              <item.icon size={18} />
              <span style={{ fontSize: "10px", fontFamily: "Inter, sans-serif" }}>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {logOutTarget && (
        <Modal onClose={() => setLogOutTarget(null)}>
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(248,81,73,0.12)", border: "1px solid rgba(248,81,73,0.3)" }}>
              <AlertTriangle size={24} style={{ color: "#f85149" }} />
            </div>
            <div>
              <p style={{ color: "#e6edf3", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Akountdan chiqishni hohlaysizmi ?</p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setLogOutTarget(null)} className="flex-1 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c9d1d9", fontSize: "14px", cursor: "pointer" }}>Bekor qilish</button>
              <button onClick={handleSignOut} className="flex-1 py-3 rounded-2xl" style={{ background: "#f85149", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Chiqish</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}


function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 px-0 sm:px-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6" style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default MainPage;