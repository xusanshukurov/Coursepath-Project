import React, { useEffect, useRef, useState } from 'react'
import {
    ChevronLeft, CheckCircle2, Circle, Clock, Download, FileCode2, FileText, FileArchive,
    BookMarked, ExternalLink, List, X, Play, Video, AlertTriangle, RefreshCw
} from "lucide-react";

import { useCourse } from '../context/CourseContex'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useParams } from 'react-router-dom';

const resourceIconMap = {
    zip: FileArchive,
    pdf: FileText,
    code: FileCode2,
    notes: BookMarked,
};

const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return "Link";
    const num = Number(bytes);
    if (num === 0) return "Link";
    const mb = num / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = num / 1024;
    return `${kb.toFixed(0)} KB`;
};

function VideoPlayer() {
    const [activeLesson, setActiveLesson] = useState(null);
    const [theatre, setTheatre] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(false);
    const [videoError, setVideoError] = useState(false);

    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        getCourse,
        getLessons,
        getLesson,
        updateLessonProgress,
        completeLesson,
        updateCourseProgress,
        course,
        lessons,
        lesson,
        getLessonProgress,
        lessonProgress,
        formatVideoDuration
    } = useCourse();

    const videoRef = useRef(null);
    const lastSave = useRef(0);

    useEffect(() => {
        getCourse(slug);
    }, [slug]);

    useEffect(() => {
        if (course) {
            getLessons(course.id);
        }
    }, [course, user]);

    useEffect(() => {
        if (lessons && lessons.length > 0 && !activeLesson) {
            setActiveLesson(lessons[0].id);
        }
    }, [lessons]);

    useEffect(() => {
        if (activeLesson) {
            setVideoError(false);
            getLesson(activeLesson);
        }
    }, [activeLesson]);

    useEffect(() => {
        if (lesson) {
            getLessonProgress(lesson.id);
        }
    }, [lesson]);

    const handleLoadedMetadata = () => {
        if (videoRef.current && lessonProgress?.last_position > 0) {
            try {
                videoRef.current.currentTime = lessonProgress.last_position;
            } catch (e) {
                console.log("CurrentTime restore error:", e);
            }
        }
    };

    const handleTimeUpdate = async () => {
        if (!videoRef.current || !lesson || !course) return;

        const current = Math.floor(videoRef.current.currentTime);
        const duration = Math.floor(videoRef.current.duration) || 0;

        if (duration > 0 && current >= Math.max(duration - 2, Math.floor(duration * 0.9))) {
            const isCompleted = lessons.find((l) => l.id === lesson.id)?.completed;
            if (!isCompleted) {
                await completeLesson(lesson.id);
                await updateCourseProgress(course.id);
            }
        }

        if (current - lastSave.current >= 5) {
            lastSave.current = current;

            if (updateLessonProgress) {
                await updateLessonProgress({
                    lessonId: lesson.id,
                    watchTime: current,
                    lastPosition: current
                });
            }
        }
    };

    const handlePause = async () => {
        if (!videoRef.current || !lesson || !course) return;
        const current = Math.floor(videoRef.current.currentTime);
        const duration = Math.floor(videoRef.current.duration) || 0;

        if (duration > 0 && current >= Math.max(duration - 2, Math.floor(duration * 0.9))) {
            await completeLesson(lesson.id);
            await updateCourseProgress(course.id);
        } else if (updateLessonProgress) {
            await updateLessonProgress({
                lessonId: lesson.id,
                watchTime: current,
                lastPosition: current
            });
        }
    };

    const handleEnded = async () => {
        if (!lesson || !course) return;
        await completeLesson(lesson.id);
        await updateCourseProgress(course.id);
    };

    const handleDownloadResource = async (e, res) => {
        e.preventDefault();
        if (!res?.file_url) return;

        const isExternalWebLink = res.file_type === "notes" || (!res.file_url.includes("supabase.co/storage") && !res.file_url.match(/\.(pdf|zip|jpg|jpeg|png|webp|gif|txt|csv|json|js|jsx|ts|tsx|py|html|css|docx|xlsx|pptx|rar|7z)$/i));

        if (isExternalWebLink) {
            window.open(res.file_url, "_blank", "noopener,noreferrer");
            return;
        }

        try {
            const response = await fetch(res.file_url);
            if (!response.ok) {
                window.open(res.file_url, "_blank", "noopener,noreferrer");
                return;
            }
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;

            const extension = res.file_url.split(".").pop().split("?")[0] || "file";
            const fileName = res.title ? (res.title.endsWith(`.${extension}`) ? res.title : `${res.title}.${extension}`) : `download.${extension}`;

            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            }, 300);
        } catch (err) {
            window.open(res.file_url, "_blank", "noopener,noreferrer");
        }
    };

    const handleVideoError = (e) => {
        console.log("Video Load Error:", e);
        setVideoError(true);
    };

    const completedCount = (lessons || []).filter((l) => l.completed).length;

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden" style={{ background: "#0d1117", color: "#c9d1d9", fontFamily: "Inter, sans-serif" }}>
            <div className="flex items-center justify-between px-3 sm:px-4 py-3 flex-shrink-0 gap-2" style={{ background: "#161b22", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <button
                        onClick={() => navigate('/kurslar')}
                        className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg active:scale-95 transition-all flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#8b949e", cursor: "pointer", fontSize: "12px" }}
                    >
                        <ChevronLeft size={15} /> Orqaga
                    </button>
                    <div className="text-[13px] sm:text-[14px] font-semibold text-[#e6edf3] truncate">{course?.title}</div>
                </div>
                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                    <div style={{ fontSize: "12px", color: "#8b949e" }}>Progress: {completedCount}/{lessons.length}</div>
                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${lessons.length ? (completedCount / lessons.length) * 100 : 0}%`, background: "linear-gradient(90deg, #3b82f6, #6366f1)" }} />
                    </div>
                </div>
                <button
                    className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                    onClick={() => setShowPlaylist(true)}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#e6edf3", cursor: "pointer" }}
                >
                    <List size={16} />
                </button>
            </div>

            <div className={`flex flex-1 overflow-hidden ${theatre ? "flex-col" : ""}`}>
                <div className={`flex flex-col overflow-auto ${theatre ? "w-full" : "flex-1"}`} style={{ minWidth: 0 }}>
                    <div className="relative w-full flex-shrink-0 bg-black" style={{ aspectRatio: "16/9" }}>
                        {videoError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/90 text-center z-10">
                                <AlertTriangle size={36} className="text-amber-500 mb-2" />
                                <div className="text-white text-base font-semibold mb-1">Videoni yuklab bo'lmadi</div>
                                <div className="text-gray-400 text-xs max-w-md mb-4">
                                    Video fayli topilmadi yoki Supabase Storage'dagi "lesson-videos" bucket'i Public qilinmagan. Supabase Dashboard -&gt; Storage bo'limida "lesson-videos" bucket'ini Public qiling.
                                </div>
                                <button
                                    onClick={() => {
                                        setVideoError(false);
                                        if (videoRef.current) videoRef.current.load();
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                                >
                                    <RefreshCw size={14} /> Qayta urinish
                                </button>
                            </div>
                        ) : null}

                        {lesson?.video_url ? (
                            <video
                                key={lesson.id || lesson.video_url}
                                ref={videoRef}
                                src={lesson.video_url}
                                controls
                                preload="metadata"
                                onLoadedMetadata={handleLoadedMetadata}
                                onTimeUpdate={handleTimeUpdate}
                                onPause={handlePause}
                                onEnded={handleEnded}
                                onError={handleVideoError}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                                Video URL mavjud emas
                            </div>
                        )}
                    </div>

                    <div className="flex-1 px-4 py-4">
                        <div style={{ color: "#8b949e", fontSize: "11px", marginBottom: "2px" }}>
                            Dars {lessons.findIndex((l) => l.id === activeLesson) + 1} / {lessons.length}
                        </div>
                        <h2 className="text-[15px] sm:text-[17px] font-bold text-[#e6edf3] mb-1 line-clamp-2">{lesson?.title}</h2>
                        <div className="flex items-center gap-2 mb-5">
                            <Clock size={12} style={{ color: "#8b949e" }} />
                            <span style={{ color: "#8b949e", fontSize: "12px", fontFamily: "JetBrains Mono, monospace" }}>{formatVideoDuration(lesson?.duration)}</span>
                        </div>

                        <div className="rounded-xl p-4" style={{ background: "#1c2128", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Download size={14} style={{ color: "#3b82f6" }} />
                                <span style={{ color: "#e6edf3", fontSize: "14px", fontWeight: 600 }}>Dars manbalari va fayllar</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {(lesson?.lesson_resources || []).map((res) => {
                                    const Icon = resourceIconMap[res.file_type] || FileCode2;
                                    const displaySize = typeof res.file_size === "string" && res.file_size.includes("MB") 
                                        ? res.file_size 
                                        : formatFileSize(res.file_size);
                                    return (
                                        <div
                                            key={res.id}
                                            onClick={(e) => handleDownloadResource(e, res)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 active:scale-95 bg-[rgba(255,255,255,0.03)] border-1 border-[rgba(255,255,255,0.05)] hover:bg-[rgba(59,130,246,0.08)] hover:border-[rgba(59,130,246,0.25)]"
                                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                                        >
                                            <Icon size={14} style={{ color: "#3b82f6", flexShrink: 0 }} />
                                            <span style={{ color: "#c9d1d9", fontSize: "13px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{res.title}</span>
                                            <span style={{ color: "#8b949e", fontSize: "11px", fontFamily: "JetBrains Mono, monospace", flexShrink: 0 }}>{displaySize}</span>
                                            <Download size={12} style={{ color: "#58a6ff", flexShrink: 0 }} />
                                        </div>
                                    );
                                })}
                                {(!lesson?.lesson_resources || lesson.lesson_resources.length === 0) && (
                                    <div style={{ color: "#8b949e", fontSize: "12px" }}>Ushbu dars uchun qo'shimcha manba yuklanmagan.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {!theatre && (
                    <div
                        className="hidden lg:flex flex-col flex-shrink-0 overflow-hidden"
                        style={{ width: "320px", borderLeft: "1px solid rgba(255,255,255,0.06)", background: "#0d1117" }}
                    >
                        <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ color: "#e6edf3", fontSize: "14px", fontWeight: 600 }}>Barcha darslar</div>
                            <div style={{ color: "#8b949e", fontSize: "12px", marginTop: "2px" }}>{completedCount} yakunlandi · {lessons.length} ta dars</div>
                        </div>
                        <PlaylistItems lessons={lessons} activeLesson={activeLesson} formatVideoDuration={formatVideoDuration} onSelect={setActiveLesson} courseThumbnail={course?.thumbnail} />
                    </div>
                )}
            </div>

            {showPlaylist && (
                <div className="lg:hidden fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(3px)" }} onClick={() => setShowPlaylist(false)}>
                    <div
                        className="mt-auto rounded-t-2xl flex flex-col"
                        style={{ background: "#0d1117", maxHeight: "80vh", border: "1px solid rgba(255,255,255,0.08)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                            <div>
                                <div style={{ color: "#e6edf3", fontSize: "15px", fontWeight: 600 }}>Barcha darslar</div>
                                <div style={{ color: "#8b949e", fontSize: "12px" }}>{completedCount} yakunlandi · {lessons.length} ta dars</div>
                            </div>
                            <button onClick={() => setShowPlaylist(false)} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "8px", cursor: "pointer", color: "#e6edf3", padding: "6px", lineHeight: 0 }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                            <PlaylistItems lessons={lessons} activeLesson={activeLesson} formatVideoDuration={formatVideoDuration} onSelect={(id) => { setActiveLesson(id); setShowPlaylist(false); }} courseThumbnail={course?.thumbnail} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function PlaylistItems({ lessons, activeLesson, formatVideoDuration, onSelect, courseThumbnail }) {
    return (
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {lessons.map((lesson, idx) => {
                const isActive = lesson.id === activeLesson;
                return (
                    <button
                        key={lesson.id}
                        onClick={() => onSelect(lesson.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-150 active:scale-95"
                        style={{ background: isActive ? "rgba(59,130,246,0.12)" : "transparent", borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent", cursor: "pointer", opacity: 1, textAlign: "left" }}
                    >
                        <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#1c2128] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                            {courseThumbnail ? (
                                <img src={courseThumbnail} className="w-full h-full object-cover opacity-75" alt={lesson.title} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-indigo-900/50">
                                    <Video size={16} className="text-blue-400 opacity-80" />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                {lesson.completed ? (
                                    <CheckCircle2 size={15} style={{ color: "#10b981" }} />
                                ) : (
                                    <Play size={12} style={{ color: isActive ? "#58a6ff" : "#ffffff" }} fill={isActive ? "#58a6ff" : "#ffffff"} />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div style={{ fontSize: "10px", color: "#8b949e", fontFamily: "JetBrains Mono, monospace", marginBottom: "1px" }}>Dars {String(idx + 1).padStart(2, "0")}</div>
                            <div style={{ fontSize: "13px", color: isActive ? "#e6edf3" : "#c9d1d9", fontWeight: isActive ? 600 : 400, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lesson.title}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Clock size={10} style={{ color: "#8b949e" }} />
                                <span style={{ fontSize: "11px", color: "#8b949e", fontFamily: "JetBrains Mono, monospace" }}>{formatVideoDuration(lesson.duration)}</span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

export default VideoPlayer