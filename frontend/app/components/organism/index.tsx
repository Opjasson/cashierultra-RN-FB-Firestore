import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { SafeAreaView } from "react-native-safe-area-context"
import Entypo from "@expo/vector-icons/Entypo";

interface props {
    onPress1: () => void;
    onPress2: () => void;
    onPress3: () => void;
    onPress4: () => void;
    onPress5: () => void;
    onPress6: () => void;
    toggleOpen: () => void;
    status?: boolean;
}

const DrawerContent: React.FC<props> = ({
    toggleOpen,
    onPress1,
    onPress2,
    onPress3,
    onPress4,
    onPress5,
    onPress6,
    status,
}) => {
    return (
        <SafeAreaView style={styles.animatedBox}>
            <View style={styles.sidebarHead}>
                <Text style={styles.sidebarTitle}>Ultra Glow Clinic</Text>
                <Text style={{ color: "white", fontSize: 12, borderBottomColor: "white", borderBottomWidth: 2 }}>Jln Raya, Kalimati, Kec. Adiwerna, Kabupaten Tegal, Jawa Tengah</Text>

                 <TouchableOpacity
                    activeOpacity={0.5}
                    style={[styles.tutupSidebar, {backgroundColor: "white", width: 120, padding: 4, borderRadius: 8}]}
                    onPress={onPress4}>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "red",
                           
                        }}>
                        🔙 Logout
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sidebarMain}>
                <TouchableOpacity
                    onPress={onPress1}
                    style={{
                        flexDirection: "row",
                        backgroundColor: "#ebf4ba",
                        gap: 5,
                        padding: 6,
                        borderRadius: 8
                    }}>
                    <Text style={styles.sidebarMenu}>🛒 Keranjang Belanjaku</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onPress2}
                    style={{
                        flexDirection: "row",
                        backgroundColor: "#ebf4ba",
                        gap: 5,
                        padding: 6,
                        borderRadius: 8
                    }}>
                    <Text style={styles.sidebarMenu}>🏠 Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onPress3}
                    style={{
                        flexDirection: "row",
                        backgroundColor: "#ebf4ba",
                        gap: 5,
                        padding: 6,
                        borderRadius: 8,
                    }}>
                    <Text style={styles.sidebarMenu}>📊 Riwayat Orderku</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onPress5}
                    style={{
                        flexDirection: "row",
                        backgroundColor: "#ebf4ba",
                        gap: 5,
                        padding: 6,
                        borderRadius: 8,
                        display: status ? "none" : "flex",
                    }}>
                    <Text style={styles.sidebarMenu}>🧰 Atur Productku</Text>
                    
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onPress6}
                    style={{
                        flexDirection: "row",
                        backgroundColor: "#ebf4ba",
                        gap: 5,
                        padding: 6,
                        borderRadius: 8,
                        display: status ? "none" : "flex",
                    }}>
                    <Text style={styles.sidebarMenu}>🗒️ Laporanku</Text>
                
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.5}
                    style={styles.tutupSidebar}
                    onPress={toggleOpen}>
                    <Ionicons
                        name="arrow-back-circle-outline"
                        size={30}
                        color="black"
                    />
                    <Text style={{ fontSize: 18 }}>Tutup</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    animatedBox: {
        flex: 1,
        backgroundColor: "#FFF8F8",
        // borderWidth : 3
    },
    sidebarHead: {
        flexDirection: "column",
        gap: 15,
        backgroundColor: "#2171c6",
        padding: 15,
    },
    sidebarTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "white",
    },
    sidebarMain: {
        display: "flex",
        gap: 8,
        flexDirection: "column",
        justifyContent: "space-between",
        height: "50%",
        marginTop: 20,
        padding: 10,
    },
    sidebarMenu: {
        fontSize: 20,
        fontWeight: "400",
    },
    tutupSidebar: {
        flexDirection: "row",
        alignItems: "center",
    },
});

export default DrawerContent;
