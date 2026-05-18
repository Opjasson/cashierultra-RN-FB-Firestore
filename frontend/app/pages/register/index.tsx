import { apiUrl } from "@/app/config/api";
import { femaleDoctor } from "@/app/inventory/images";
import { MaterialIcons } from "@expo/vector-icons";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    BackHandler,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface props {
    navigation: NavigationProp<any, any>;
}

const RegisterPage: React.FC<props> = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confPassword, setConfPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>();

    const handleRegister = async () => {
        if (email && password && confPassword) {
            const response = await fetch(apiUrl("/user"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    username: username,
                    password: password,
                    role: "user",
                    confPassword: confPassword,
                }),
            });

            if (JSON.stringify(response.status) === "400") {
                setError("Password sesuaikan Confirm Password!");
            } else {
                alert("Berhasil membuat akun");
                navigation.navigate("LoginPage");
            }
        } else {
            setError("Isi dengan lengkap!");
        }
    };

    return (
        <SafeAreaView style={styles.screen}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <StatusBar
                    barStyle={"light-content"}
                    backgroundColor={"#1F1F1F"}
                />
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.containerForm}>
                        <View style={styles.headLogin}>
                            <Text style={styles.headLoginText1}>
                                Halaman Register
                            </Text>
                            <Image
                                style={{ height: 250, width: 250 }}
                                source={femaleDoctor}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <MaterialIcons
                                name="person-outline"
                                size={20}
                                color="gray"
                                style={styles.icon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <MaterialIcons
                                name="person-outline"
                                size={20}
                                color="gray"
                                style={styles.icon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <MaterialIcons
                                name="lock-outline"
                                size={20}
                                color="gray"
                                style={styles.icon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <MaterialIcons
                                    name={
                                        showPassword
                                            ? "visibility-off"
                                            : "visibility"
                                    }
                                    size={20}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <MaterialIcons
                                name="lock-outline"
                                size={20}
                                color="gray"
                                style={styles.icon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                secureTextEntry={!showPassword}
                                value={confPassword}
                                onChangeText={setConfPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <MaterialIcons
                                    name={
                                        showPassword
                                            ? "visibility-off"
                                            : "visibility"
                                    }
                                    size={20}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={error ? styles.errorMsg : styles.hidden}>
                            {error}
                        </Text>
                    </View>
                    {/* End Form */}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                    >
                        <Text style={{ color: "white" }}>Buat Akun</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buatAkun2}
                        onPress={() => navigation.navigate("LoginPage")}
                    >
                        <Text style={{ color: "#2171c6" }}>
                            Sudah punya akun? login disini
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    icon: { marginRight: 10 },
    input: {
        flex: 1,
        height: 40,
    },
    inputGroup: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        marginBottom: 20,
    },
    screen: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 32,
    },
    containerForm: {
        paddingHorizontal: 15,
        paddingTop: 30,
    },
    headLogin: {
        alignItems: "center",
        marginBottom: 40,
    },
    headLoginText1: {
        fontSize: 30,
        fontWeight: "900",
        marginBottom: 10,
        color: "#a5aaaa",
        alignSelf: "flex-start",
    },
    headLoginText2: {
        fontSize: 20,
        fontWeight: "light",
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
    buatAkun2: {
        width: "80%",
        marginTop: 15,
        alignItems: "center",
        borderRadius: 9,
        marginHorizontal: "auto",
        color: "#2171c6",
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

export default RegisterPage;
