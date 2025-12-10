import { TypoProps } from '@/data/types';
import { useFontFamily } from '@/hooks/fonts';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';

const Typo = ({
    size,
    color,
    fontWeight = '400',
    children,
    style,
    textProps = {}
}: TypoProps) => {
    const fontFamily = useFontFamily();

    const textStyle: TextStyle = {
        fontSize: size? verticalScale(size): verticalScale(18),
        color,
        fontWeight,
        fontFamily,
    };

    // Flatten and merge styles - style prop should override textStyle
    const flattenedStyle = StyleSheet.flatten([textStyle, style]);

    return (
        <Text style={flattenedStyle} {...textProps}>
            {children}
        </Text>
    );
};

export default Typo;

const styles = StyleSheet.create({});