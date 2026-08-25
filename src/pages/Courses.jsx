import React, { useEffect, useState } from 'react'
import { Play, Video, Eye, Star, ChevronRight, Users } from "lucide-react";
import { useCourse } from '../context/CourseContex';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase.Client';


const levelColors = {
  Beginner: "#10b981",
  Intermediate: "#f59e0b",
  Advanced: "#ef4444",
};


function Courses() {
  const { user } = useAuth()
  const { courseCount } = useDashboard()
  const { courses, CompletedCourseCount, loading } = useCourse()

  const [coursesCategory, setCoursesCategory] = useState([])
  const [active, setActive] = useState("Hammasi");

  const navigate = useNavigate();

  useEffect(() => {
    if (active === "Hammasi") {
      setCoursesCategory(courses);
    } else if (active === "Jarayonda") {
      setCoursesCategory(courses.filter(c => c.progress > 0 && c.progress < 100));
    } else if (active === "Tugatilgan") {
      setCoursesCategory(courses.filter(c => c.progress === 100));
    } else if (active === "Boshlanmagan") {
      setCoursesCategory(courses.filter(c => !c.progress || c.progress === 0));
    }
  }, [courses, active]);

  const handleAllBar = () => {
    setActive("Hammasi");
  };

  const handleProgressBar = () => {
    setActive("Jarayonda");
  };

  const handleCompletedBar = () => {
    setActive("Tugatilgan");
  };

  const handleNotStartedBar = () => {
    setActive("Boshlanmagan");
  };

  const filters = [
    { title: "Hammasi", click: handleAllBar },
    { title: "Jarayonda", click: handleProgressBar },
    { title: "Tugatilgan", click: handleCompletedBar },
    { title: "Boshlanmagan", click: handleNotStartedBar },
  ];


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
    <div className='px-4 sm:px-6 lg:px-8'>
      {loading && <Loader />}
      <div className='mb-6'>
        <h1 className='text-[#e6edf3] text-[22px] font-bold mb-[4px] '>Darsliklar</h1>
        <p className='text-[#8b949e] text-[13px]'>
          {courseCount} ta qatnashilgan kurslar · {CompletedCourseCount} ta tugatilgan
        </p>
      </div>
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {filters.map((item) => (
          <button onClick={item.click} key={item.title} className={`px-4 py-2 rounded-xl transition-all duration-150 border-[1px] text-[13px] cursor-pointer whitespace-nowrap ${active === item.title ? 'bg-[rgba(59,130,246,0.15)]' : 'bg-[rgba(255,255,255,0.04)]'}  ${active === item.title ? 'border-[rgba(59,130,246,0.4)]' : 'border-[rgba(255,255,255,0.08)]'}  ${active === item.title ? 'text-[#58a6ff]' : 'text-[#8b949e]'}  ${active === item.title ? 'font-bold' : 'font-normal'}`}>{item.title}</button>
        ))}
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
        {loading && <h1>loading...</h1>}
        {coursesCategory.length > 0 ? coursesCategory.map((course) => {
          return (
            <div onClick={() => startCourse(course)} key={course.id} className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 group bg-[#161b22] border-[1px] border-[rgba(255,255,255,0.07)] cursor-pointer hover:border-[rgba(59,130,246,0.35)] hover:-translate-y-2 hover:shadow-[0 8px 32px rgba(0,0,0,0.35)]">
              <div className="relative overflow-hidden h-[180px] bg-[#0d1117]">
                <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[rgba(0,0,0,0.55)]">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(59,130,246,0.9)", backdropFilter: "blur(4px)" }}>
                    <Play size={20} color="#fff" fill="#fff" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-xl" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", border: `1px solid #10b98140` }}>
                  <span className='text-[#10b981] text-[11px] font-bold' style={{ color: levelColors[course.level], fontFamily: "Inter, sans-serif" }}>
                    {course.level}
                  </span>
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-xl" style={{ background: '#ffd43b22', border: `1px solid #ffd43b44` }}>
                  <span style={{ color: '#ffd43b', fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}>
                    {course.slug}
                  </span>
                </div>
              </div>
              <div className="flex flex-col flex-1 p-4 gap-3">
                <div style={{ color: "#8b949e", fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                  By <span className='text-[#58a6ff]'>{course.instructor}</span>
                </div>
                <h3 style={{ color: "#e6edf3", fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 600, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", }}>
                  {course.title}
                </h3>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Video size={13} style={{ color: "#8b949e" }} />
                    <span style={{ color: "#8b949e", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
                      {course.lessonsCount || 0} Videos
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} style={{ color: "#8b949e" }} />
                    <span style={{ color: "#8b949e", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
                      {course.studentsCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye size={13} style={{ color: "#8b949e" }} />
                    <span style={{ color: "#8b949e", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
                      {course.viewsCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} style={{ color: "#f59e0b" }} fill="#f59e0b" />
                    <span style={{ color: "#f59e0b", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", fontWeight: 500 }}>
                      {course.rating}
                    </span>
                    <span style={{ color: "#8b949e", fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
                      ({course.reviewsCount})
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ color: "#8b949e", fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
                      {course.progress === 0 ? 'Boshlanmagan' : course.progress === 100 ? 'Tugatilgan' : 'Jarayonda'}
                    </span>
                    <span style={{ color: "#e6edf3", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", fontWeight: 500 }}>
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.08)]">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${course.progress || 0}%`,
                        background: course.progress === 100
                          ? "#10b981"
                          : `linear-gradient(90deg, #3b82f6, #6366f1)`,
                      }}
                    />
                  </div>
                </div>
                <button className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-150 hover:text-[#ffff] hover:bg-[rgba(59,130,246,0.9)]"
                  style={{
                    background: course.progress ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.9)",
                    border: course.progress ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                    color: course.progress ? "#58a6ff" : "#ffffff",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}>
                  <Play size={14} fill="currentColor" />
                  {course.progress > 0 ? "Davom eting" : "Kursni boshlash"}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          )
        }) : <h1 className=''>Malumot topilmadi !</h1>}
      </div>
    </div>
  )
}

export default Courses