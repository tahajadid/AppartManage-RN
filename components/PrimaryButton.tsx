import { radius } from '@/constants/theme'
import useThemeColors from '@/contexts/useThemeColors'
import { CustomButtonProps } from '@/data/types'
import { verticalScale } from '@/utils/styling'
import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import Loading from './Loading'

const PrimaryButton = ({
    style,
    onPress,
    backgroundColor,
    loading = false,
    disabled = false,
    children
}: CustomButtonProps) => {

    // colors hook
    const colors = useThemeColors();
    const isDisabled = loading || disabled;

    return (
        <TouchableOpacity 
            onPress={onPress} 
            disabled={isDisabled}
            style={[
                styles.button, 
                style, 
                { 
                    backgroundColor: backgroundColor,
                    opacity: isDisabled ? 0.6 : 1,
                }
            ]}
            activeOpacity={0.8}
        >
            {loading ? (
                <Loading 
                    sizeLoading="small" 
                    colorLoader={colors.screenBackground || colors.white} 
                />
            ) : (
                children
            )}
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