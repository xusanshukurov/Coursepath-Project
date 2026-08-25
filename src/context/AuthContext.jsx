import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase.Client";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {

    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [GoogleLoading, setGoogleLoading] = useState(false);

    const navigate = useNavigate();


    useEffect(() => {

        const getSession = async () => {

            const {
                data: { session },
            } = await supabase.auth.getSession();


            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();


        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (event, session) => {


                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );


        return () => {
            subscription.unsubscribe();
        };

    }, []);



    useEffect(() => {

        const getProfile = async () => {

            if (!user) {
                setProfile(null);
                return;
            }

            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) {
                console.log("PROFILE ERROR:", error);
                setProfile(null);
                return;
            }

            setProfile(data);
        };

        getProfile();

    }, [user]);


    const signUpNewUser = async ({
        email,
        password,
        firstName,
        lastName
    }) => {

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                },
            },
        });

        if (error) {
            return {
                success: false,
                error
            };
        }

        return {
            success: true,
            data
        };
    };


    const signInUser = async ({
        email,
        password
    }) => {

        try {

            const { data, error } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            if (error) {
                return {
                    success: false,
                    error
                };
            }

            return {
                success: true,
                data
            };

        } catch (error) {

            console.error(error);

            return {
                success: false,
                error
            };
        }
    };


    const signInGoogle = async () => {

        setGoogleLoading(true);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        });

        if (error) {

            console.log(error);

            setGoogleLoading(false);

            return {
                success: false,
                error
            };
        }

        return {
            success: true
        };
    };


    const signOut = async () => {

        const { error } = await supabase.auth.signOut();

        if (error) {

            console.error(
                "There was an error:",
                error
            );

            return;
        }

        setSession(null);
        setUser(null);
        setProfile(null);

        navigate("/login");
    };


    const updateProfile = async (firstName, lastName) => {

        if (!user) return;

        const { data, error } = await supabase
            .from("users")
            .update({
                first_name: firstName,
                last_name: lastName,
            })
            .eq("id", user.id)
            .select()
            .single();

        if (error) {
            console.log(error);
            return;
        }

        setProfile(data);
    };



    return (
        <AuthContext.Provider
            value={{
                session,
                profile,
                user,
                loading,
                GoogleLoading,
                signUpNewUser,
                signInUser,
                signInGoogle,
                signOut,
                updateProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    return useContext(AuthContext);
};