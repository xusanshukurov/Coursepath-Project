import { Database } from 'lucide-react'
import React, { useEffect } from 'react'
import { useDashboard } from '../context/DashboardContext'
import { useCourse } from '../context/CourseContex'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
import { Avatar } from '../components/Avatar'

function Progress() {

  const { user, profile } = useAuth()
  const { formatDuration } = useDashboard()
  const { loading, getLeaderboard, leaderboard, getTodayWatchTime, todayWatchTime, formatStudyTime } = useCourse()
  
  

  useEffect(() => {

    if (!user) return;

    getTodayWatchTime();

  }, [user]);


  useEffect(() => {

    getLeaderboard();

  }, [user])


  const myRank = leaderboard.findIndex(item => item.id === user.id) + 1;
  const myXP = leaderboard.find(item => item.id === user.id)?.xp

  

  const progressBar = [
    { label: "Jami Soatlar", value: formatDuration(), color: "#3b82f6" },
    { label: "Bugun", value: formatStudyTime(todayWatchTime), color: "#10b981" },
    { label: "Ball", value: `${myXP}xp`, color: "#f59e0b" },
    { label: "O'rin", value: myRank, color: "#8b5cf6" },
  ]
  

  return (
    <div className='px-4 sm:px-6 lg:px-8'>
      {loading && <Loader />}
      <div className="mb-6">
        <h1 style={{ color: "#e6edf3", fontSize: "clamp(20px,5vw,26px)", fontWeight: 700, marginBottom: "4px" }}>Tahlil va Jarayonlar</h1>
        <p className='text-[#8b949e] text-[13px]'>O'quv ko'nikmangiz va bosqichlarni kuzatib boring.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {progressBar.map((s) => (
          <div key={s.label} className="rounded-2xl p-4 bg-[#161b22] border-[1px] border-[rgba(255,255,255,0.07)] ">
            <div className='text-[#8b949e] text-[11px] mb-[6px]'>{s.label}</div>
            <div style={{ color: s.color, fontSize: "clamp(20px,5vw,26px)", fontWeight: 500, fontFamily: "JetBrains Mono, monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div>
        <h3 className='text-base sm:text-lg font-semibold'>Foydalanuvchilar ro'yhati</h3>
        <ul className='mt-4 sm:mt-8 flex flex-col gap-3'>
          {leaderboard.map((item, index) => (
            <li key={item.id} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-3 rounded-xl border-[1px] ${item.id === user.id ? "bg-blue-700" : ""} ${item.id === user.id ? "border-gray-200" : ""} border-[rgba(255,255,255,0.23)]`}>
              <div className='flex items-center gap-3 min-w-0'>
                <span className='text-lg sm:text-xl font-bold font-sans flex-shrink-0'>{index + 1}</span>
                {item?.avatar ? <img src={item?.avatar} alt="avatar" className='w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0'/> : <Avatar profile={item} size={40}/>}
                <p className='font-semibold text-sm sm:text-base truncate'>{item.first_name} {item.last_name} {item.id === user.id ? "(siz)" : ''}</p>
              </div>
              <span className='flex items-center gap-2 text-sm sm:text-[15px] pl-8 sm:pl-0 flex-shrink-0'>{item.xp} xp<Database className='text-[#f59e0b]' size={18} /></span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Progress