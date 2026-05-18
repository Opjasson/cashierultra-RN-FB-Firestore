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

const TambahUser: React.FC<props> = ({ navigation, route }) => {
    const [email, setEmail] = useState<string>();
    const [username, setUsername] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [confPassword, setConfPassword] = useState<string>();

    // Handle Update Product -----------
    const handleUpdateProduct = async () => {
        await fetch(apiUrl("/user"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password,
                confPassword: confPassword,
                role: "user",
            }),
        });
        alert("User Berhasil ditambahkan");
        navigation.navigate("KelolaUser");
    };
    // end Handle Update Product -----------

    return (
        <ScrollView>
            <View style={styles.containerForm}>
                <Text style={styles.textLabel}>Email</Text>
                <TextInput
                    style={{
                        borderWidth: 1,
                        marginBottom: 5,
                        borderRadius: 5,
                    }}
                    keyboardType="default"
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
                onPress={handleUpdateProduct}
            >
                <Text style={{ color: "white" }}>Kirim</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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

export default TambahUser;
