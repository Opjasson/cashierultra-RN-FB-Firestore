import { apiUrl } from "@/app/config/api";
import { DrawerContent } from "@/app/components";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuDrawer from "react-native-side-drawer";

interface props {
    navigation: NavigationProp<any, any>;
}

const SetAkun: React.FC<props> = ({ navigation }) => {
    const [user, setUser] = useState<
        {
            id: number;
            email: string;
            username: string;
        }[]
    >([]);
    const [open, setOpen] = useState(false);
    const [idLogin, setIdLogin] = useState<number>();
    const [id, setId] = useState<number>();

    // Get Data Login --------------------------
    const getUserId = async () => {
        const response = await fetch(apiUrl("/login"));
        const data = await response.json();
        setIdLogin(Object.values(data)[0]?.id);
    };

    useEffect(() => {
        getUserId();
    }, []);

    const logOut = async () => {
        await fetch(apiUrl(`/login/${idLogin}`), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        navigation.navigate("LoginPage" as never);
    };

    const toggleOpen = () => {
        if (open === false) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    };

    const sideBarContent = () => {
        return (
            <DrawerContent
                toggleOpen={toggleOpen}
                onPress1={() => navigation.navigate("Cart")}
                onPress2={() => navigation.navigate("Home")}
                onPress3={() => navigation.navigate("HistoryPesanan")}
                onPress4={() => logOut()}
                onPress5={() => navigation.navigate("KelolaProduct")}
                onPress6={() => navigation.navigate("Laporan")}
            />
        );
    };

    useEffect(() => {
        getUserId();
    }, []);

    // Get data lewat api
    const fetchData = async () => {
        const response = await fetch(apiUrl("/user"));
        const data = await response.json();
        setUser(data.data);
    };

    // Get data lewat api
    const deleteAkun = async (id: number) => {
        const response = await fetch(apiUrl(`/user/${id}`), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response) {
            Alert.alert("User berhasl dihapus!");
            navigation.navigate("Home");
        }
    };

    // console.log(user);
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* bagian atas aplikasi kasir */}
            <View
                style={{
                    flexDirection: "row",
                    marginBottom: 20,
                    marginLeft: 25,
                    gap: 10,
                    alignItems: "center",
                    paddingTop: 10,
                }}
            >
                <Ionicons
                    name="menu"
                    size={30}
                    color="black"
                    onPress={() => toggleOpen()}
                />
                <Text style={{ fontWeight: "500", fontSize: 20 }}>
                    Kelola User
                </Text>
            </View>
            {/* ------------ */}
            <StatusBar barStyle="default" />

            <View style={styles.headInfo}>
                <Text style={{ fontSize: 26, fontWeight: "700" }}>
                    Setting akun
                </Text>
                <Text
                    style={{
                        borderBottomWidth: 2,
                        height: 0,
                        width: "70%",
                    }}
                ></Text>
                <Text>Mengelola semua akun User</Text>
            </View>

            {/* button create transaksi */}
            <TouchableOpacity
                onPress={() => navigation.navigate("TambahUser")}
                activeOpacity={0.8}
                style={{
                    justifyContent: "center",
                    flexDirection: "row",
                    backgroundColor: "blue",
                    alignItems: "center",
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    borderRadius: 30,
                    gap: 5,
                    marginRight: 10,
                    width: "40%",
                    marginLeft: 10,
                    marginBottom: 10,
                }}
            >
                <FontAwesome6 name="notes-medical" size={24} color="white" />
                <Text
                    style={{
                        color: "white",
                    }}
                >
                    Tambah User
                </Text>
            </TouchableOpacity>
            {/* end button transaksi */}

            <View
                style={{
                    flexDirection: "row",
                    borderTopWidth: 2,
                    borderBottomWidth: 2,
                    justifyContent: "space-between",
                    width: "85%",
                    marginHorizontal: "auto",
                    marginBottom: 10,
                }}
            >
                <Text style={{ fontSize: 18, width: "60%" }}>Email</Text>
                <Text style={{ fontSize: 18, width: "40%" }}>Aksi</Text>
            </View>

            {user.map((item, index) => (
                <View
                    key={index}
                    style={{
                        flexDirection: "row",
                        borderBottomWidth: 2,
                        justifyContent: "space-between",
                        width: "85%",
                        marginHorizontal: "auto",
                        marginBottom: 8,
                    }}
                >
                    <Text style={{ fontSize: 18, width: "60%" }}>
                        {item.username}
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            width: "40%",
                            gap: 8,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate("UbahUser", {
                                    id: item.id,
                                    data: item,
                                })
                            }
                        >
                            <Text style={{ fontSize: 18, color: "blue" }}>
                                Ubah
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteAkun(item.id)}>
                            <Text style={{ fontSize: 18, color: "red" }}>
                                Hapus
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            <MenuDrawer
                open={open}
                position={"left"}
                drawerContent={sideBarContent()}
                drawerPercentage={70}
                animationTime={250}
                overlay={true}
                opacity={0.4}
            ></MenuDrawer>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    headInfo: {
        borderRadius: 15,
        padding: 5,
        paddingHorizontal: 10,
        paddingBottom: 19,
        gap: 8,
        marginBottom: 30,
    },
    textNav: {
        fontSize: 25,
        fontWeight: "bold",
    },
    navbar: {
        padding: 7,
        marginBottom: 40,
    },
    container: {
        flex: 1,
    },
    button: {
        backgroundColor: "#97B067",
        width: 130,
        padding: 8,
        alignItems: "center",
        borderRadius: 9,
        marginLeft: 10,
        marginBottom: 10,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 30,
    },
    contentCon: {
        width: 400,
        borderWidth: 2,
        marginHorizontal: "auto",
        borderRadius: 2,
    },
    containerRank: {
        flex: 1,
    },
    headRank: {
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "#edeae4",
        paddingVertical: 3,
        elevation: 2,
    },
    textHead: {
        fontSize: 20,
        fontWeight: "bold",
    },
    mainRank: {
        flexDirection: "row",
        justifyContent: "space-around",
        borderBottomWidth: 2,
        borderColor: "#edebe8",
        paddingBottom: 5,
    },
    textRank: {
        textAlign: "left",
        width: 90,
    },
});
export default SetAkun;
