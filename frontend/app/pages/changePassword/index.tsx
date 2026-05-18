import { apiUrl } from "@/app/config/api";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import React, { useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface props {
    navigation: NavigationProp<any, any>;
    route: RouteProp<any, any>;
}

const ChangePass: React.FC<props> = ({ navigation, route }) => {
    const user = route.params?.user;
    const [password, setPassword] = useState<string>();
    const [confPassword, setConfPassword] = useState<string>();
    const [error, setError] = useState<string>();

    console.log(user);

    const handleChange = async () => {
        if (password && confPassword) {
            const response = await fetch(
                apiUrl(`/user/${user.id}`),
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: user.email,
                        role: user.role,
                        password: password,
                        confPassword: confPassword,
                    }),
                },
            );
            const json = await response.json();
            if (json.msg === "Password dan Confirm Password tidak cocok") {
                setError(json.msg);
            } else {
                alert("Password berhasil dirubah!");
                navigation.navigate("LoginPage");
            }
        } else {
            setError("Isi email dan password!");
        }
    };

    return (
        <ScrollView>
            <StatusBar barStyle={"light-content"} backgroundColor={"#1F1F1F"} />
            <View style={styles.containerForm}>
                <View style={styles.headLogin}>
                    <Text style={styles.headLoginText1}>
                        Lakukan Perubahan Password
                    </Text>
                    <Text style={styles.headLoginText2}>
                        Klinik Kecantikan Ultra Glow
                    </Text>
                    <Text style={styles.garisHead}></Text>
                </View>
                <Text style={styles.textLabel}>Password</Text>
                <TextInput
                    style={{
                        borderWidth: 1,
                        marginBottom: 5,
                        borderRadius: 5,
                    }}
                    keyboardType="default"
                    placeholder="Masukan password anda"
                    secureTextEntry
                    onChangeText={(text) => setPassword(text)}
                />

                <Text style={styles.textLabel}>Confirm Password</Text>
                <TextInput
                    style={{
                        borderWidth: 1,
                        marginBottom: 5,
                        borderRadius: 5,
                    }}
                    keyboardType="default"
                    placeholder="Masukan ulang password anda"
                    secureTextEntry
                    onChangeText={(text) => setConfPassword(text)}
                />

                <Text style={error ? styles.errorMsg : styles.hidden}>
                    {error}
                </Text>
            </View>
            {/* End Form */}

            <TouchableOpacity style={styles.button} onPress={handleChange}>
                <Text style={{ color: "white" }}>Ubah Password</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    containerForm: {
        paddingHorizontal: 15,
        paddingTop: 150,
    },
    headLogin: {
        alignItems: "center",
        marginBottom: 40,
    },
    headLoginText1: {
        fontSize: 30,
        fontWeight: "900",
        marginBottom: 10,
        color: "#0000",
        textAlign: "center",
    },
    headLoginText2: {
        fontSize: 20,
        fontWeight: "light",
    },
    garisHead: {
        borderBottomWidth: 3,
        width: "70%",
        marginTop: -10,
    },
    button: {
        backgroundColor: "#007bff",
        width: "80%",
        paddingVertical: 15,
        alignItems: "center",
        borderRadius: 9,
        marginTop: 20,
        marginHorizontal: "auto",
    },
    buatAkun: {
        width: "80%",
        paddingVertical: 15,
        alignItems: "center",
        borderRadius: 9,
        marginHorizontal: "auto",
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 30,
    },
    textLabel: {
        fontWeight: "bold",
        fontSize: 18,
        paddingHorizontal: 3,
    },
    errorMsg: {
        fontSize: 18,
        color: "red",
        textAlign: "center",
    },
    hidden: {
        display: "none",
    },
});

export default ChangePass;
