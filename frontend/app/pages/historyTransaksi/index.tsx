import { apiUrl } from "@/app/config/api";
import { DrawerContent } from "@/app/components";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
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

const HistoryPesanan: React.FC<props> = ({ navigation }) => {
    const [id, setId] = useState<number>();
    const [user, setUser] = useState<string>();
    const [username, setUsername] = useState<string>();
    const [open, setOpen] = useState(false);
    const [idLogin, setIdLogin] = useState<number>();
    const [historyTransaksi, setHistoryTransaksi] = useState<
        {
            keranjangs: [
                {
                    id: number;
                    qty: number;
                    createdAt: number;
                    productId: number;
                    userId: number;
                    transaksiId: number;
                    product?: {
                        id: number;
                        nama_product: string;
                    };
                },
            ];
            id: number;
            uuid: string;
            totalHarga: number;
            createdAt: string;
            namaPelanggan: string;
            status: boolean;
            buktiBayar: string;
            catatanTambahan: string;
        }[]
    >([]);

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
                status={user === "kasir" ? false : true}
                onPress5={() => navigation.navigate("KelolaProduct")}
                onPress6={() => navigation.navigate("Laporan")}
            />
        );
    };

    // Get Data Login --------------------------
    const getUserId = async () => {
        const response = await fetch(apiUrl("/login"));
        const data = await response.json();
        const loginInfo = Object.values(data)[0] as
            | { id?: number; userId?: number }
            | undefined;

        setIdLogin(loginInfo?.id);
        setId(loginInfo?.userId);
    };

    const getAkunLoggin = async () => {
        if (!id) return;

        const response = await fetch(apiUrl(`/user/${id}`));
        const user = await response.json();
        console.log(user);
        
        if (user != null) {
            setUser(user.role);
            setUsername(user.username);
        }
    };

    useEffect(() => {
        getAkunLoggin();
    }, [id]);

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

    const getHistorys = async () => {
        if (!user) return;
        if (user === "user" && !username) return;

        try {
            const endpoint =
                user === "user"
                    ? `/transaksi?namaPelanggan=${encodeURIComponent(username!)}`
                    : "/transaksi";
            const response = await fetch(apiUrl(endpoint));
            const history = (await response.json()) as {
                response: {
                    keranjangs: [
                        {
                            id: number;
                            qty: number;
                            createdAt: number;
                            productId: number;
                            userId: number;
                            transaksiId: number;
                        },
                    ];
                    id: number;
                    uuid: string;
                    totalHarga: number;
                    createdAt: string;
                    namaPelanggan: string;
                    status: boolean;
                    buktiBayar: string;
                    catatanTambahan: string;
                }[];
            };
            const dataArray =
                user === "user"
                    ? history.response.filter(
                          (item) => item.namaPelanggan === username,
                      )
                    : history.response;
            
            setHistoryTransaksi(dataArray);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getHistorys();
    }, [user, username]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={"light-content"} backgroundColor={"#2171c6"} />
            <View
                style={{
                    flexDirection: "row",
                    marginBottom: 20,
                    marginHorizontal: 30,
                    gap: 10,
                    alignItems: "center",
                }}
            >
                <Ionicons
                    name="menu"
                    size={30}
                    color="black"
                    onPress={() => toggleOpen()}
                />
                <Text style={{ fontWeight: "500", fontSize: 20 }}>
                    History Pesanan
                </Text>
            </View>
            <ScrollView>
                {[...historyTransaksi]
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                    )
                    .map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.card}
                            onPress={() =>
                                navigation.navigate("DetailTransaksi", {
                                    uuid: item.uuid,
                                })
                            }
                        >
                            <View
                                style={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: 20, // lebih rounded seperti contoh
                                    padding: 20,
                                    paddingTop: 24,
                                    paddingRight: 24,
                                    paddingBottom: 20,
                                    marginHorizontal: 16,
                                    marginVertical: 12,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 10,
                                    elevation: 6,
                                    borderWidth: 1,
                                    borderColor: "#f0f0f0",
                                    position: "relative", // untuk positioning matahari absolut
                                }}
                            >
                                {/* Matahari - diposisikan absolut di kanan atas */}
                                <Text
                                    style={{
                                        position: "absolute",
                                        top: -10, // agak keluar ke atas agar mirip contoh
                                        right: -10, // agak keluar ke kanan
                                        fontSize: 80, // ukuran besar seperti di contoh
                                        lineHeight: 80,
                                    }}
                                >
                                    ☀️
                                </Text>

                                {/* Tanggal */}
                                <Text
                                    style={{
                                        fontSize: 15,
                                        color: "#555",
                                        fontWeight: "500",
                                        marginBottom: 16,
                                    }}
                                >
                                    {item.createdAt.split("T")[0]}
                                </Text>

                                {/* Konten detail */}
                                <View style={{ marginBottom: 20 }}>
                                    <Text
                                        style={{
                                            fontSize: 17,
                                            fontWeight: "bold",
                                            color: "#000",
                                            marginBottom: 10,
                                        }}
                                    >
                                      { user != "kasir" ? "Nama Pelanggan :" : "Nama Kasir :"}  {" "}
                                        {item.namaPelanggan.toUpperCase()}
                                    </Text>

                                    <Text
                                        style={{
                                            fontSize: 15,
                                            color: "#222",
                                            lineHeight: 24,
                                            marginBottom: 6,
                                        }}
                                    >
                                        Id Pesanan : {item.uuid.slice(0, 8)}
                                    </Text>

                                    {item.keranjangs.map((name, idx) => (
                                        <Text
                                            key={idx}
                                            style={{
                                                fontSize: 15,
                                                color: "#222",
                                                lineHeight: 24,
                                                marginBottom: 6,
                                            }}
                                        >
                                            {name.product?.nama_product} x{" "}
                                            {name.qty}
                                        </Text>
                                    ))}
                                </View>

                                {/* Total */}
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        borderTopWidth: 1,
                                        borderTopColor: "#e8e8e8",
                                        paddingTop: 14,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 15,
                                            color: "#444",
                                            fontWeight: "600",
                                        }}
                                    >
                                        Total Nominal :
                                    </Text>

                                    <Text
                                        style={{
                                            fontSize: 19,
                                            fontWeight: "bold",
                                            color: "#000",
                                        }}
                                    >
                                        {item.totalHarga}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
            </ScrollView>

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
    container: {
        flex: 1,
        backgroundColor: "#f4f4f4",
        paddingBottom: 20,
        paddingTop: 10,
    },
    card: {
        backgroundColor: "#2171c6",
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    date: {
        fontSize: 13,
        color: "#333",
    },
    type: {
        fontSize: 13,
        color: "#666",
    },
    titleRow: {
        flexDirection: "row",
        marginTop: 8,
    },
    verticalLine: {
        width: 5,
        borderRadius: 3,
        backgroundColor: "red",
        marginRight: 10,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
    },
    location: {
        fontSize: 14,
        color: "#555",
        marginTop: 2,
    },
    name: {
        fontSize: 13,
        color: "#333",
        marginTop: 2,
    },
    showLess: {
        fontSize: 13,
        color: "#888",
        marginTop: 8,
    },
    price: {
        fontWeight: "bold",
        fontSize: 16,
        marginTop: 8,
    },
    fab: {
        position: "absolute",
        bottom: 30,
        alignSelf: "center",
        backgroundColor: "#FDCB00",
        padding: 18,
        borderRadius: 50,
        elevation: 5,
    },
});

export default HistoryPesanan;
