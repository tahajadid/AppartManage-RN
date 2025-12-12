import { User } from 'firebase/auth';
import React, { ReactNode } from "react";
import {
    TextInput,
    TextInputProps,
    TextProps,
    TextStyle,
    TouchableOpacityProps,
    ViewStyle
} from "react-native";

export type ScreenWrapperProps = {
    style?: ViewStyle;
    children: React.ReactNode;
    bg?: string;
};

export type ModalWrapperProps = {
    style?: ViewStyle;
    children: React. ReactNode;
    bg?: string;
};

export type accountOptionType = {
    title: string;
    icon: React.ReactNode;
    bgColor: string;
    routeName?: any;
};

export type TypoProps = {
    size?: number;
    color?: string;
    fontWeight?: TextStyle ["fontWeight"];
    children: any | null;
    style?: TextStyle;
    textProps?: TextProps;
};

export type IconProps = { name: string;
    color?: string;
    size?: number;
    strokeWidth?: number;
    fill?: string;
};

export type HeaderProps = {
    title?: string;
    style?: ViewStyle;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
};

export type BackButtonProps = {
    style?: ViewStyle;
    iconSize?: number;
};

export interface InputProps extends TextInputProps {
    icon?: React. ReactNode;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    inputRef?: React.RefObject<TextInput>;
    //label?: string;
    //error?: string;
};

export interface CustomButtonProps extends TouchableOpacityProps {
    style?: ViewStyle;
    backgroundColor?: string;
    onPress?: () => void;
    loading?: boolean;
    children: React.ReactNode;
};

export type ImageUploadProps = {
    file?: any;
    onSelect: (file: any) => void;
    onClear: () => void;
    containerStyle?: ViewStyle;
    imageStyle?: ViewStyle;
    placeholder?: string;
};

export type UserType = { uid?: string;
    email?: string | null;
    name: string | null;
    image?: any;
} | null;
    
export type UserDataType = {
    name: string;
    image?: any;
};

export type AuthContextType = {
    user: UserType;
    setUser: Function;
    login: (
    email: string,
    password: string
    ) => Promise<{ success: boolean; msg?: string }>;
};

export type ResponseType = {
    success: boolean;
    data?: any;
    msg?: string;
};

export type LoadingProps = {
    sizeLoading?: "small" | "large";
    colorLoader?: string;
};

export type ToggleSwitchProps = {
    label?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
};

export interface ResidentData {
    name: string;
    monthlyFee: string;
    remainingAmount: string;
}

// Authentication Types
export interface SignInRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
}

export interface AuthResult {
    user: User | null;
    error: string | null;
}

export interface AppHeaderProps {
    title: string;
    onBack?: () => void;
    showBackButton?: boolean;
}

export  interface ActionOption {
    id: string;
    icon: React.ComponentType<any>;
    title: string;
    subtitle: string;
    route: string;
    iconColor: string;
}