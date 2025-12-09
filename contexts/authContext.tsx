import { auth } from "@/config/firebase";
import { AuthContextType, UserType } from "@/constants/types";
import { router } from "expo-router";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

// Create the context with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<UserType>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            //console.log("firebase user: ", firebaseUser)
            if(firebaseUser){
                setUser({
                    uid: firebaseUser?.uid,
                    email: firebaseUser?.email,
                    name: firebaseUser?.displayName
                });
                //router.replace("/(home)")
            }else{
                setUser(null);
                router.replace("/(auth)/login");
            }
        });

        return ()=> unsub();
    }, [])

    const login = async(email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch(error: any) {
            console.log("Login error:", error);
            return { success: false, msg: "An error occurred, please try again" };
        }
    };

    const contextValue: AuthContextType = {
        user,
        setUser,
        login,
    };

    return ( 
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );

};


export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if(!context) {
        // Fixed the typo in the error message
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};