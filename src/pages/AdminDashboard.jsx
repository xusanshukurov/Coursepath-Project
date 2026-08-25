import React, { useEffect, useState } from 'react'
import { Users, BookOpen, DollarSign, Star, Eye, ShieldCheck, ChevronRight, ArrowUpRight, TrendingUp, Clock, Award, Play } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase.Client';
import Loader from '../components/Loader';



function AdminDashboard() {

    const [yearlyUsers, setYearlyUsers] = useState([]);
    const [userStats, setUserStats] = useState({
        totalUsers: 0,
        growth: 0,
    });
    const [courseStats, setCourseStats] = useState({
        totalCourses: 0,
        growth: 0,
    });

    const navigate = useNavigate()
    const { profile, loading } = useAuth()

    const rating = [
        { label: "Jami Foydalanuvchilar", value: userStats?.totalUsers, change: userStats?.growth + "%", icon: Users, color: "#3b82f6", sub: "Enrolled students" },
        { label: "Joriy Kurslar", value: courseStats?.totalCourses, change: courseStats.growth + "%", icon: BookOpen, color: "#10b981", sub: "Published & live" },
        { label: "O'rtacha Jarayon", value: userStats.growth + "%", change: "", icon: TrendingUp, color: "#f59e0b", sub: "This month" },
        { label: "Instructor Rating", value: "0 ★", change: "0 reviews", icon: Star, color: "#8b5cf6", sub: "All courses" },
    ]

    const enrollmentData = [
        { month: "Jan", students: 180 },
        { month: "Feb", students: 310 },
        { month: "Mar", students: 420 },
        { month: "Apr", students: 390 },
        { month: "May", students: 510 },
        { month: "Jun", students: 620 },
    ];


    useEffect(() => {
        const loadStats = async () => {
            const stats = await getUserStats();

            if (stats) {
                setUserStats(stats);
            }
        };

        loadStats();
    }, []);

    useEffect(() => {
        const loadCourseStats = async () => {
            const stats = await getCourseStats();

            if (stats) {
                setCourseStats(stats);
            }
        };

        loadCourseStats();
    }, []);


    useEffect(() => {
        const loadStats = async () => {
            const data = await getYearlyUsersStats();
            setYearlyUsers(data);
        };

        loadStats();
    }, []);


    useEffect(() => {
        const channel = supabase
            .channel("users-yearly-stats")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "users"
                },
                async () => {
                    const data = await getYearlyUsersStats();
                    setYearlyUsers(data);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);


    const getUserStats = async () => {

        const { count: totalUsers, error: totalError } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true });

        if (totalError) {
            console.log(totalError);
            return;
        }


        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);


        const { count: newUsers, error: newUsersError } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfMonth.toISOString());

        if (newUsersError) {
            console.log(newUsersError);
            return;
        }


        const usersAtStartOfMonth = totalUsers - newUsers;


        const growth =
            usersAtStartOfMonth > 0
                ? ((newUsers / usersAtStartOfMonth) * 100).toFixed(1)
                : 0;


        return {
            totalUsers,
            growth,
        };
    };



    const getCourseStats = async () => {
        const now = new Date();

        const firstDayThisMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        ).toISOString();

        const firstDayLastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        ).toISOString();

        const { count: totalCourses } = await supabase
            .from("courses")
            .select("*", { count: "exact", head: true });

        const { count: newCourses } = await supabase
            .from("courses")
            .select("*", { count: "exact", head: true })
            .gte("created_at", firstDayThisMonth);

        const { count: previousCourses } = await supabase
            .from("courses")
            .select("*", { count: "exact", head: true })
            .lt("created_at", firstDayThisMonth);

        const growth =
            previousCourses > 0
                ? ((newCourses / previousCourses) * 100).toFixed(1)
                : 100;

        return {
            totalCourses,
            growth,
        };
    };



    const getYearlyUsersStats = async () => {
        const now = new Date();

        const startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 11,
            1
        );

        const { data, error } = await supabase
            .from("users")
            .select("id, created_at")
            .gte("created_at", startDate.toISOString())
            .lte("created_at", now.toISOString())
            .order("created_at", { ascending: true });

        if (error) {
            console.log(error);
            return [];
        }

        const months = [];

        for (let i = 11; i >= 0; i--) {
            const date = new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );

            months.push({
                month: date.toLocaleString("en-US", {
                    month: "short"
                }),
                year: date.getFullYear(),
                monthIndex: date.getMonth(),
                students: 0
            });
        }

        data?.forEach((user) => {
            const date = new Date(user.created_at);

            const item = months.find(
                (month) =>
                    month.year === date.getFullYear() &&
                    month.monthIndex === date.getMonth()
            );

            if (item) {
                item.students += 1;
            }
        });

        return months;
    };


    const totalStudents = yearlyUsers.reduce(
        (sum, item) => sum + item.students,
        0
    );

    return (
        <div className='px-4 sm:px-6 lg:px-8'>
            {loading && <Loader/>}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck size={14} style={{ color: "#a78bfa" }} />
                        <span style={{ color: "#a78bfa", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Admin Dashboard</span>
                    </div>
                    <h1 style={{ color: "#e6edf3", fontSize: "clamp(20px,5vw,26px)", fontWeight: 700, marginBottom: "4px" }}>Xush kelibsiz, {profile?.first_name}</h1>
                    <p style={{ color: "#8b949e", fontSize: "13px" }}>Kurslaringiz natijasi bilan tanishib chiqing</p>
                </div>
                <button
                    onClick={() => navigate("/boshqaruv")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-150 self-start active:scale-95"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                    Kurslarni Boshqarish <ChevronRight size={14} />
                </button>
            </div>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6'>
                {rating.map((stat) => (
                    <div key={stat.label} className="rounded-xl p-4" style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}28` }}>
                                <stat.icon size={15} style={{ color: stat.color }} />
                            </div>
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                                <ArrowUpRight size={10} style={{ color: "#10b981" }} />
                                <span style={{ color: "#10b981", fontSize: "10px", fontWeight: 500, fontFamily: "JetBrains Mono, monospace" }}>{stat.change}</span>
                            </div>
                        </div>
                        <div style={{ color: "#e6edf3", fontSize: "clamp(16px,4vw,22px)", fontWeight: 500, fontFamily: "JetBrains Mono, monospace", marginBottom: "2px" }}>{stat.value}</div>
                        <div style={{ color: "#8b949e", fontSize: "11px" }}>{stat.label}</div>
                    </div>
                ))}
            </div>
            <div className="rounded-xl p-4" style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-1">
                    <span style={{ color: "#e6edf3", fontSize: "14px", fontWeight: 600 }}>Yillik Qatnashuvchilar</span>
                    <span style={{ color: "#8b949e", fontSize: "11px" }}>Bu oy</span>
                </div>
                <div style={{ color: "#8b5cf6", fontSize: "20px", fontWeight: 700, fontFamily: "JetBrains Mono, monospace", marginBottom: "12px" }}>{totalStudents} Nafar o'quvchi</div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={yearlyUsers}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="month" tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#1c2128", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e6edf3" }} formatter={(value) => [`${value}`, "Students"]} />
                        <Line type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: "#8b5cf6", r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default AdminDashboard