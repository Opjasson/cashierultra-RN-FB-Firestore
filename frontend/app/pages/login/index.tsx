import { apiUrl } from "@/app/config/api";
import { doctor } from "@/app/inventory/images";
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

interface props {
    navigation: NavigationProp<any, any>;
}

const LoginPage: React.FC<props> = ({ navigation }) => {
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [error, setError] = useState<string>();
    const [showPassword, setShowPassword] = useState(false);

    const [data, setData] = useState([]);

    const getUserId = async () => {
        try {
            const response = await fetch(apiUrl("/login"));
            const datas = await response.json();
            setData(datas); // update state
        } catch (error) {
            setError("Email atau Password tidak terdaftar");
            // console.error("Fetch error:", error);
        }
    };

    // 1. Ambil data saat komponen pertama kali muncul
    useEffect(() => {
        getUserId();
    }, []);

    // Handle jika user klik tombol kembali handphone
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                // kalau mau keluar app:
                Alert.alert("Keluar", "Yakin mau keluar aplikasi?", [
                    { text: "Batal", style: "cancel" },
                    { text: "Ya", onPress: () => BackHandler.exitApp() },
                ]);
                return true; // cegah kembali ke login
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress,
            );

            return () => subscription.remove(); // hapus listener dengan cara baru
        }, []),
    );
    // end handle tombol kembali

    // 2. Pantau perubahan pada `data`
    useEffect(() => {
        if (data.length > 0) {
            navigation.navigate("Home"); // Arahkan ke MainApp jika sudah login
        }
    }, [data]);

    const handleLogin = async () => {
        if (email && password) {
            const response = await fetch(apiUrl("/login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
            const json = await response.json();
            // console.log(json.response.id);

            if (JSON.stringify(response.status) === "401") {
                setError("Email atau password salah!");
            } else {
                navigation.navigate("Home", { data: json.response });
            }
        } else {
            setError("Isi email dan password!");
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <StatusBar barStyle={"light-content"} backgroundColor={"#1F1F1F"} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.containerForm}>
                    <View style={styles.headLogin}>
                        <Text style={styles.headLoginText1}>Halaman Login</Text>
                        <Image
                            style={{ height: 250, width: 250 }}
                            source={doctor}
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
                            keyboardType="email-address"
                            placeholder="Masukan email anda"
                            onChangeText={(text) => setEmail(text)}
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

                    <Text style={error ? styles.errorMsg : styles.hidden}>
                        {error}
                    </Text>
                </View>
                {/* End Form */}

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={{ color: "white" }}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buatAkun}
                    onPress={() => navigation.navigate("CekEmail")}
                >
                    <Text>Lupa password akun.</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.buatAkun2}
                    onPress={() => navigation.navigate("RegisterPage")}
                >
                    <Text style={{ color: "#2171c6" }}>Buat akun disini.</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
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
        paddingTop: 80,
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

export default LoginPage;
