import React, { useEffect, useState } from 'react'
import {
    Plus, Video, FolderPlus, Trash2, Eye, Star, Users,
    ChevronRight, Edit3, AlertTriangle, X, ShieldCheck,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useCourseManagement } from '../context/CourseManagementContext';
import { toast } from 'sonner';

const MANAGED_COURSES = [
    { id: "c1", title: "The Complete React.js Guide: Zero to Hero", category: "React", thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=120&h=70&fit=crop&auto=format", totalVideos: 48, views: 1250, rating: 4.9, students: 842, status: "published", accentColor: "#61dafb" },
    { id: "c2", title: "Node.js Mastery: Build Production-Grade APIs", category: "Node.js", thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=120&h=70&fit=crop&auto=format", totalVideos: 36, views: 870, rating: 4.8, students: 591, status: "published", accentColor: "#68a063" },
    { id: "c3", title: "Python for Data Science & Machine Learning", category: "Python", thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=120&h=70&fit=crop&auto=format", totalVideos: 52, views: 2100, rating: 4.7, students: 1340, status: "published", accentColor: "#ffd43b" },
    { id: "c4", title: "TypeScript Pro: From Beginner to Expert", category: "TypeScript", thumbnail: "https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=120&h=70&fit=crop&auto=format", totalVideos: 30, views: 640, rating: 4.9, students: 412, status: "published", accentColor: "#3178c6" },
    { id: "c5", title: "Modern CSS: Grid, Flexbox & Animations", category: "CSS", thumbnail: "https://images.unsplash.com/photo-1617040619263-41c5a9ca7521?w=120&h=70&fit=crop&auto=format", totalVideos: 24, views: 510, rating: 4.6, students: 278, status: "draft", accentColor: "#264de4" },
    { id: "c6", title: "DevOps Essentials: Docker, CI/CD & Cloud", category: "DevOps", thumbnail: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=120&h=70&fit=crop&auto=format", totalVideos: 40, views: 390, rating: 4.8, students: 215, status: "published", accentColor: "#0db7ed" },
];

function CourseManagement() {
    // const [courses, setCourses] = useState(MANAGED_COURSES)
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(null);
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [newBanner, setNewBanner] = useState("");
    const [level, setLevel] = useState("Beginner");
    const [status, setStatus] = useState("Published");


    const navigate = useNavigate()

    const { getCourses, courses, createCourse, updateCourse, deleteCourse, loading } = useCourseManagement()

    useEffect(() => {

        getCourses()

    }, [])



    const handleCreateCourse = async () => {
        if (!newTitle.trim()) return;

        await createCourse({
            title: newTitle,
            level,
            is_published: status === "Published",
            slug: newCategory,
            thumbnail: newBanner || null,
        });

        setNewTitle("");
        setNewCategory("");
        setNewBanner("");
        setLevel("Beginner");
        setStatus("Published");

        setShowAddModal(false);
        toast.success("Kurs qo'shildi 🎉");
    };


    const handleUpdateCourse = async () => {
        if (!showEditModal) return;

        await updateCourse(
            showEditModal,
            {
                title: newTitle,
                slug: newCategory,
                thumbnail: newBanner,
                level,
                is_published: status === "Published",
            }
        );

        setShowEditModal(null);
    };


    const handleDeleteCourse = async () => {

        await deleteCourse(deleteTarget);
        setDeleteTarget(null);
        toast.success("Kurs va uning hamma darslari o'chirildi")
    }


    return (
        <div className='px-4 sm:px-6 lg:px-8' style={{ fontFamily: "Inter, sans-serif" }}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck size={14} style={{ color: "#a78bfa" }} />
                        <span style={{ color: "#a78bfa", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Admin Panel</span>
                    </div>
                    <h1 style={{ color: "#e6edf3", fontSize: "clamp(20px,5vw,26px)", fontWeight: 700, marginBottom: "4px" }}>Kurs Boshqaruvi</h1>
                    <p style={{ color: "#8b949e", fontSize: "13px" }}>
                        {courses?.length} Kurslar · {courses.filter(course => course.is_published === false).length} Arxivlar
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowAddModal(true);
                        setNewTitle("");
                        setNewCategory("");
                        setNewBanner("");
                        setLevel("Beginner");
                        setStatus("Published");
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-150 active:scale-95 self-start"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 16px rgba(59,130,246,0.3)", whiteSpace: "nowrap" }}
                >
                    <Plus size={16} />Yangi kurs qo'shish
                </button>
            </div>
            <div className="flex flex-col gap-3">
                {courses.map((course) => (
                    <div key={course.id} className="rounded-2xl overflow-hidden" style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div className="flex items-start gap-3 p-4">
                            <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: "80px", height: "52px", background: "#0d1117" }}>
                                <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <span className="px-2 py-0.5 rounded-xl capitalize" style={{ background: '#61dafb18', border: '1px solid #61dafb30', color: '#61dafb', fontSize: "10px", fontWeight: 600 }}>{course.slug}</span>
                                    <span className="px-2 py-0.5 rounded-xl" style={{ background: course.status === "published" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${course.is_published === true ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`, color: course.is_published === true ? "#10b981" : "#f59e0b", fontSize: "10px", fontWeight: 600 }}>{course.is_published === true ? "Published" : "draft"}</span>
                                </div>
                                <div style={{ color: "#e6edf3", fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{course.title}</div>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <div className="flex items-center gap-1"><Video size={11} style={{ color: "#8b949e" }} /><span style={{ color: "#8b949e", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>{course?.lessonsCount || 0}</span></div>
                                    <div className="flex items-center gap-1"><Users size={11} style={{ color: "#8b949e" }} /><span style={{ color: "#8b949e", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>{(course?.studentsCount || 0).toLocaleString()}</span></div>
                                    <div className="flex items-center gap-1"><Eye size={11} style={{ color: "#8b949e" }} /><span style={{ color: "#8b949e", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>{(course?.viewsCount || 0).toLocaleString()}</span></div>
                                    <div className="flex items-center gap-0.5"><Star size={10} style={{ color: "#f59e0b" }} fill="#f59e0b" /><span style={{ color: "#f59e0b", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>0</span></div>
                                </div>
                            </div>
                            <button onClick={() => navigate(`${course.slug}`)} className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#8b949e", cursor: "pointer" }}>
                                <ChevronRight size={15} />
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 px-4 pb-3">
                            <button
                                onClick={() => navigate(`${course.slug}`)}
                                title="Yangi video qo'shish"
                                className="flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl transition-all duration-150 active:scale-95"
                                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.28)", color: "#58a6ff", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                            >
                                <Video size={14} />
                                <span className="hidden sm:inline whitespace-nowrap">Yangi video</span>
                            </button>
                            <button
                                onClick={() => setDeleteTarget(course.id)}
                                title="Kursni o'chirish"
                                className="flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl transition-all duration-150 active:scale-95"
                                style={{ background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.25)", color: "#f85149", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                            >
                                <Trash2 size={14} />
                                <span className="hidden sm:inline whitespace-nowrap">O'chirish</span>
                            </button>
                            <button
                                onClick={() => { setShowEditModal(course.id); setNewTitle(course.title); setNewCategory(course.slug); setNewBanner(course.thumbnail); setLevel(course.level); setStatus(course.is_published ? "Published" : "Draft") }}
                                title="Tahrirlash"
                                className="flex items-center justify-center gap-1.5 px-2 sm:px-3 py-2 rounded-xl transition-all duration-150 active:scale-95"
                                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.22)", color: "#f59e0b", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                            >
                                <Edit3 size={14} />
                                <span className="hidden sm:inline whitespace-nowrap">Tahrirlash</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {deleteTarget && (
                <Modal onClose={() => setDeleteTarget(null)}>
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(248,81,73,0.12)", border: "1px solid rgba(248,81,73,0.3)" }}>
                            <AlertTriangle size={24} style={{ color: "#f85149" }} />
                        </div>
                        <div>
                            <h3 style={{ color: "#e6edf3", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Kursni o'chirmoqchimisiz ?</h3>
                            <p style={{ color: "#8b949e", fontSize: "13px", lineHeight: 1.6 }}>
                                Bu kursni va uning barcha kantentini butunlay o‘chirib tashlaydi. <strong style={{ color: "#f85149" }}>Bu amalni ortga qaytarib bo‘lmaydi.</strong>.
                            </p>
                        </div>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c9d1d9", fontSize: "14px", cursor: "pointer" }}>Bekor qilish</button>
                            <button onClick={() => handleDeleteCourse()} className="flex-1 py-3 rounded-2xl" style={{ background: "#f85149", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>O'chirish</button>
                        </div>
                    </div>
                </Modal>
            )}
            {showAddModal && (
                <Modal onClose={() => setShowAddModal(null)}>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 style={{ color: "#e6edf3", fontSize: "17px", fontWeight: 700 }}>Yangi kurs qo'shish</h3>
                            <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8b949e" }}><X size={18} /></button>
                        </div>
                        <FormField label="Banner url" value={newBanner} onChange={setNewBanner} placeholder="masalan: image/jpeg;base64,/9j/4AAQRk" />
                        <FormField label="Kurs nomi" value={newTitle} onChange={setNewTitle} placeholder="masalan: Pythonni 0 dan o'rganish" />
                        <FormField label="Kategoriya" value={newCategory} onChange={setNewCategory} placeholder="masalan: Python" />
                        {[{ label: "Qiyinlik darajasi", options: ["Beginner", "Intermediate", "Advanced"], value: level, setValue: setLevel, }, { label: "Status", options: ["Published", "Draft"], value: status, setValue: setStatus, }].map((sel) => (
                            <div key={sel.label}>
                                <label style={{ color: "#8b949e", fontSize: "12px", display: "block", marginBottom: "6px" }}>{sel.label}</label>
                                <select value={sel.value} onChange={(e) => sel.setValue(e?.target?.value)} style={{ width: "100%", background: "#1c2128", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "#e6edf3", fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none", cursor: "pointer" }}>
                                    {sel.options.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                        <div className="flex gap-3 mt-2">
                            <button onClick={() => setShowAddModal(null)} className="flex-1 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c9d1d9", fontSize: "14px", cursor: "pointer" }}>Bekor qilish</button>
                            <button onClick={() => handleCreateCourse()} className="flex-1 py-3 rounded-2xl" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Yaratish</button>
                        </div>
                    </div>
                </Modal>
            )}
            {showEditModal && (
                <Modal onClose={() => setShowEditModal(null)}>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 style={{ color: "#e6edf3", fontSize: "17px", fontWeight: 700 }}>Kursni tahrirlash</h3>
                            <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8b949e" }}><X size={18} /></button>
                        </div>
                        <FormField label="Banner url" value={newBanner} onChange={setNewBanner} placeholder="image/jpeg;base64,/9j/4AAQSkZJRg" />
                        <FormField label="Kurs nomi" value={newTitle} onChange={setNewTitle} placeholder="e.g. Advanced GraphQL Mastery" />
                        <FormField label="Kategoriya" value={newCategory} onChange={setNewCategory} placeholder="e.g. GraphQL" />
                        {[{ label: "Qiyinlik darajasi", options: ["Beginner", "Intermediate", "Advanced"], value: level, setValue: setLevel, }, { label: "Status", options: ["Published", "Draft"], value: status, setValue: setStatus, }].map((sel) => (
                            <div key={sel.label}>
                                <label style={{ color: "#8b949e", fontSize: "12px", display: "block", marginBottom: "6px" }}>{sel.label}</label>
                                <select value={sel.value} onChange={(e) => sel.setValue(e?.target?.value)} style={{ width: "100%", background: "#1c2128", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "#e6edf3", fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none", cursor: "pointer" }}>
                                    {sel.options.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        ))}
                        <div className="flex gap-3 mt-2">
                            <button onClick={() => setShowEditModal(null)} className="flex-1 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c9d1d9", fontSize: "14px", cursor: "pointer" }}>Bekor qilish</button>
                            <button onClick={() => handleUpdateCourse()} className="flex-1 py-3 rounded-2xl" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Yangilash</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
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

function FormField({ label, value, onChange, placeholder }) {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            <label style={{ color: "#8b949e", fontSize: "12px", display: "block", marginBottom: "6px" }}>{label}</label>
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ width: "100%", background: "#1c2128", border: `1px solid ${focused ? "#3b82f6" : "rgba(255,255,255,0.1)"}`, borderRadius: "10px", padding: "12px", color: "#e6edf3", fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
            />
        </div>
    );
}


export default CourseManagement