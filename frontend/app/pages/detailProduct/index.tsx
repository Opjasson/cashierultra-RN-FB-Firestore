import { apiUrl } from "@/app/config/api";
import AntDesign from "@expo/vector-icons/AntDesign";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface props {
    navigation: NavigationProp<any, any>;
    route: RouteProp<any, any>;
}

const DetailProduct: React.FC<props> = ({ navigation, route }) => {
    const sendData = route.params?.data;
    const sendTransId = route.params?.idTrans;
    const sendIdUser = route.params?.idUser;
    const sendUsername = route.params?.username;

    const ensureDraftTransaksi = async () => {
        if (!sendUsername) {
            throw new Error("Data kasir belum tersedia.");
        }

        const response = await fetch(apiUrl("/transaksi"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                namaPelanggan: sendUsername,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.response?.id) {
            throw new Error(data.msg || "Gagal menyiapkan transaksi.");
        }

        return data.response.id as number;
    };

    const addCart = async () => {
        if (!sendIdUser) {
            alert("Data user belum tersedia.");
            return;
        }

        try {
            const transaksiId = sendTransId || (await ensureDraftTransaksi());

            const response = await fetch(apiUrl("/cart"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    qty: 1,
                    productId: sendData.id,
                    userId: sendIdUser,
                    transaksiId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.msg || "Gagal menambahkan ke keranjang.");
                return;
            }

            navigation.navigate("Cart");
        } catch (error) {
            alert("Ada error saat menambahkan ke keranjang.");
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header Image */}
            <View style={styles.imageContainer}>
                <Image src={sendData.img_product} style={styles.image} />
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.navigate("Home")}
                >
                    <AntDesign name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <View>
                        <Text style={styles.title}>
                            {sendData.nama_product}
                        </Text>
                        <Text style={styles.subtitle}>
                            {sendData.kategori_product}
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.aboutText}>{sendData.deskripsi}</Text>

                <View style={styles.cartRow}>
                    <TouchableOpacity
                        style={styles.cartButton}
                        onPress={addCart}
                    >
                        <Text style={styles.cartText}>Add to cart</Text>
                    </TouchableOpacity>
                    <Text style={styles.price}>
                        Rp. {sendData.harga_product.toLocaleString()}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: "#fff", flex: 1 },
    imageContainer: { position: "relative" },
    image: {
        width: "100%",
        height: 250,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        position: "absolute",
        top: 40,
        left: 20,
        backgroundColor: "#00000070",
        padding: 8,
        borderRadius: 20,
    },
    heartButton: {
        position: "absolute",
        top: 40,
        right: 20,
        backgroundColor: "#00000070",
        padding: 8,
        borderRadius: 20,
    },
    content: { padding: 20 },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { fontSize: 22, fontWeight: "bold", color: "#222" },
    subtitle: { fontSize: 14, color: "#777" },
    rating: {
        flexDirection: "row",
        backgroundColor: "#C4963A",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        alignItems: "center",
    },
    ratingText: {
        color: "#fff",
        marginLeft: 4,
        fontWeight: "600",
    },
    sectionTitle: {
        marginTop: 20,
        fontWeight: "bold",
        fontSize: 16,
        color: "#222",
        borderBottomWidth: 2,
        borderColor: "#C4963A",
    },
    optionRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
    },
    optionButton: {
        borderWidth: 1,
        borderColor: "#aaa",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    optionText: {
        color: "#444",
        fontSize: 14,
    },
    selectedOption: {
        backgroundColor: "#1E5128",
        borderColor: "#1E5128",
    },
    selectedSugar: {
        backgroundColor: "#1E5128",
        borderColor: "#1E5128",
    },
    selectedText: {
        color: "#fff",
    },
    aboutText: {
        marginTop: 10,
        color: "#555",
        fontSize: 14,
        lineHeight: 20,
    },
    cartRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
        alignItems: "center",
    },
    cartButton: {
        backgroundColor: "#1E5128",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        flex: 1,
        marginRight: 10,
        alignItems: "center",
    },
    cartText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    price: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#222",
    },
});

export default DetailProduct;
