import { useEffect, useState } from "react";
import {
    ChevronLeft, Plus, RefreshCw, Trash2, AlertTriangle, X,
    Clock, Eye, GripVertical, CheckCircle2, Upload, ShieldCheck, Video,
    FolderPlus, Loader2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourseManagement } from "../context/CourseManagementContext";
import { useCourse } from "../context/CourseContex";
import { toast } from "sonner";

export function VideoManagement() {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [replaceTarget, setReplaceTarget] = useState(null);
    const [replaceTitle, setReplaceTitle] = useState("");
    const [replaceVideoFile, setReplaceVideoFile] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const [showResourceModal, setShowResourceModal] = useState(null);
    const [resourceName, setResourceName] = useState("");
    const [resourceType, setResourceType] = useState("code");
    const [notes, setNotes] = useState("");
    const [resourceFile, setResourceFile] = useState(null);

    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [newLessonVideo, setNewLessonVideo] = useState(null);
    const [newLessonVideoInfo, setNewLessonVideoInfo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { slug } = useParams();
    const navigate = useNavigate();

    const {
        getCourseBySlug,
        selectedCourse,
        lessons,
        loading,
        createLesson,
        replaceLessonVideo,
        deleteLesson,
        createLessonResource,
        uploadResourceFile,
        getVideoMetadata
    } = useCourseManagement();

    const { formatVideoDuration } = useCourse();

    useEffect(() => {
        if (slug) {
            getCourseBySlug(slug);
        }
    }, [slug]);

    const totalCourseViews = (lessons || []).reduce(
        (sum, lesson) => sum + (lesson.viewsCount || lesson.views || 0),
        0
    );

    const formatFileSize = (bytes) => {
        if (!bytes) return "0 MB";
        const mb = bytes / (1024 * 1024);
        return mb >= 1000 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
    };

    const handleLessonVideoSelect = async (file) => {
        if (!file) return;

        if (!file.type.startsWith("video/")) {
            toast.error("Faqat video fayl tanlang (MP4, MOV, WebM)");
            return;
        }

        if (file.size > 500 * 1024 * 1024) {
            toast.error("Video hajmi 500 MB dan oshmasligi kerak");
            return;
        }

        setNewLessonVideo(file);

        try {
            const metadata = await getVideoMetadata(file);
            setNewLessonVideoInfo({
                size: file.size,
                duration: metadata.duration,
            });
        } catch (error) {
            console.log("Metadata error:", error);
        }
    };

    const handleCreateLesson = async () => {
        if (!newLessonTitle.trim()) {
            toast.error("Dars nomini kiriting");
            return;
        }

        if (!newLessonVideo) {
            toast.error("Video fayl tanlang");
            return;
        }

        if (!selectedCourse?.id) {
            toast.error("Kurs ma'lumotlari yuklanmadi");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Video va dars saqlanmoqda...");

        try {
            await createLesson({
                courseId: selectedCourse.id,
                title: newLessonTitle.trim(),
                videoFile: newLessonVideo,
            });

            toast.success("Yangi dars muvaffaqiyatli qo'shildi! 🎉", { id: toastId });
            setNewLessonTitle("");
            setNewLessonVideo(null);
            setNewLessonVideoInfo(null);
            setShowAddModal(false);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Videoni yuklashda xatolik yuz berdi", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!id) return;
        setIsSubmitting(true);
        const toastId = toast.loading("Dars o'chirilmoqda...");
        try {
            const res = await deleteLesson(id, selectedCourse?.id);
            if (res) {
                toast.success("Dars o'chirildi", { id: toastId });
            } else {
                toast.error("Darsni o'chirishda xatolik", { id: toastId });
            }
            setDeleteTarget(null);
        } catch (error) {
            toast.error(error.message || "Xatolik yuz berdi", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReplaceVideoSubmit = async () => {
        if (!replaceTarget) return;

        if (!replaceTitle.trim() && !replaceVideoFile) {
            toast.error("Dars nomi yoki yangi video fayl kiriting");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("O'zgartirishlar saqlanmoqda...");

        try {
            await replaceLessonVideo({
                lessonId: replaceTarget.id,
                title: replaceTitle.trim(),
                newVideoFile: replaceVideoFile,
                courseId: selectedCourse?.id
            });
            toast.success("Dars va video yangilandi! 🚀", { id: toastId });
            setReplaceTarget(null);
            setReplaceTitle("");
            setReplaceVideoFile(null);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Videoni almashtirishda xatolik", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateResourceSubmit = async () => {
        if (!showResourceModal?.id) return;
        if (!resourceName.trim()) {
            toast.error("Manba nomini kiriting");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Manba qo'shilmoqda...");

        try {
            let finalUrl = "";
            let fileSize = 0;

            if (resourceType === "notes") {
                if (!notes.trim()) {
                    toast.error("Havola (link) kiriting");
                    setIsSubmitting(false);
                    return;
                }
                finalUrl = notes.trim();
            } else {
                if (!resourceFile) {
                    toast.error("Fayl tanlang");
                    setIsSubmitting(false);
                    return;
                }
                fileSize = resourceFile.size;
                finalUrl = await uploadResourceFile(resourceFile, showResourceModal.id);
            }

            await createLessonResource({
                lessonId: showResourceModal.id,
                title: resourceName.trim(),
                fileType: resourceType,
                fileUrl: finalUrl,
                fileSize: fileSize,
            });

            toast.success("Manba muvaffaqiyatli qo'shildi! 📁", { id: toastId });
            setShowResourceModal(null);
            setResourceName("");
            setResourceFile(null);
            setNotes("");
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Manba qo'shishda xatolik", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6" style={{ fontFamily: "Inter, sans-serif" }}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-6">
                <button
                    onClick={() => navigate('/boshqaruv')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg flex-shrink-0 active:scale-95 transition-all self-start"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#8b949e", cursor: "pointer" }}
                >
                    <ChevronLeft size={15} />
                    <span style={{ fontSize: "13px" }}>Orqaga</span>
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <ShieldCheck size={13} style={{ color: "#a78bfa" }} />
                        <span style={{ color: "#a78bfa", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Video Boshqaruvi</span>
                    </div>
                    <h1 style={{ color: "#e6edf3", fontSize: "clamp(16px,4vw,22px)", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selectedCourse?.title || "Kurs yuklanmoqda..."}
                    </h1>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                        <div className="flex items-center gap-1">
                            <Video size={12} style={{ color: "#8b949e" }} />
                            <span style={{ color: "#8b949e", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
                                {lessons?.length || 0} Videolar
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye size={12} style={{ color: "#8b949e" }} />
                            <span style={{ color: "#8b949e", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>
                                {totalCourseViews.toLocaleString()} Ko'rilgan
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl w-full sm:w-auto flex-shrink-0 active:scale-95 transition-all"
                    style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                    <Plus size={15} /> Yangi Video
                </button>
            </div>

            {loading && lessons.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-blue-500" />
                </div>
            ) : lessons.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border border-dashed border-gray-800" style={{ background: "#161b22" }}>
                    <Video size={40} className="mx-auto mb-3 text-gray-500" />
                    <h3 style={{ color: "#e6edf3", fontSize: "16px", fontWeight: 600 }}>Hali videolar mavjud emas</h3>
                    <p style={{ color: "#8b949e", fontSize: "13px", marginTop: "4px" }}>Birinchi dars videoni qo'shish uchun yuqoridagi tugmani bosing</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {lessons.map((lesson, idx) => (
                        <div
                            key={lesson.id}
                            className="rounded-xl p-4 transition-colors duration-100"
                            style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                                    <GripVertical size={14} style={{ color: "#8b949e", cursor: "grab" }} />
                                    <span style={{ color: "#8b949e", fontSize: "11px", fontFamily: "JetBrains Mono, monospace" }}>{idx + 1}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <CheckCircle2 size={15} style={{ color: "#10b981", flexShrink: 0 }} />
                                        <span style={{ color: "#e6edf3", fontSize: "14px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {lesson.title}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} style={{ color: "#8b949e" }} />
                                            <span style={{ color: "#8b949e", fontSize: "12px", fontFamily: "JetBrains Mono, monospace" }}>
                                                {formatVideoDuration(lesson.duration)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Eye size={12} style={{ color: "#8b949e" }} />
                                            <span style={{ color: "#8b949e", fontSize: "12px", fontFamily: "JetBrains Mono, monospace" }}>
                                                {(lesson.viewsCount || lesson.views || 0).toLocaleString()} Ko'rilgan
                                            </span>
                                        </div>
                                        {lesson.video_size > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <Video size={12} style={{ color: "#8b949e" }} />
                                                <span style={{ color: "#8b949e", fontSize: "12px", fontFamily: "JetBrains Mono, monospace" }}>
                                                    {formatFileSize(lesson.video_size)}
                                                </span>
                                            </div>
                                        )}
                                        <span className="px-2 py-0.5 rounded capitalize" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: "10px", fontWeight: 600 }}>
                                            published
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4 sm:pl-7">
                                <button
                                    onClick={() => {
                                        setReplaceTarget(lesson);
                                        setReplaceTitle(lesson.title || "");
                                        setReplaceVideoFile(null);
                                    }}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg sm:flex-1 active:scale-95 transition-all"
                                    style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#58a6ff", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                                >
                                    <RefreshCw size={13} /> Videoni almashtirish
                                </button>
                                <button
                                    onClick={() => {
                                        setShowResourceModal(lesson);
                                        setResourceName("");
                                        setResourceFile(null);
                                        setNotes("");
                                    }}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg sm:flex-1 active:scale-95 transition-all"
                                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.28)", color: "#10b981", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                                >
                                    <FolderPlus size={14} /> <span className="hidden sm:inline">Manba qo'shish</span><span className="sm:hidden">Manba</span>
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(lesson.id)}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg sm:flex-1 active:scale-95 transition-all"
                                    style={{ background: "rgba(248,81,73,0.08)", border: "1px solid rgba(248,81,73,0.22)", color: "#f85149", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}
                                >
                                    <Trash2 size={13} /> O'chirish
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {deleteTarget && (
                <MobileModal onClose={() => !isSubmitting && setDeleteTarget(null)}>
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(248,81,73,0.12)", border: "1px solid rgba(248,81,73,0.3)" }}>
                            <AlertTriangle size={24} style={{ color: "#f85149" }} />
                        </div>
                        <div>
                            <h3 style={{ color: "#e6edf3", fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>Darsni o'chirmoqchimisiz?</h3>
                            <p style={{ color: "#8b949e", fontSize: "13px", lineHeight: 1.6 }}>
                                "<strong style={{ color: "#e6edf3" }}>{lessons.find((v) => v.id === deleteTarget)?.title}</strong>" darsi va uning videosi butunlay o'chiriladi.
                            </p>
                        </div>
                        <div className="flex gap-3 w-full">
                            <button
                                disabled={isSubmitting}
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-3 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c9d1d9", fontSize: "14px", cursor: "pointer" }}
                            >
                                Bekor qilish
                            </button>
                            <button
                                disabled={isSubmitting}
                                onClick={() => handleDelete(deleteTarget)}
                                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                                style={{ background: "#f85149", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "O'chirish"}
                            </button>
                        </div>
                    </div>
                </MobileModal>
            )}

            {replaceTarget && (
                <MobileModal onClose={() => !isSubmitting && setReplaceTarget(null)}>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 style={{ color: "#e6edf3", fontSize: "17px", fontWeight: 700 }}>Dars va videoni almashtirish</h3>
                            <button onClick={() => !isSubmitting && setReplaceTarget(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8b949e" }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div>
                            <label style={{ color: "#8b949e", fontSize: "12px", display: "block", marginBottom: "6px" }}>Dars nomi</label>
                            <input
                                value={replaceTitle}
                                onChange={(e) => setReplaceTitle(e.target.value)}
                                placeholder="Dars nomini kiriting..."
                                disabled={isSubmitting}
                                style={{ width: "100%", background: "#1c2128", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "#e6edf3", fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }}
                            />
                        </div>

                        <div>
                            <label style={{ color: "#8b949e", fontSize: "12px", display: "block", marginBottom: "6px" }}>Yangi video fayl (ixtiyoriy)</label>
                            <label className="flex flex-col items-center justify-center py-6 px-4 rounded-xl cursor-pointer transition-colors" style={{ background: replaceVideoFile ? "rgba(16,185,129,0.08)" : "rgba(59,130,246,0.05)", border: replaceVideoFile ? "2px dashed rgba(16,185,129,0.4)" : "2px dashed rgba(59,130,246,0.3)" }}>
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) setReplaceVideoFile(f);
                                    }}
                                />
                                {replaceVideoFile ? (
                                    <div className="text-center flex flex-col items-center gap-1">
                                        <CheckCircle2 size={28} style={{ color: "#10b981" }} />
                                        <span style={{ color: "#10b981", fontSize: "13px", fontWeight: 600 }}>{replaceVideoFile.name}</span>
                                        <span style={{ color: "#8b949e", fontSize: "12px" }}>{formatFileSize(replaceVideoFile.size)}</span>
                                    </div>
                                ) : (
                                    <div className="text-center flex flex-col items-center">
                                        <Upload size={24} style={{ color: "#3b82f6", marginBottom: "8px" }} />
                                        <span style={{ color: "#58a6ff", fontSize: "13px", fontWeight: 500 }}>Videoni almashtirish uchun bosing</span>
                                        <span style={{ color: "#8b949e", fontSize: "11px", marginTop: "2px" }}>MP4, MOV, WebM · Max 500 MB</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button
                                disabled={isSubmitting}
                                onClick={() => setReplaceTarget(null)}
                                className="flex-1 py-3 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c9d1d9", fontSize: "14px", cursor: "pointer" }}
                            >
                                Bekor qilish
                            </button>
                            <button
                                disabled={isSubmitting || (!replaceTitle.trim() && !replaceVideoFile)}
                                onClick={handleReplaceVideoSubmit}
                                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                                style={{
                                    background: (replaceTitle.trim() || replaceVideoFile) ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "rgba(255,255,255,0.1)",
                                    opacity: (replaceTitle.trim() || replaceVideoFile) ? 1 : 0.5,
                                    border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: (replaceTitle.trim() || replaceVideoFile) ? "pointer" : "not-allowed"
                                }}
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Saqlash va almashtirish"}
                            </button>
                        </div>
                    </div>
                </MobileModal>
            )}

            {showAddModal && (
                <MobileModal onClose={() => !isSubmitting && setShowAddModal(false)}>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 style={{ color: "#e6edf3", fontSize: "17px", fontWeight: 700 }}>Yangi dars va video qo'shish</h3>
                            <button onClick={() => !isSubmitting && setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8b949e" }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div>
                            <label style={{ color: "#8b949e", fontSize: "12px", display: "block", marginBottom: "6px" }}>Dars nomi *</label>
                            <input
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                placeholder="masalan: 01. Front-endga kirish"
                                disabled={isSubmitting}
                                style={{ width: "100%", background: "#1c2128", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "#e6edf3", fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }}
                                onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; }}
                                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                            />
                        </div>

                        <div>
                            <label style={{ color: "#8b949e", fontSize: "12px", display: "block", marginBottom: "6px" }}>Video fayl *</label>
                            <label
                                className="flex flex-col items-center justify-center py-8 px-4 rounded-xl cursor-pointer transition-colors"
                                style={{
                                    background: newLessonVideo ? "rgba(16,185,129,0.08)" : "rgba(59,130,246,0.05)",
                                    border: newLessonVideo ? "2px dashed rgba(16,185,129,0.4)" : "2px dashed rgba(59,130,246,0.3)"
                                }}
                            >
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    disabled={isSubmitting}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleLessonVideoSelect(file);
                                    }}
                                />
                                {newLessonVideo ? (
                                    <div className="text-center flex flex-col items-center gap-1">
                                        <CheckCircle2 size={32} style={{ color: "#10b981" }} />
                                        <span style={{ color: "#10b981", fontSize: "14px", fontWeight: 600 }}>{newLessonVideo.name}</span>
                                        <div className="flex items-center gap-3 mt-1" style={{ color: "#8b949e", fontSize: "12px" }}>
                                            <span>Hajmi: {formatFileSize(newLessonVideo.size)}</span>
                                            {newLessonVideoInfo?.duration > 0 && (
                                                <span>• Davomiyligi: {formatVideoDuration(newLessonVideoInfo.duration)}</span>
                                            )}
                                        </div>
                                        <span className="mt-2 text-xs text-blue-400 underline">Boshqa video tanlash</span>
                                    </div>
                                ) : (
                                    <div className="text-center flex flex-col items-center">
                                        <Upload size={28} style={{ color: "#3b82f6", marginBottom: "10px" }} />
                                        <span style={{ color: "#58a6ff", fontSize: "14px", fontWeight: 500 }}>Videoni tanlash uchun bosing</span>
                                        <span style={{ color: "#8b949e", fontSize: "12px", marginTop: "4px" }}>MP4, MOV, WebM · Max 500 MB</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="flex gap-3 mt-2">
                            <button
                                disabled={isSubmitting}
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-3 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c9d1d9", fontSize: "14px", cursor: "pointer" }}
                            >
                                Bekor qilish
                            </button>
                            <button
                                disabled={isSubmitting || !newLessonTitle.trim() || !newLessonVideo}
                                onClick={handleCreateLesson}
                                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                                style={{
                                    background: (newLessonTitle.trim() && newLessonVideo) ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "rgba(255,255,255,0.1)",
                                    opacity: (newLessonTitle.trim() && newLessonVideo) ? 1 : 0.5,
                                    border: "none", color: "#fff", fontSize: "14px", fontWeight: 600,
                                    cursor: (newLessonTitle.trim() && newLessonVideo) ? "pointer" : "not-allowed"
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Yuklanmoqda...</span>
                                    </>
                                ) : (
                                    "Videoni qo'shish"
                                )}
                            </button>
                        </div>
                    </div>
                </MobileModal>
            )}

            {showResourceModal && (
                <MobileModal onClose={() => !isSubmitting && setShowResourceModal(null)}>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 style={{ color: "#e6edf3", fontSize: "17px", fontWeight: 700 }}>Yangi manba qo'shish</h3>
                            <button onClick={() => !isSubmitting && setShowResourceModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8b949e" }}>
                                <X size={18} />
                            </button>
                        </div>

                        <FormField
                            label="Resurs nomi *"
                            value={resourceName}
                            onChange={(val) => setResourceName(val)}
                            placeholder="masalan: 01-dars-manbalari.zip"
                        />

                        <div>
                            <label style={{ color: "#8b949e", fontSize: "12px", display: "block", marginBottom: "6px" }}>Manba turi</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: "code", label: "Code (ZIP)" },
                                    { id: "pdf", label: "PDF Hujjat" },
                                    { id: "notes", label: "GitHub / Link" }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setResourceType(t.id)}
                                        className="flex-1 py-2.5 rounded-lg capitalize transition-all"
                                        style={{
                                            background: resourceType === t.id ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                                            border: `1px solid ${resourceType === t.id ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)"}`,
                                            color: resourceType === t.id ? "#58a6ff" : "#8b949e",
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            cursor: "pointer"
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {resourceType === "notes" ? (
                            <FormField
                                label="GitHub yoki veb sahifa havolasi *"
                                value={notes}
                                onChange={(val) => setNotes(val)}
                                placeholder="https://github.com/username/repository"
                            />
                        ) : (
                            <label className="flex flex-col items-center justify-center py-6 px-4 rounded-xl cursor-pointer transition-colors" style={{ background: resourceFile ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)", border: resourceFile ? "2px dashed rgba(16,185,129,0.4)" : "2px dashed rgba(255,255,255,0.1)" }}>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            setResourceFile(f);
                                            if (!resourceName) setResourceName(f.name);
                                        }
                                    }}
                                />
                                {resourceFile ? (
                                    <div className="text-center flex flex-col items-center gap-1">
                                        <CheckCircle2 size={24} style={{ color: "#10b981" }} />
                                        <span style={{ color: "#10b981", fontSize: "13px", fontWeight: 600 }}>{resourceFile.name}</span>
                                        <span style={{ color: "#8b949e", fontSize: "11px" }}>{formatFileSize(resourceFile.size)}</span>
                                    </div>
                                ) : (
                                    <div className="text-center flex flex-col items-center">
                                        <FolderPlus size={24} style={{ color: "#8b949e", marginBottom: "8px" }} />
                                        <span style={{ color: "#c9d1d9", fontSize: "13px" }}>Fayl tanlash uchun bosing</span>
                                        <span style={{ color: "#8b949e", fontSize: "11px", marginTop: "4px" }}>ZIP, PDF · Max 50 MB</span>
                                    </div>
                                )}
                            </label>
                        )}

                        <div className="flex gap-3 mt-2">
                            <button
                                disabled={isSubmitting}
                                onClick={() => setShowResourceModal(null)}
                                className="flex-1 py-3 rounded-xl"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c9d1d9", fontSize: "14px", cursor: "pointer" }}
                            >
                                Bekor qilish
                            </button>
                            <button
                                disabled={isSubmitting || !resourceName.trim()}
                                onClick={handleCreateResourceSubmit}
                                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                                style={{
                                    background: resourceName.trim() ? "rgba(16,185,129,0.85)" : "rgba(255,255,255,0.1)",
                                    opacity: resourceName.trim() ? 1 : 0.5,
                                    border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: resourceName.trim() ? "pointer" : "not-allowed"
                                }}
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Manbani saqlash"}
                            </button>
                        </div>
                    </div>
                </MobileModal>
            )}
        </div>
    );
}

function MobileModal({ children, onClose }) {
    return (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={onClose}>
            <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
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
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{ width: "100%", background: "#1c2128", border: `1px solid ${focused ? "#3b82f6" : "rgba(255,255,255,0.1)"}`, borderRadius: "10px", padding: "12px", color: "#e6edf3", fontSize: "14px", fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
            />
        </div>
    );
}
