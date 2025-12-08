import { radius, spacingX } from '@/constants/theme';
import { InputProps } from '@/constants/types';
import useThemeColors from '@/contexts/useThemeColors';
import { useFontFamily } from '@/hooks/fonts';
import { verticalScale } from '@/utils/styling';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const Input = (props: InputProps) => {
    // colors hook
    const colors = useThemeColors();
    const fontFamily = useFontFamily();

    return (
      <View style={[styles.container,{ borderColor: colors.inputBorder }, props.containerStyle && props.containerStyle ]} >

          {props.icon && props.icon}

        <TextInput
          style={[styles.input , props.inputStyle, {color: colors.text, fontFamily}]} 
          placeholderTextColor={colors.neutral400}
          ref={props.inputRef && props.inputRef}
          {...props}
        />
        
      </View>
    )
}

export default Input;

const styles = StyleSheet.create({
    container : {
        flexDirection: "row",
        height: verticalScale(54),
        borderWidth: 1,
        borderRadius: radius._10,
        borderCurve: "continuous",
        paddingHorizontal: spacingX._15,
        gap: spacingX._10,
    },
    input : {
        flex: 1,
        fontSize: verticalScale(14),
    }

});
