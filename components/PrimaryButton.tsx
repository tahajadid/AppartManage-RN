import { radius } from '@/constants/theme'
import { CustomButtonProps } from '@/constants/types'
import useThemeColors from '@/contexts/useThemeColors'
import { verticalScale } from '@/utils/styling'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Loading from './Loading'

const PrimaryButton = ({
    style,
    onPress,
    backgroundColor,
    loading=false,
    children
}: CustomButtonProps) => {

    // colors hook
    const colors = useThemeColors();

    if(loading){
        return(
            <View style={[styles.button, style, {backgroundColor: backgroundColor}]}>
                <Loading colorLoader={colors.black}/>
            </View>
        )
    }
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, style, {backgroundColor: backgroundColor}]}>
            {children}
        </TouchableOpacity>
    )
}

export default PrimaryButton;

const styles = StyleSheet.create({
    button:{
        borderRadius: radius._10,
        borderCurve: "continuous",
        height: verticalScale(52),
        justifyContent:"center",
        alignItems:"center"
    }
})