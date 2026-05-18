import { apiUrl } from "@/app/config/api";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import React, { useState } from "react";
import {
    ScrollView,
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

const UbahUser: React.FC<props> = ({ navigation, route }) => {
    // Get id menggunakan params di previos page
    const index = route.params?.id;
    const sendData = route.params?.data;
    const [error, setError] = useState<string>();

    const [email, setEmail] = useState<string>(sendData.email);
    const [username, setUsername] = useState<string>(sendData.username);
    const [password, setPassword] = useState<string>();
    const [confPassword, setConfPassword] = useState<string>();

    // Handle Update Product -----------
    const handleUbah = async (id: number) => {
        if (email && password && confPassword) {
            const response = await fetch(
                apiUrl(`/user/${id}`),
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                        username: username,
                        password: password,
                        confPassword: confPassword,
                    }),
                },
            );

            if (JSON.stringify(response.status) === "400") {
                setError("Password dan confPassword tidak sama!");
            } else {
                alert("Berhasil merubah akun");
                navigation.navigate("KelolaUser");
            }
        } else {
            setError("Isi dengan lengkap!");
        }
    };

    // end Handle Update Product -----------

    return (
        <ScrollView>
            <View style={styles.containerForm}>
                <Text style={error ? styles.errorMsg : styles.hidden}>
                    {error}
                </Text>
                <Text style={styles.textLabel}>Email</Text>
                <TextInput
                    style={{
                        borderWidth: 1,
                        marginBottom: 5,
                        borderRadius: 5,
                    }}
                    keyboardType="default"
                    value={`${email}`}
                    placeholder="Email"
                    onChangeText={(text) => setEmail(text)}
                />

                <Text style={styles.textLabel}>Username</Text>
                <TextInput
                    style={{
                        borderWidth: 1,
                        marginBottom: 5,
                        borderRadius: 5,
                    }}
                    keyboardType="default"
                    value={`${username}`}
                    placeholder="Username"
                    onChangeText={(text) => setUsername(text)}
                />

                <Text style={styles.textLabel}>Password</Text>
                <TextInput
                    style={{
                        borderWidth: 1,
                        marginBottom: 5,
                        borderRadius: 5,
                    }}
                    keyboardType="default"
                    placeholder="Password"
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
                    placeholder="Konfimasi Password"
                    onChangeText={(text) => setConfPassword(text)}
                />
            </View>
            {/* End Form */}

            <TouchableOpacity
                style={styles.button}
                onPress={() => handleUbah(index)}
            >
                <Text style={{ color: "white" }}>Kirim</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    hidden: {
        display: "none",
    },
    errorMsg: {
        fontSize: 18,
        color: "red",
        textAlign: "center",
    },
    textArea: {
        width: "100%",
        height: 100,
        borderColor: "gray",
        borderWidth: 1,
        padding: 10,
        fontSize: 16,
        borderRadius: 10,
    },
    containerForm: {
        paddingHorizontal: 5,
    },
    button: {
        backgroundColor: "#2f823a",
        width: 100,
        padding: 8,
        alignItems: "center",
        borderRadius: 9,
        color: "black",
        marginHorizontal: "auto",
        marginTop: 20,
    },
    button2: {
        backgroundColor: "#fff",
        width: "100%",
        padding: 8,
        alignItems: "center",
        borderRadius: 9,
        color: "black",
        marginHorizontal: "auto",
        borderWidth: 1,
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
});

export default UbahUser;
