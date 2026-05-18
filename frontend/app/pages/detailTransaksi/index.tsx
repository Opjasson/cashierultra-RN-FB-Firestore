import { apiUrl } from "@/app/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface props {
    route: RouteProp<any, any>;
    navigation: NavigationProp<any, any>;
}

const DetailTransaksi: React.FC<props> = ({ route, navigation }) => {
    const [id, setId] = useState<number>();
    const [uuid, setUuid] = useState<string>();
    const [date, setDate] = useState(new Date());
    const [cart, setCart] = useState<
        {
            id: number;
            qty: number;
            productId: number;
            transaksiId: number;
            product?: {
                id: number;
                nama_product: string;
                harga_product: number;
            };
        }[]
    >([]);

    const [totalHarga, setTotalHarga] = useState<number>();
    const [createdAt, setCreatedAt] = useState<string>();
    const [pelanggan, setPelanggan] = useState<string>();
    const [cash, setCash] = useState<number>();

    const routeUuid = route.params?.uuid;

    const getTransaksiByUUID = async () => {
        const response = await fetch(
            apiUrl(`/transaksi/${routeUuid}`),
        );
        const dataJson = await response.json();
        setCart(dataJson.keranjangs);
        setUuid(dataJson.uuid);
        setTotalHarga(dataJson.totalHarga);
        setPelanggan(dataJson.namaPelanggan);
        setCash(dataJson.cash);
        setCreatedAt(dataJson.createdAt);
        setId(dataJson.id);
    };

    useEffect(() => {
        getTransaksiByUUID();
    }, [routeUuid]);

    const deleteTransaksi = async () => {
        await fetch(apiUrl(`/transaksi/${id}`), {
            method: "DELETE",
        });
        alert("Transaksi Berhasil Dihapus!");
        navigation.navigate("HistoryPesanan");
    };

    const handleUpdateStatus = async () => {
        await fetch(apiUrl(`/transaksi/${id}`), {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status: true,
            }),
        });

        await AsyncStorage.setItem("infoPesanan", `${pelanggan}`);

        alert("Status Selesai!");
        navigation.navigate("HistoryPesanan");
    };

    // convert tanggal menjadi string
    const dateNow = date.toISOString().split("T")[0];

    // hitungQty nota
    const handleQTyAll = () => {
        const hitungCart = cart.map((a) => a.qty);
        const sum = hitungCart.reduce((acc, curr) => {
            return acc + curr;
        }, 0);

        return sum;
    };

    const handleCetak = () => {
        const rows = cart
            .map(
                (item) => `
            <div>Pesanan : ${item.product?.nama_product}<br>${item.qty} x ${
                item.product?.harga_product
            }<span class="right">Rp ${
                item.qty * (item.product?.harga_product ?? 0)
            }</span>
            </div>
    `,
            )
            .join("");
        return `
        <html>
        <head>
        <style>
        @page { size: 58mm auto; margin: 0; } body { width: 58mm; font-size: 10px; padding: 5px; font-family: sans-serif; padding: 16px;  }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 10px 0; }
        .right { text-align: right; }
        .row { display: flex; justify-content: space-between; }
        </style>
        </head>
        <body>
        <div class="center">
        <h3>Klinik Kecantikan Ultra Glow</h3>
        <p>Jln Raya, Kalimati, Kec. Adiwerna, <br>Kabupaten Tegal, Jawa Tengah</p>
        <p>No. Telp: +62 817-7022-0529</p>
        </div>
        <div class="line"></div>
        <div class="row"><span>${dateNow}</span></div>
        <div class="row"><span>Pelanggan: ${pelanggan}</span></div>
        <div>No.xxxx</div>
        <div class="line"></div>
        
        list pesanan
              
            ${rows}
              <div class="line"></div>
              <div class="row"><span>Jumlah barang</span><span>Qty : ${handleQTyAll()}</span></div>
              <div class="row bold"><span>Total</span><span>Rp ${totalHarga?.toLocaleString()}</span></div>
              <div class="row"><span>Bayar (Cash)</span><span>Rp ${cash?.toLocaleString()}</span></div>
              <div class="row"><span>Kembali</span><span>Rp ${
                  cash! - totalHarga!
              }</span></div>
        
              <div class="center"><p>Terima kasih telah berbelanja</p></div>
            </body>
          </html>
        `;
    };

    const handleSavePdf = async () => {
        const htmlContent = handleCetak();

        const { uri } = await Print.printToFileAsync({
            html: htmlContent,
        });

        const customFileName = `Nota Transaksi-Ultra Glow_${dateNow}.pdf`;

        // buat file target
        const targetFile = new FileSystem.File(
            FileSystem.Paths.document,
            customFileName,
        );

        // cek dulu
        if (await targetFile.exists) {
            await targetFile.delete();
        }

        // file sumber
        const sourceFile = new FileSystem.File(uri);

        // move → harus File object
        await sourceFile.move(targetFile);

        // share pakai uri hasil target
        await Sharing.shareAsync(targetFile.uri);
    };

    return (
        <ScrollView>
            <View style={styles.card}>
                <View style={styles.rowBetween}>
                    <Text style={styles.date}>{createdAt?.split("T")[0]}</Text>
                </View>
                <View style={styles.titleRow}>
                    <View style={styles.content}>
                        <Text style={styles.title}>
                            Nama Kasir : {pelanggan?.toUpperCase()}
                        </Text>
                        <Text style={styles.location}>Id Pesanan : {uuid}</Text>

                        <Text>Daftar Pesanan :</Text>
                        {cart.map((name, idx) => (
                            <Text key={idx} style={styles.name}>
                                {name.product?.nama_product}{" "}
                                x {name.qty}
                            </Text>
                        ))}

                        <Text style={{ marginTop: 7, borderTopWidth: 2 }}>
                            Cash :
                        </Text>
                        <Text style={styles.location}>
                            Rp.{cash !== null ? cash?.toLocaleString() : "-0"}
                        </Text>

                        <Text style={{ marginTop: 7, borderTopWidth: 2 }}>
                            Kembali :
                        </Text>
                        <Text style={styles.location}>
                            Rp.
                            {cash !== null
                                ? (cash - totalHarga).toLocaleString()
                                : "-0"}
                        </Text>
                    </View>
                </View>
                <View style={styles.rowBetween}>
                    <TouchableOpacity>
                        <Text style={styles.showLess}>Total Nominal :</Text>
                    </TouchableOpacity>
                    <Text style={styles.price}>
                        Rp. {totalHarga?.toLocaleString()}
                    </Text>
                </View>
            </View>

            <View
                style={{
                    justifyContent: "center",
                    gap: 10,
                    flexDirection: "row",
                    marginBottom: 10,
                }}
            >
                {/* <TouchableOpacity
                    onPress={() => handleUpdateStatus()}
                    style={{
                        backgroundColor: "#799EFF",
                        padding: 10,
                        borderRadius: 10,
                    }}
                >
                    <Text>Selesai</Text>
                </TouchableOpacity> */}

                <TouchableOpacity
                    onPress={() => deleteTransaksi()}
                    style={{
                        backgroundColor: "#FB4141",
                        padding: 10,
                        borderRadius: 10,
                        paddingHorizontal: 13,
                    }}
                >
                    <Text
                        style={{
                            color: "white",
                        }}
                    >
                        Delete
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleSavePdf}
                    style={{
                        backgroundColor: "#2171c6",
                        padding: 10,
                        borderRadius: 10,
                        // paddingHorizontal: 13,
                        flexDirection: "row",
                        gap: 8,
                    }}
                >
                    <Text
                        style={{
                            color: "white",
                        }}
                    >
                        Cetak
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};
const styles = StyleSheet.create({
    img: {
        width: 300,
        height: 600,
        marginHorizontal: "auto",
        borderRadius: 8,
        elevation: 5,
    },
    container: { flex: 1, backgroundColor: "#f4f4f4" },
    card: {
        backgroundColor: "#fff",
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
    buttonDate: {
        borderWidth: 1,
        width: 130,
        flexDirection: "row",
        gap: 5,
        marginTop: 20,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        backgroundColor: "#819067",
    },
    containerTransaksi: {
        borderWidth: 2,
        padding: 10,
    },
    dataTransaksi: {
        alignItems: "center",
    },
    containerCart: {
        alignItems: "center",
    },
    buttonDelete: {
        backgroundColor: "red",
        width: "40%",
        alignItems: "center",
        marginTop: 10,
        marginHorizontal: "auto",
        borderRadius: 20,
    },
});

export default DetailTransaksi;
