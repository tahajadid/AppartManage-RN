import React from "react";
import { StyleSheet, View } from 'react-native';


const index = () => {

    /*
    // navigate to welcome page after 2s
    const router = useRouter();
    useEffect(() =>{
        setTimeout(()=>{
            router.push("/(auth)/welcome");
        },2000)
    },[])
    */
   
    return (
        <View style={styles.conatiner}>
           
        </View>
  )
}

export default index;

const styles = StyleSheet.create({  
    conatiner: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ADD8E6",
    },
    logo: {
        aspectRatio: 1,
        height: "20%",
    }
})