import { createContext, useContext, useState } from "react";
import { supabase } from "../supabase.Client";
import { useAuth } from "./AuthContext";
import { useParams } from "react-router-dom";
import * as tus from "tus-js-client";

const CourseManagementContext = createContext();

export const CourseManagementProvider = ({ children }) => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth()


    const VIDEO_BUCKET = "lesson-videos";
    const RESOURCE_BUCKET = "lesson-files";


    const getCourses = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from("courses")
            .select(`
                *,
                categories(*),
                lessons(*, user_lesson_progress(id)),
                enrollments(
                    user_id,
                    progress
                )
            `)
            .order("id", { ascending: true });

        if (error) {
            const { data: fallbackData } = await supabase
                .from("courses")
                .select(`
                    *,
                    categories(*),
                    lessons(*),
                    enrollments(user_id, progress)
                `)
                .order("id", { ascending: true });

            if (fallbackData) {
                const processedFallback = fallbackData.map((course) => {
                    const totalViews = (course.lessons || []).reduce(
                        (sum, l) => sum + (l.views || 0),
                        0
                    );
                    return {
                        ...course,
                        lessonsCount: course.lessons?.length || 0,
                        studentsCount: course.enrollments?.length || 0,
                        viewsCount: totalViews,
                    };
                });
                setCourses(processedFallback);
            }
            setLoading(false);
            return;
        }

        const coursesWithData = (data || []).map((course) => {
            const totalViews = (course.lessons || []).reduce(
                (sum, l) => sum + (l.views || l.user_lesson_progress?.length || 0),
                0
            );

            return {
                ...course,
                lessonsCount: course.lessons?.length || 0,
                studentsCount: course.enrollments?.length || 0,
                viewsCount: totalViews,
            };
        });

        setCourses(coursesWithData);
        setLoading(false);
    };

    const getCourseBySlug = async (slug) => {
        setLoading(true);

        const { data, error } = await supabase
            .from("courses")
            .select(`
                *,
                categories(*),
                instructors(*),
                lessons(*, user_lesson_progress(id)),
                enrollments(user_id)
            `)
            .eq("slug", slug)
            .single();

        if (error) {
            const { data: fallbackData } = await supabase
                .from("courses")
                .select(`
                    *,
                    categories(*),
                    instructors(*),
                    lessons(*),
                    enrollments(user_id)
                `)
                .eq("slug", slug)
                .single();

            if (fallbackData) {
                const processedLessons = (fallbackData.lessons || []).map((l) => ({
                    ...l,
                    viewsCount: l.views || 0,
                }));
                setSelectedCourse(fallbackData);
                setLessons(processedLessons);
            }
            setLoading(false);
            return fallbackData || null;
        }

        const processedLessons = (data?.lessons || []).map((l) => ({
            ...l,
            viewsCount: l.views || l.user_lesson_progress?.length || 0,
        }));

        setSelectedCourse(data);
        setLessons(processedLessons);
        setLoading(false);

        return data;
    };


    const createCourse = async ({
        title,
        level,
        is_published,
        slug,
        thumbnail
    }) => {
        if (!user) return;

        setLoading(true);

        const { data, error } = await supabase
            .from("courses")
            .insert({
                title,
                level,
                slug,
                thumbnail: thumbnail || null,
                is_published,
            })
            .select()
            .single();

        if (error) {
            console.log(error);
            setLoading(false);
            return null;
        }

        await getCourses();

        setLoading(false);

        return data;
    };


    const updateCourse = async (
        courseId,
        {
            title,
            slug,
            thumbnail,
            level,
            is_published
        }
    ) => {
        setLoading(true);

        const { data, error } = await supabase
            .from("courses")
            .update({
                title,
                slug,
                thumbnail,
                level,
                is_published,
                updated_at: new Date().toISOString(),
            })
            .eq("id", courseId)
            .select()
            .single();

        if (error) {
            console.log(error);
            setLoading(false);
            return null;
        }

        await getCourses();

        setLoading(false);

        return data;
    };


    const deleteCourse = async (courseId) => {
        setLoading(true);

        const { error } = await supabase
            .from("courses")
            .delete()
            .eq("id", courseId);

        if (error) {
            console.log(error);
            setLoading(false);
            return false;
        }

        await getCourses()

        setLoading(false);

        return true;
    };



    const getLessons = async (courseId) => {
        if (!courseId) return [];
        setLoading(true);

        const { data, error } = await supabase
            .from("lessons")
            .select(`
                *,
                user_lesson_progress(id)
            `)
            .eq("course_id", courseId)
            .order("id", { ascending: true });

        if (error) {
            const { data: fallbackData } = await supabase
                .from("lessons")
                .select("*")
                .eq("course_id", courseId)
                .order("id", { ascending: true });

            const processedFallback = (fallbackData || []).map((l) => ({
                ...l,
                viewsCount: l.views || 0,
            }));

            setLessons(processedFallback);
            setLoading(false);
            return processedFallback;
        }

        const processed = (data || []).map((l) => ({
            ...l,
            viewsCount: l.views || l.user_lesson_progress?.length || 0,
        }));

        setLessons(processed);
        setLoading(false);
        return processed;
    };



    const createLesson = async ({
        courseId,
        title,
        videoFile,
    }) => {
        if (!courseId) {
            throw new Error("Course topilmadi");
        }

        if (!title?.trim()) {
            throw new Error("Lesson nomini kiriting");
        }

        if (!videoFile) {
            throw new Error("Video tanlang");
        }

        setLoading(true);

        try {
            const video = await uploadVideo(videoFile, courseId);

            const position = (lessons?.length || 0) + 1;

            const { data, error } = await supabase
                .from("lessons")
                .insert({
                    course_id: courseId,
                    title: title.trim(),
                    video_url: video.url,
                    video_size: video.size,
                    duration: video.duration,
                    is_published: true,
                    position: position,
                })
                .select()
                .single();

            if (error) {
                console.log(error);

                await supabase.storage
                    .from(VIDEO_BUCKET)
                    .remove([video.path]);

                throw new Error(error.message || "Darsni bazaga saqlashda xatolik yuz berdi");
            }

            await getLessons(courseId);

            return data;

        } finally {
            setLoading(false);
        }
    };



    const updateLesson = async (lessonId, lessonData) => {
        setLoading(true);

        const { data, error } = await supabase
            .from("lessons")
            .update(lessonData)
            .eq("id", lessonId)
            .select()
            .single();

        if (error) {
            console.log(error);
            setLoading(false);
            return null;
        }

        setLessons((prev) =>
            prev.map((lesson) =>
                lesson.id === lessonId ? data : lesson
            )
        );

        setLoading(false);

        return data;
    };

    const replaceLessonVideo = async ({ lessonId, title, newVideoFile, courseId }) => {
        setLoading(true);
        try {
            const updateData = {};
            if (title && title.trim()) {
                updateData.title = title.trim();
            }
            if (newVideoFile) {
                const video = await uploadVideo(newVideoFile, courseId);
                updateData.video_url = video.url;
                updateData.video_size = video.size;
                updateData.duration = video.duration;
            }

            if (Object.keys(updateData).length === 0) {
                setLoading(false);
                return null;
            }

            const { data, error } = await supabase
                .from("lessons")
                .update(updateData)
                .eq("id", lessonId)
                .select()
                .single();

            if (error) throw error;
            await getLessons(courseId);
            return data;
        } finally {
            setLoading(false);
        }
    };



    const deleteLesson = async (lessonId, courseId) => {
        setLoading(true);

        const { error } = await supabase
            .from("lessons")
            .delete()
            .eq("id", lessonId);

        if (error) {
            console.log(error);
            setLoading(false);
            return false;
        }

        if (courseId) {
            await getLessons(courseId);
        } else {
            setLessons((prev) => prev.filter((l) => l.id !== lessonId));
        }

        setLoading(false);

        return true;
    };


    const createLessonResource = async ({
        lessonId,
        title,
        fileType,
        fileUrl,
        fileSize
    }) => {

        const { data, error } = await supabase
            .from("lesson_resources")
            .insert({
                lesson_id: lessonId,
                title,
                file_type: fileType,
                file_url: fileUrl,
                file_size: fileSize,
            })
            .select()
            .single();

        if (error) {
            console.log(error);
            throw error;
        }

        return data;
    };

    const uploadResourceFile = async (file, lessonId) => {
        if (!file) return null;
        const extension = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${extension}`;
        const filePath = `${lessonId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(RESOURCE_BUCKET)
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.log("Resource Upload Error:", uploadError);
            if (uploadError.message?.includes("Bucket not found") || uploadError.error === "Bucket not found") {
                throw new Error("Supabase Storage'da 'lesson-files' nomli bucket topilmadi. Supabase dashboard'da yaratishingiz kerak.");
            }
            throw new Error(uploadError.message || "Faylni yuklashda xatolik");
        }

        const { data: { publicUrl } } = supabase.storage
            .from(RESOURCE_BUCKET)
            .getPublicUrl(filePath);

        return publicUrl;
    };


    const getVideoMetadata = (file) => {
        return new Promise((resolve) => {
            if (!file) return resolve({ duration: 0, size: 0 });

            try {
                const video = document.createElement("video");
                video.preload = "metadata";

                let handled = false;
                const cleanup = () => {
                    if (!handled) {
                        handled = true;
                        try {
                            URL.revokeObjectURL(video.src);
                        } catch (e) {}
                    }
                };

                video.onloadedmetadata = () => {
                    const duration = Math.floor(video.duration) || 0;
                    cleanup();
                    resolve({ duration, size: file.size });
                };

                video.onerror = () => {
                    cleanup();
                    resolve({ duration: 0, size: file.size });
                };

                setTimeout(() => {
                    if (!handled) {
                        cleanup();
                        resolve({ duration: 0, size: file.size });
                    }
                }, 3000);

                video.src = URL.createObjectURL(file);
            } catch (err) {
                resolve({ duration: 0, size: file.size });
            }
        });
    };


    const uploadVideo = async (file, courseId) => {
        if (!file) return null;

        if (!file.type.startsWith("video/")) {
            throw new Error("Faqat video fayl yuklash mumkin");
        }

        const maxSize = 500 * 1024 * 1024;

        if (file.size > maxSize) {
            throw new Error("Video hajmi 500 MB dan oshmasligi kerak");
        }

        const metadata = await getVideoMetadata(file);

        const extension = file.name.split(".").pop();

        const fileName = `${crypto.randomUUID()}.${extension}`;

        const filePath = `${courseId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(VIDEO_BUCKET)
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type,
            });

        if (uploadError) {
            console.log("Upload Error:", uploadError);
            if (uploadError.message?.includes("Bucket not found") || uploadError.error === "Bucket not found") {
                throw new Error("Supabase Storage'da 'lesson-videos' nomli bucket topilmadi. Supabase dashboard'da 'lesson-videos' nomli public bucket yarating.");
            }
            if (uploadError.message?.includes("row-level security") || uploadError.statusCode === "403" || uploadError.statusCode === 403) {
                throw new Error("Supabase Storage 'lesson-videos' bucketiga fayl yuklash uchun RLS ruxsati (Policy) berilmagan.");
            }
            throw new Error(uploadError.message || "Videoni yuklashda xatolik yuz berdi");
        }

        const {
            data: {
                publicUrl,
            },
        } = supabase.storage
            .from(VIDEO_BUCKET)
            .getPublicUrl(filePath);

        return {
            url: publicUrl,
            path: filePath,
            duration: metadata.duration,
            size: metadata.size,
        };
    };

    return (
        <CourseManagementContext.Provider
            value={{
                courses,
                selectedCourse,
                lessons,
                loading,

                getCourses,
                getCourseBySlug,
                getLessons,

                createCourse,
                updateCourse,
                deleteCourse,

                createLesson,
                updateLesson,
                replaceLessonVideo,
                deleteLesson,

                createLessonResource,
                uploadResourceFile,
                getVideoMetadata,
            }}
        >
            {children}
        </CourseManagementContext.Provider>
    );
};

export const useCourseManagement = () => {
    return useContext(CourseManagementContext);
};