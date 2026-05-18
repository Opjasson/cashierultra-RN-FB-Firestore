import { apiUrl } from "@/app/config/api";
import { system } from "@/app/inventory/images";
import { NavigationProp } from "@react-navigation/native";
import React, { useState } from "react";
import {
    Image,
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
}

const CekEmail: React.FC<props> = ({ navigation }) => {
    const [email, setEmail] = useState<string>();
    const [error, setError] = useState<string>();

    const handleCek = async () => {
        if (email) {
            const response = await fetch(
                apiUrl("/forgotPass"),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                    }),
                },
            );
            const json = await response.json();
            // console.log(json);
            if (json.message) {
                setError(json.message);
            } else {
                alert("Email terdaftar!");
                navigation.navigate("ChangePass", {
                    user: json,
                });
            }

            // if (JSON.stringify(response.status) === "401") {
            //     setError("Email atau password salah!");
            // } else {
            //     navigation.navigate("kasir", { data: json.response });
            // }
        } else {
            setError("Isi email dan password!");
        }
    };

    return (
        <ScrollView>
            <StatusBar barStyle={"light-content"} backgroundColor={"#1F1F1F"} />
            <View style={styles.containerForm}>
                <View style={styles.headLogin}>
                    <View style={styles.headLogin}>
                        <Text style={styles.headLoginText1}>
                            Cek Email User
                        </Text>
                        <Image
                            style={{ height: 180, width: 180 }}
                            source={system}
                        />
                    </View>
                    <Text style={styles.headLoginText2}>
                        Klinik Kecantikan Ultra Glow
                    </Text>
                    <Text style={styles.garisHead}></Text>
                </View>
                <Text style={styles.textLabel}>Email</Text>
                <TextInput
                    style={{
                        borderWidth: 1,
                        marginBottom: 5,
                        borderRadius: 5,
                    }}
                    keyboardType="email-address"
                    placeholder="Masukan email anda"
                    onChangeText={(text) => setEmail(text)}
                />

                <Text style={error ? styles.errorMsg : styles.hidden}>
                    {error}
                </Text>
            </View>
            {/* End Form */}

            <TouchableOpacity style={styles.button} onPress={handleCek}>
                <Text style={{ color: "white" }}>Cek Email</Text>
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
        color: "#2171c6",
    },
    headLoginText2: {
        fontSize: 20,
        fontWeight: "light",
        color: "#2171c6",
    },
    garisHead: {
        borderBottomWidth: 3,
        width: "70%",
        marginTop: -10,
        borderColor: "#2171c6",
    },
    button: {
        backgroundColor: "#2171c6",
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

export default CekEmail;
