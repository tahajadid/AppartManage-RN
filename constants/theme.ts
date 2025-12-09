import { scale, verticalScale } from "@/utils/styling";

export const colors = {
    primary: "#30AEC7",
    primaryLight: "#0ea5e9",
    primaryDark: "#0369a1",
    text: "#fff",
    textLight: "#e5e5e5",
    textLighter: "#d4d4d4",
    white: "#fff",
    black: "#000",
    rose: "#ef4444",
    redClose: "#c85250",
    green: "#16a34a",
    neutral50: "#fafafa",
    neutral100: "#f5f5f5",
    neutral200: "#e5e5e5",
    neutral300: "#d4d4d4",
    neutral350: "#CCCCCC",
    neutral400: "#a3a3a3",
    neutral500: "#737373",
    neutral600: "#525252",
    neutral700: "#404040",
    neutral800: "#262626",
    neutral900: "#171717",
    brightOrange: "#FFAC1C",
};

export const lightTheme = {
    // primary colors
    screenBackground: "#EDEDED",
    primary: "#427DBD",
    primaryLight: "#6DA6E3",
    primaryDark: "#3269A6",
    unselectedPrimary : "#91b8e6",

    primaryButton : "#F2720A",
    primaryButtonLight : "#FA973E",
    primaryButtonDark : "#F2720A",

    titleText: "#141414",
    subtitleText: "#202021",

    text: "#000",
    descriptionText: "#525252",
    textLight: "#e5e5e5",
    textLighter: "#e5e5e5",
    blueText: "#1982A1",
    primarySelection: "#7cb5c2",

    // common colors
    neutral900: "#F9F9F9",
    neutral850: "#f0f0f0",
    neutral800: "#f5f5f5",
    neutral700: "#e5e5e5",
    neutral600: "#d4d4d4",
    neutral500: "#CCCCCC",
    neutral400: "#a3a3a3",
    neutral350: "#737373",
    neutral300: "#525252",
    neutral200: "#404040",
    neutral150: "#2E2E2E",
    neutral100: "#1F1E1E",
    neutral50: "#121010",

    // general colors
    rose: "#ef4444",
    redClose: "#c85250",
    green: "#16a34a",
    white: "#fff",
    black: "#000",
    brightOrange: "#FFAC1C",
    gold: "#fdbf00",
    loginBackground:"#D3E2F0",

    // blue color
    blue100 :"#B6E8F2", 
    blue200 :"#87E3FF",
    blue300 :"#2098BD",
    blue400: "#136C87",

    blueGrey: "#CEE5EB",
    transactionItemBackground: "#d4d4d4",
    incomeLabelColor: "#404040",
    incomeIconColor: "#CCCCCC",
    searchIcon: "#e5e5e5",
    searchIconBackground: "#a3a3a3",
    greenAdd: "#008000",
    greenAddHover: "#8efa8e",
    tabBarBackground: "#404040",
    faceIdBackground: "#1982A133",
    inputBorder:"#52525233"

  };
  
  export const darkTheme = {
    // primary colors
    screenBackground: "#0F0F0F",
    primary: "#3269A6",
    primaryLight: "#427DBD",
    primaryDark: "#3269A6",
    unselectedPrimary : "#91b8e6",

    titleText: "#f5f5f7",
    subtitleText: "#e8e8ed",


    primaryButton : "#FA973E",
    primaryButtonLight : "#FA973E",
    primaryButtonDark : "#F2720A",
    
    text: "#fff",
    descriptionText: "#d4d4d4",
    textLight: "#e5e5e5",
    textLighter: "#d4d4d4",
    blueText: "#36BEDA",
    primarySelection: "#8fccd9",
    loginBackground:"#AFCDED",

    // common colors
    neutral900: "#121010",
    neutral850: "#1F1E1E",
    neutral800: "#2E2E2E",
    neutral700: "#404040",
    neutral600: "#525252",
    neutral500: "#737373",
    neutral400: "#a3a3a3",
    neutral350: "#CCCCCC",
    neutral300: "#d4d4d4",
    neutral200: "#e5e5e5",
    neutral150: "#f5f5f5",
    neutral100: "#f0f0f0",
    neutral50: "#F9F9F9",

    // general colors
    rose: "#ef4444",
    redClose: "#c85250",
    green: "#16a34a",
    white: "#fff",
    black: "#000",
    brightOrange: "#FFAC1C",
    gold: "#fdbf00",

    // blue color
    blue100 :"#136C87", 
    blue200 :"#2098BD",
    blue300 :"#87E3FF",
    blue400: "#B6E8F2",

    blueGrey: "#A9E4F5",
    transactionItemBackground: "#262626",
    incomeLabelColor: "#404040",
    incomeIconColor: "#CCCCCC",
    searchIcon: "#e5e5e5",
    searchIconBackground: "#a3a3a3",
    greenAdd: "#008000",
    greenAddHover: "#8efa8e",
    tabBarBackground: "#737373",
    faceIdBackground: "#30AEC733",
    inputBorder:"#d4d4d444"
  };


export const spacingX = {
    _1: scale(1),
    _3: scale (3),
    _5: scale(5), 
    _7: scale(7), 
    _8: scale(8), 
    _9: scale(9), 
    _10: scale(10),
    _12: scale(12),
    _15: scale(15),
    _16: scale(16),
    _20: scale(20),
    _24: scale(24),
    _25: scale(25),
    _30: scale (30),
    _32: scale (32),
    _35: scale (35),
    _40: scale (40),
    _50: scale (50),
    _60: scale(60),
};


export const spacingY = {
    _1: verticalScale(1),
    _5: verticalScale(5),
    _7: verticalScale(7), 
    _8: verticalScale(8), 
    _10: verticalScale(10), 
    _12: verticalScale(12),
    _15: verticalScale(15),
    _16: verticalScale(16),
    _17: verticalScale(17), 
    _20: verticalScale (20), 
    _24: verticalScale(24),
    _25: verticalScale(25),
    _30: verticalScale (30), 
    _32: verticalScale (32), 
    _35: verticalScale (35),
    _40: verticalScale (40),
    _50: verticalScale (50),
    _60: verticalScale(60),
};

export const radius = {
    _1: verticalScale(1),
    _3: verticalScale(3),
    _4: verticalScale(4),
    _5: verticalScale(5),
    _6: verticalScale(6),
    _8: verticalScale(8),
    _10: verticalScale(10), 
    _12: verticalScale(12),
    _15: verticalScale(15),
    _16: verticalScale(16),
    _17: verticalScale(17), 
    _20: verticalScale (20), 
    _30: verticalScale (30), 
};
