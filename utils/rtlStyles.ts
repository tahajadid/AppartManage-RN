import { TextStyle, ViewStyle } from 'react-native';

/**
 * Creates RTL-aware styles that automatically flip based on direction
 */
export const createRTLStyles = (isRTL: boolean) => {
  return {
    /**
     * Text style that aligns based on RTL
     */
    text: (baseStyle?: TextStyle): TextStyle => ({
      ...baseStyle,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    }),

    /**
     * Container style that aligns children based on RTL
     */
    container: (baseStyle?: ViewStyle): ViewStyle => ({
      ...baseStyle,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    }),

    /**
     * Row style that reverses direction based on RTL
     */
    row: (baseStyle?: ViewStyle): ViewStyle => ({
      ...baseStyle,
      flexDirection: isRTL ? 'row-reverse' : 'row',
    }),

    /**
     * Input style with RTL text alignment
     */
    input: (baseStyle?: TextStyle): TextStyle => ({
      ...baseStyle,
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    }),
  };
};

/**
 * Helper to get margin/padding values based on RTL
 */
export const getRTLMargin = (isRTL: boolean, left: number, right: number) => {
  return {
    marginLeft: isRTL ? right : left,
    marginRight: isRTL ? left : right,
  };
};

export const getRTLPadding = (isRTL: boolean, left: number, right: number) => {
  return {
    paddingLeft: isRTL ? right : left,
    paddingRight: isRTL ? left : right,
  };
};

