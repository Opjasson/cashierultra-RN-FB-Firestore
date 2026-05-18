import React from "react";
import {
    Image,
    Text,
    View,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
} from "react-native";
import { NavigationProp } from "@react-navigation/native";
import { background, mesinKasir } from "../../inventory/images";

interface Props {
    navigation : NavigationProp<any, any>;
}


const SplashScreen: React.FC<Props> = ({navigation}) => {
    return (
        <View style={{ flex: 1, backgroundColor: "#faf9f7" }}>
            <View style={styles.bgSplash}>
                <View style={{alignItems: "center"}}>
                    <Image style={{height: 250, width: 250}} source={mesinKasir} />
                </View>
                <View>
                    <Text style={styles.txtCoffe}>
                        Cashier Clinic Ultra Glow
                    </Text>
                    <Text style={styles.txtCoffe2}>
                        Aplikasi untuk mengelola transaksi product Ultra Glow
                    </Text>
                </View>

                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('LoginPage')} style={styles.button}>
                    <Text style={{ fontSize: 20, color : "#fff", fontWeight : "bold" }}>Get started</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    bgSplash: {
        flex: 1,
        justifyContent: "center",
        marginTop: -30,
        gap : 20
    },
    txtCoffe: {
        color: "#000",
        fontSize: 20,
        textAlign: "center",
        fontWeight: "bold"
    },
    txtCoffe2: {
        color: "#000",
        fontSize: 15,
        textAlign: "center",
        alignSelf: "center",
        width: "80%"
    },
    txtHighlight: {
        color: "#fff",
        fontSize: 15,
        textAlign : 'center',
    },
    button: {
        backgroundColor: "#2171c6",
        width: "50%",
        padding: 15,
        alignItems: "center",
        borderRadius: 30,
        marginHorizontal : "auto"
    },
});
