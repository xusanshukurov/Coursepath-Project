import React, { useEffect, useState } from 'react'
import { TrendingUp, Clock, BookOpen, Award, ChevronRight, Play } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { useCourse } from '../context/CourseContex';
import Loader from '../components/Loader';
import { supabase } from '../supabase.Client';


function Dashboard() {
  const { user, profile } = useAuth()
  const { courses, getLeaderboard, leaderboard } = useCourse()
  const { courseCount, formatDuration, loading, myCourses, setMyCourses, recommendedCourses, totalDuration, getMyCourses } = useDashboard()

  const navigate = useNavigate()


  useEffect(() => {

    getLeaderboard();

  }, [user])


  const someCourses = courses.length > 4 ? courses.slice(2, 5) : courses;
  const joinedCourses = myCourses?.slice(0, 2);



  const myRank = leaderboard.findIndex(item => item.id === user?.id) + 1;
  const myXP = leaderboard.find(item => item.id === user?.id)?.xp ?? 0;


  const rating = [
    { label: "Qatnashilgan Kurslar", value: courseCount, icon: BookOpen, color: "#3b82f6" },
    { label: "Vaqt Sarflangan", value: formatDuration(), icon: Clock, color: "#10b981" },
    { label: "To'plangan ball", value: `${myXP || 0}xp`, icon: TrendingUp, color: "#f59e0b" },
    { label: "O'rin", value: myRank, icon: Award, color: "#8b5cf6" },
  ]


  const startCourse = async (course) => {

    if (!user) return;

    const { data: enrollment, error } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      return;
    }

    if (!enrollment) {

      const { error: enrollError } = await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: course.id,
          status: "active",
          progress: 0
        });

      if (enrollError) {
        console.log(enrollError);
        return;
      }
    }

    navigate(`/kurslar/${course.slug}`);
  };


  return (
    <div className='px-4 sm:px-6 lg:px-8' >
      {loading && <Loader />}
      <h1 className='text-xl sm:text-2xl font-extrabold'>Xush kelibsiz, {profile?.first_name} 👋</h1>
      <p className='text-[14px] text-[#8b949e] mt-1'>Siz 7 kunlik seriyadasiz. O'rganishni hoziroq boshlang!</p>
      <ul className='my-5 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6'>
        {rating.map(statistic => (
          <li key={statistic.label} className='p-3 sm:p-4 flex items-center gap-2 sm:gap-3 rounded-2xl bg-[#161b22] border-[1px] border-[rgba(255,255,255,0.07)]'>
            <div className='w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0' style={{ background: `${statistic.color}18`, border: `1px solid ${statistic.color}30` }}>
              <statistic.icon size={17} color={statistic.color} />
            </div>
            <div className='flex flex-col justify-center min-w-0'>
              <span className='text-[#e6edf3] text-[16px] sm:text-[20px] leading-none' style={{ fontFamily: "monospace" }}>{statistic.value}</span>
              <p className='text-[10px] sm:text-[11px] text-[#8b949e] leading-normal truncate'>{statistic.label}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className='text-[#e6edf3] text-[16px] font-semibold'>O'rganishda davom eting</h2>
          <button onClick={() => navigate("/kurslar")} className="flex items-center gap-1 text-[13px] text-[#58a6ff] cursor-pointer" >
            Barchasini ko'rish <ChevronRight size={13} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {joinedCourses.length > 0
            ? joinedCourses.map((enrollment) => {
              const course = enrollment.courses || enrollment;
              const prog = courses.find(x => x.id === course.id)

              return (
                <div key={enrollment.id || course.id} onClick={() => startCourse(course)} className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 bg-[#161b22] border-[1px] border-[rgba(255,255,255,0.07)] hover:border-[rgba(59,130,246,0.3)]">
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d1117]">
                    <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className='text-[#e6edf3] text-[13px] font-semibold mb-[4px] overflow-hidden whitespace-nowrap'>
                      {course.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.08)]">
                        <div className="h-full rounded-full" style={{
                          width: `${prog?.progress || 0}%`, background: prog?.progress === 100
                            ? "#10b981"
                            : `linear-gradient(90deg, #3b82f6, #6366f1)`,
                        }} />
                      </div>
                      <span className='text-[#8b949e] text-[11px]'>{prog?.progress || 0}%</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(59,130,246,0.15)] border-[1px] border-[rgba(59,130,246,0.3)] text-[#58a6ff] text-[12px] cursor-pointer">
                    <Play size={12} fill="#58a6ff" />
                    <span className="hidden sm:inline">{prog?.progress > 0 && prog?.progress < 100 ? "Davom etish" : prog?.progress === 0 ? "Boshlash" : "Qayta boshlash"}</span>
                  </button>
                </div>
              );
            })
            : recommendedCourses.map((course) => {
              const prog = courses.find(x => x.id === course.id)

              return (
                <div onClick={() => startCourse(course)} key={course.id} className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 bg-[#161b22] border-[1px] border-[rgba(255,255,255,0.07)] hover:border-[rgba(59,130,246,0.3)]">
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d1117]">
                    <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className='text-[#e6edf3] text-[13px] font-semibold mb-[4px] overflow-hidden whitespace-nowrap'>
                      {course.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.08)]">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.08)]">
                          <div className="h-full rounded-full" style={{
                            width: `${prog?.progress || 0}%`, background: prog?.progress === 100
                              ? "#10b981"
                              : `linear-gradient(90deg, #3b82f6, #6366f1)`,
                          }} />
                        </div>
                      </div>
                      <span className='text-[#8b949e] text-[11px]'>{prog?.progress || 0}%</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(59,130,246,0.15)] border-[1px] border-[rgba(59,130,246,0.3)] text-[#58a6ff] text-[12px] cursor-pointer">
                    <Play size={12} fill="#58a6ff" />
                    <span className="hidden sm:inline">{prog?.progress > 0 && prog?.progress < 100 ? "Davom etish" : prog?.progress === 0 ? "Boshlash" : "Qayta boshlash"}</span>
                  </button>
                </div>
              )
            })
          }
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className='text-[#e6edf3] text-[16px] font-bold'>Barcha kurslar</h2>
          <button onClick={() => navigate("/kurslar")} className="flex items-center gap-1 text-[#58a6ff] text-[13px] cursor-pointer">
            Kurslarga o'tish <ChevronRight size={13} />
          </button>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))" }}>
          {someCourses.map((course) => {
            return (
              <div onClick={() => startCourse(course)} key={course.id} className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95 bg-[#161b22] border-[1px] border-[rgba(255,255,255,0.07)] hover:border-[rgba(59,130,246,0.3)]">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d1117]">
                  <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className='text-[#e6edf3] text-[13px] font-semibold overflow-hidden whitespace-nowrap'>{course.title}</div>
                  <div className='text-[#8b949e] text-[11px]'>{course.slug}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: course.progress === 100 ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)", color: course.progress === 100 ? "#10b981" : "#58a6ff", fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>
                  {course.progress}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard