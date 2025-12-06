import React from 'react';
import { StyleSheet, View } from 'react-native';

const welcome = () => {

    return (
        
        <View style={styles.container}>
            {/* Top bar with language selector (left) and login (right) */}
            <View style={styles.topBar}>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({ 
    container: { 
        flex: 1,
        justifyContent: "space-between",
        backgroundColor: "#0096FF"
    },
    dropdown: {
        marginTop: 2,
        borderRadius: 10,
        shadowColor: '#1117',
        shadowOpacity: 0.15,
        elevation: 3,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    separator: {
        height: 1,
        backgroundColor: '#dddddd44',
        marginHorizontal: 8,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    }
});

export default welcome;
