import { radius } from '@/constants/theme';
import { BackButtonProps } from '@/constants/types';
import useThemeColors from '@/contexts/useThemeColors';
import { verticalScale } from '@/utils/styling';
import { useRouter } from 'expo-router';
import { CaretLeft } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const BackButton = ({
    style,
    iconSize = 20,
}: BackButtonProps) => {
    const router = useRouter();
    const scaledSize = verticalScale(iconSize);
    // colors hook
    const colors = useThemeColors();

    const IconComponent = () => (
        <CaretLeft
            size={scaledSize}
            color={colors.white}
        />
    );
    
    return (
        <TouchableOpacity onPress={() => {router.back()}} 
            style={[style, styles.button, { backgroundColor: colors.searchIconBackground }]}>
            <View>
                <IconComponent />
            </View>
        </TouchableOpacity>
    )
};

export default BackButton;

const styles = StyleSheet.create({
    button:{
        alignSelf:"flex-start",
        borderRadius: radius._20,
        borderCurve: "continuous",
        padding: 5,
    }
})