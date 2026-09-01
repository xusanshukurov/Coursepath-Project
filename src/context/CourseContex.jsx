import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase.Client';
import { useDashboard } from './DashboardContext';
import { useAuth } from './AuthContext';


const CourseContext = createContext()

export function CourseContex({ children }) {

  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [CompletedCourseCount, setCompletedCourseCount] = useState(0)
  const [lessonProgress, setLessonProgress] = useState()
  const [leaderboard, setLeaderboard] = useState([]);
  const [todayWatchTime, setTodayWatchTime] = useState(0);



  const { myCourses } = useDashboard()
  const { user } = useAuth()


  useEffect(() => {
    getCourses();
  }, [user, myCourses]);

  useEffect(() => {
    const completedCourses = myCourses.filter(
      course => course.progress === 100
    ).length;

    setCompletedCourseCount(completedCourses);
  }, [courses]);

  const getCourses = async () => {
    setLoading(true);

    let coursesData = null;

    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        categories(*),
        instructors(*),
        lessons(id, views)
      `)
      .order("id", { ascending: true });

    if (error || !data) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("courses")
        .select(`
          *,
          lessons(id, views)
        `)
        .order("id", { ascending: true });

      if (fallbackError || !fallbackData) {
        console.log("Fallback courses fetch error:", fallbackError);
        setLoading(false);
        return;
      }
      coursesData = fallbackData;
    } else {
      coursesData = data;
    }

    let completedLessonIds = new Set();
    let allEnrollmentsCountMap = {};

    if (user?.id) {
      const { data: userProgressData } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (userProgressData) {
        userProgressData.forEach((p) => {
          completedLessonIds.add(p.lesson_id);
        });
      }
    }

    const { data: allEnrollments } = await supabase
      .from("enrollments")
      .select("course_id");

    if (allEnrollments) {
      allEnrollments.forEach((e) => {
        allEnrollmentsCountMap[e.course_id] =
          (allEnrollmentsCountMap[e.course_id] || 0) + 1;
      });
    }

    const coursesWithData = coursesData.map((course) => {
      const courseLessons = course.lessons || [];
      const totalLessonsCount = courseLessons.length;
      const completedInCourse = courseLessons.filter((l) =>
        completedLessonIds.has(l.id)
      ).length;

      const computedProgress =
        totalLessonsCount > 0
          ? Math.round((completedInCourse / totalLessonsCount) * 100)
          : 0;

      const reviews = course.course_reviews || [];
      const instructors = course.instructors || [];

      const averageRating =
        reviews.length > 0
          ? (
            reviews.reduce((sum, item) => sum + item.rating, 0) /
            reviews.length
          ).toFixed(1)
          : 0;

      const totalViews = courseLessons.reduce(
        (sum, l) => sum + (l.views || 0),
        0
      );

      return {
        ...course,
        progress: computedProgress,
        lessonsCount: totalLessonsCount,
        studentsCount: allEnrollmentsCountMap[course.id] || 0,
        viewsCount: totalViews,
        rating: Number(averageRating),
        reviewsCount: reviews.length,
        instructor: instructors?.full_name || course.instructor || "Admin",
      };
    });

    setCourses(coursesWithData);
    setLoading(false);
  };

  const getCourse = async (slug) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("courses")
      .select(`
          *,
          categories(*),
          instructors(*)
      `)
      .eq("slug", slug)
      .single();

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setCourse(data);
    setLoading(false);
  };

  const getLessons = async (courseId) => {
    if (!courseId) return;

    const { data: lessonsData, error: lessonsError } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("position", { ascending: true });

    if (lessonsError || !lessonsData) {
      console.log(lessonsError);
      return;
    }

    let progressMap = {};

    if (user?.id) {
      const lessonIds = lessonsData.map((l) => l.id);

      const { data: progressData } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id, completed, watch_time, last_position")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      if (progressData) {
        progressData.forEach((p) => {
          progressMap[p.lesson_id] = p;
        });
      }
    }

    const mapped = lessonsData.map((l) => {
      const p = progressMap[l.id];
      return {
        ...l,
        completed: Boolean(p?.completed),
        watch_time: p?.watch_time || 0,
        last_position: p?.last_position || 0,
      };
    });

    setLessons(mapped);
  };

  const getLesson = async (lessonId) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("lessons")
      .select(`
            *,
            lesson_resources(*)
        `)
      .eq("id", lessonId)
      .single();

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setLesson(data);
    setLoading(false);
  };


  const getLessonProgress = async (lessonId) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_lesson_progress")
      .select("*")
      .eq("lesson_id", lessonId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      return;
    }

    setLessonProgress(data);
  };

  const updateLessonProgress = async ({
    lessonId,
    watchTime,
    lastPosition,
  }) => {
    if (!user || !lessonId) return;

    const { data: existingProgress } = await supabase
      .from("user_lesson_progress")
      .select("id, completed")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (existingProgress) {
      await supabase
        .from("user_lesson_progress")
        .update({
          watch_time: watchTime,
          last_position: lastPosition,
        })
        .eq("id", existingProgress.id);
    } else {
      await supabase
        .from("user_lesson_progress")
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          watch_time: watchTime,
          last_position: lastPosition,
          completed: false,
        });
    }
  };

  const updateCourseProgress = async (courseId) => {
    if (!user || !courseId) return 0;

    const { data: courseLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", courseId);

    if (lessonsError || !courseLessons || courseLessons.length === 0) {
      return 0;
    }

    const lessonIds = courseLessons.map((l) => l.id);

    const { data: progressData, error: progressError } = await supabase
      .from("user_lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds);

    if (progressError) {
      console.log(progressError);
      return 0;
    }

    const completedLessonsCount = (progressData || []).filter(
      (p) => Boolean(p.completed)
    ).length;
    const totalLessonsCount = courseLessons.length;

    const progress =
      totalLessonsCount > 0
        ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
        : 0;

    const status =
      progress >= 100
        ? "completed"
        : progress > 0
          ? "in_progress"
          : "not_started";

    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (existingEnrollment) {
      await supabase
        .from("enrollments")
        .update({
          progress,
          status,
          completed_at: progress >= 100 ? new Date().toISOString() : null,
        })
        .eq("id", existingEnrollment.id);
    } else {
      await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress,
          status,
          completed_at: progress >= 100 ? new Date().toISOString() : null,
        });
    }

    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, progress } : c
      )
    );

    return progress;
  };

  const addXP = async (userId) => {
    const { data, error } = await supabase
      .from("users")
      .select("xp")
      .eq("id", userId)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    await supabase
      .from("users")
      .update({
        xp: (data?.xp || 0) + 20
      })
      .eq("id", userId);
  };

  const completeLesson = async (lessonId) => {
    if (!user || !lessonId) return;

    setLessons(prev =>
      prev.map(l =>
        l.id === lessonId ? { ...l, completed: true } : l
      )
    );

    await supabase
      .from("user_lesson_progress")
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      );

    const { data: currentLesson } = await supabase
      .from("lessons")
      .select("views")
      .eq("id", lessonId)
      .single();

    await supabase
      .from("lessons")
      .update({ views: (currentLesson?.views || 0) + 1 })
      .eq("id", lessonId);

    await addXP(user.id);
  };



  const getResources = async () => {
    try {
      const { data, error } = await supabase
        .from("lesson_resources")
        .select(`
        *,
        lessons(
          id,
          title
        )
      `)
        .order("id", { ascending: false });

      if (error) {
        console.log(error);
        const { data: fallbackData } = await supabase
          .from("lesson_resources")
          .select("*")
          .order("id", { ascending: false });
        setResources(fallbackData || []);
      } else {
        setResources(data || []);
      }
    } catch (err) {
      console.log(err);
    }
  };


  const formatVideoDuration = (seconds) => {

    if (!seconds || seconds <= 0) return "00:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num) => String(num).padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }

    return `${pad(minutes)}:${pad(secs)}`;
  };


  const getLeaderboard = async () => {

    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("xp", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setLeaderboard(data || []);

  };

  const getTodayWatchTime = async () => {

    if (!user) return;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("user_lesson_progress")
      .select("watch_time")
      .eq("user_id", user.id)
      .gte("updated_at", today.toISOString());

    if (error) {
      console.log(error);
      return;
    }

    const totalSeconds = data.reduce((sum, item) => {
      return sum + (item.watch_time || 0);
    }, 0);

    setTodayWatchTime(totalSeconds);

  };


  const formatStudyTime = (seconds) => {

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (h > 0) {
      return `${h}h ${m}m`;
    }

    return `${m}m`;

  };


  return (

    <CourseContext.Provider
      value={{

        loading,

        courses,
        course,
        CompletedCourseCount,

        lessons,
        lesson,
        lessonProgress,

        resources,

        leaderboard,

        getCourses,
        getCourse,
        updateCourseProgress,

        getLessons,
        getLesson,
        getLessonProgress,
        updateLessonProgress,
        completeLesson,

        formatVideoDuration,

        getResources,

        getLeaderboard,

        todayWatchTime,
        getTodayWatchTime,
        formatStudyTime,

      }}
    >
      {children}
    </CourseContext.Provider>
  )
}

export const useCourse = () => {
  return useContext(CourseContext);
};