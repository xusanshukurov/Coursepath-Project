import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase.Client";
import { useAuth } from "./AuthContext";
import { useCourse } from "./CourseContex";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {

    const { user } = useAuth();

    const [myCourses, setMyCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [courseCount, setCourseCount] = useState(0);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [totalDuration, setTotalDuration] = useState(0);
    const [loading, setLoading] = useState(false);



    const getMyCourses = async () => {

        if (!user) return;

        setLoading(true);

        const { data, error } = await supabase
            .from("enrollments")
            .select(`
            *,
            courses(
                *,
                lessons(
                    *,
                    lesson_resources(*)
                )
            )
        `)
            .eq("user_id", user.id);

        if (error) {
            console.log(error);
            setLoading(false);
            return;
        }

        setMyCourses(data || []);
        calculateDashboard(data || []);


        setLoading(false);
    };

    const getRecommendedCourses = async () => {
        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .limit(2);

        if (error) {
            console.log(error);
            return;
        }

        setRecommendedCourses(data || []);
    };

    useEffect(() => {

        if (user) {
            getMyCourses();
        }

        getRecommendedCourses();

    }, [user]);


    const calculateDashboard = async (courses) => {

        const { data } = await supabase
            .from("user_lesson_progress")
            .select("watch_time")
            .eq("user_id", user.id);


        const totalSeconds = (data || []).reduce(
            (sum, item) => sum + (item.watch_time || 0),
            0
        );

        setCourseCount(courses.length);
        setTotalDuration(totalSeconds);
    };


    const formatDuration = () => {
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);
        const seconds = totalDuration % 60;

        if (hours > 0) {
            return minutes > 0
                ? `${hours}h ${minutes}m`
                : `${hours}h`;
        }

        if (minutes > 0) {
            return seconds > 0
                ? `${minutes}m ${seconds}s`
                : `${minutes}m`;
        }

        return `${seconds}s`;
    };

    const completeLesson = async (lessonId, courseId) => {

        const { error } = await supabase
            .from("user_lesson_progress")
            .upsert({
                user_id: user.id,
                lesson_id: lessonId,
                completed: true,
                completed_at: new Date().toISOString()
            });

        if (error) {
            console.log(error);
            return;
        }

        await updateCourseProgress(courseId);

        await getMyCourses();

    };

    const updateCourseProgress = async (courseId) => {

        const { data, error } = await supabase.rpc(
            "update_course_progress",
            {
                p_user_id: user.id,
                p_course_id: courseId
            }
        );

        if (error) {
            console.log(error);
            return;
        }

        return data;

    };

    const updateLessonProgress = async (
        lessonId,
        currentTime,
        duration,
        courseId
    ) => {

        const completed = currentTime >= duration * 0.95;

        const { error } = await supabase
            .from("user_lesson_progress")
            .upsert({
                user_id: user.id,
                lesson_id: lessonId,
                watch_time: Math.floor(currentTime),
                last_position: Math.floor(currentTime),
                completed,
                completed_at: completed
                    ? new Date().toISOString()
                    : null
            });

        if (error) {
            console.log(error);
            return;
        }

        if (completed) {

            await updateCourseProgress(courseId);

            await getMyCourses();

        }

    };


    return (
        <DashboardContext.Provider value={{ loading, myCourses, setMyCourses, recommendedCourses, courseCount, totalDuration, formatDuration, completeLesson, getMyCourses }}>
            {children}
        </DashboardContext.Provider>
    )


}


export const useDashboard = () => {

    return useContext(DashboardContext);

}