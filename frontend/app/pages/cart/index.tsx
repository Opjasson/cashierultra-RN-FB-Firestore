import { apiUrl } from "@/app/config/api";
import { DrawerContent } from "@/app/components";
import { AntDesign } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useMemo, useState } from "react";
import {
    Image,
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
import MenuDrawer from "react-native-side-drawer";

interface props {
    navigation: NavigationProp<any, any>;
}

type CartItem = {
    id: number;
    qty: number;
    productId: number;
    transaksiId: number;
    product?: {
        id: number;
        nama_product: string;
        harga_product: number;
        img_product: string;
        kategori_product: string;
    };
};

type DraftTransaksi = {
    id: number;
    namaPelanggan: string;
    keranjangs: CartItem[];
};

const Cart: React.FC<props> = ({ navigation }) => {
    const [idLogin, setIdLogin] = useState<number>();
    const [user, setUser] = useState<string>();
    const [username, setUsername] = useState<string>();
    const [open, setOpen] = useState(false);
    const [draftTransaksi, setDraftTransaksi] = useState<DraftTransaksi | null>(
        null,
    );
    const [dataShow, setDataShow] = useState<CartItem[]>([]);
    const [cashInput, setCashInput] = useState<string>("");
    const [catatan, setCatatan] = useState<string>("");
    const [buktiBayar, setBuktiBayar] = useState<string>();
    const [buktiBayarUrl, setBuktiBayarUrl] = useState<string>();
    const [isUploadingBukti, setIsUploadingBukti] = useState(false);
    const [whastapp, setWhastapp] = useState("");
    const [alamat, setAlamat] = useState("");

    const toggleOpen = () => {
        setOpen((prev) => !prev);
    };

    useEffect(() => {
        (async () => {
            if (Platform.OS !== "web") {
                const { status } =
                    await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (status !== "granted") {
                    alert("Permission to access gallery is required!");
                }
            }
        })();
    }, []);

    const getDraftTransaksi = async (currentUsername?: string) => {
        if (!currentUsername) return;

        const response = await fetch(
            apiUrl(
                `/transaksi?namaPelanggan=${encodeURIComponent(currentUsername)}&isDraft=true`,
            ),
        );
        const data = await response.json();
        const currentDraft = data.response?.[0] ?? null;
        setDraftTransaksi(currentDraft);
        setDataShow(currentDraft?.keranjangs ?? []);
    };

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                const response = await fetch(apiUrl("/login"));
                const loginData = await response.json();
                const loginInfo = Object.values(loginData)[0] as
                    | { id?: number; userId?: number }
                    | undefined;

                setIdLogin(loginInfo?.id);

                if (!loginInfo?.userId) return;

                const responseUser = await fetch(
                    apiUrl(`/user/${loginInfo.userId}`),
                );
                const userData = await responseUser.json();
                setUser(userData?.role);
                setUsername(userData?.username);

                if (userData?.username) {
                    await getDraftTransaksi(userData.username);
                }
            };

            loadData();
        }, []),
    );

    const ubahQty = (idCart: number, increment: number) => {
        const update = dataShow.map((item) => {
            if (item.id === idCart) {
                const newQty = item.qty + increment;
                return { ...item, qty: newQty > 0 ? newQty : 1 };
            }
            return item;
        });
        setDataShow(update);
    };

    const totalHarga = useMemo(() => {
        return dataShow.reduce((total, item) => {
            const harga = item.product?.harga_product ?? 0;
            return total + harga * item.qty;
        }, 0);
    }, [dataShow]);

    const cash = Number(cashInput || 0);
    const kembalian = cash > totalHarga ? cash - totalHarga : 0;

    const uploadBuktiBayarToCloudinary = async (imageUri: string) => {
        const formData = new FormData();
        const fileName = imageUri.split("/").pop() ?? "bukti-transfer.jpg";
        const fileType = fileName.split(".").pop() ?? "jpg";

        formData.append("file", {
            uri: imageUri,
            name: fileName,
            type: `image/${fileType}`,
        } as any);

        formData.append("upload_preset", "Cloudinary_my_first_time");
        formData.append("cloud_name", "dmqwrh8nv");

        try {
            setIsUploadingBukti(true);
            const response = await fetch(
                "https://api.cloudinary.com/v1_1/dmqwrh8nv/image/upload",
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            const json = await response.json();

            if (!response.ok || !json.secure_url) {
                alert("Upload bukti transfer gagal.");
                return;
            }

            setBuktiBayarUrl(json.secure_url);
        } catch (error) {
            console.log(error);
            alert("Terjadi error saat upload bukti transfer.");
        } finally {
            setIsUploadingBukti(false);
        }
    };

    const pickBuktiBayar = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            setBuktiBayar(imageUri);
            setBuktiBayarUrl(undefined);
            await uploadBuktiBayarToCloudinary(imageUri);
        }
    };

    const handleDeleteCart = async (cartId: number) => {
        const response = await fetch(apiUrl(`/cart/${cartId}`), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();

        if (!response.ok) {
            alert(data.msg || "Gagal menghapus item keranjang.");
            return;
        }

        const updatedItems = dataShow.filter((item) => item.id !== cartId);
        setDataShow(updatedItems);

        if (updatedItems.length === 0) {
            setDraftTransaksi(null);
        }
    };

    const buyHandle = async () => {
        if (!draftTransaksi?.id || dataShow.length === 0) {
            alert("Keranjang masih kosong.");
            return;
        }

        if (!buktiBayar && cash < totalHarga) {
            alert("Nominal cash belum cukup.");
            return;
        }

        if (isUploadingBukti) {
            alert("Bukti transfer masih diupload.");
            return;
        }

        try {
            const response = await fetch(
                apiUrl(`/transaksi/${draftTransaksi.id}/checkout`),
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cash,
                        catatanTambahan: catatan || null,
                        buktiBayar: buktiBayarUrl,
                        whastapp: whastapp,
                        alamat: alamat,
                        status: true,
                        items: dataShow.map((item) => ({
                            id: item.id,
                            qty: item.qty,
                        })),
                    }),
                },
            );
            const data = await response.json();

            if (!response.ok) {
                alert(data.msg || "Checkout gagal.");
                return;
            }

            alert("Transaksi berhasil diproses.");
            setDraftTransaksi(null);
            setDataShow([]);
            setCashInput("");
            setCatatan("");
            setWhastapp("");
            setBuktiBayar(undefined);
            setBuktiBayarUrl(undefined);
            navigation.navigate("HistoryPesanan");
        } catch (error) {
            console.log(error);
            alert("Terjadi error saat checkout.");
        }
    };

    const logOut = async () => {
        await fetch(apiUrl(`/login/${idLogin}`), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        navigation.navigate("LoginPage" as never);
    };

    const sideBarContent = () => {
        return (
            <DrawerContent
                toggleOpen={toggleOpen}
                onPress1={() => navigation.navigate("Cart")}
                onPress2={() => navigation.navigate("Home")}
                onPress3={() => navigation.navigate("HistoryPesanan")}
                status={user === "kasir" ? false : true}
                onPress4={() => logOut()}
                onPress5={() => navigation.navigate("KelolaProduct")}
                onPress6={() => navigation.navigate("Laporan")}
            />
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                style={{
                    flex: 1,
                    backgroundColor: "#FBFBFB",
                    paddingBottom: 20,
                }}
            >
                <StatusBar barStyle={"default"} />
                <View
                    style={{
                        flexDirection: "row",
                        marginBottom: 20,
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
                        Keranjang Belanja
                    </Text>
                </View>

                {dataShow.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>
                            Belum ada item aktif
                        </Text>
                        <Text style={styles.emptyText}>
                            Mulai transaksi dari halaman utama lalu tambahkan
                            produk ke keranjang.
                        </Text>
                    </View>
                ) : null}

                {dataShow.map((item) => (
                    <View style={styles.card} key={item.id}>
                        <Image
                            src={item.product?.img_product}
                            style={styles.image}
                        />
                        <View style={styles.cardContent}>
                            <View style={styles.rowBetween}>
                                <View>
                                    <Text style={styles.productTitle}>
                                        {item.product?.nama_product}
                                    </Text>
                                    <Text style={styles.productSubtitle}>
                                        {item.product?.kategori_product}
                                    </Text>
                                </View>
                                <Text style={styles.price}>
                                    Rp{" "}
                                    {(
                                        item.product?.harga_product ?? 0
                                    ).toLocaleString()}
                                </Text>
                            </View>

                            <View style={styles.quantityRow}>
                                <Text style={styles.quantity}>{item.qty}</Text>

                                <TouchableOpacity
                                    style={styles.plusButton}
                                    onPress={() => ubahQty(item.id, -1)}
                                >
                                    <AntDesign
                                        name="minus"
                                        size={18}
                                        color="#fff"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.plusButton}
                                    onPress={() => ubahQty(item.id, 1)}
                                >
                                    <AntDesign
                                        name="plus"
                                        size={18}
                                        color="#fff"
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleDeleteCart(item.id)}
                                >
                                    <FontAwesome
                                        name="trash"
                                        size={24}
                                        color="black"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))}

                <View style={styles.summary}>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Catatan Tambahan"
                        onChangeText={(text) => setCatatan(text)}
                        value={catatan}
                        multiline={true}
                        numberOfLines={4}
                    />

                    <TextInput
                        style={styles.cashInput}
                        keyboardType="number-pad"
                        placeholder="Cash"
                        value={cashInput}
                        onChangeText={setCashInput}
                    />

                    <Text style={styles.textLabel}>Metode Pembayaran :</Text>
                    <Text style={{backgroundColor: "#c3c3f7"}}>DANA {"(+62 817-7022-0529)"}</Text>
                    <Text style={{backgroundColor: "#c3c3f7"}}>Bank BRI {"(544366678, Owner Ultra Glow)"}</Text>

                    <Text style={styles.textLabel}>Bukti Transfer</Text>
                    {buktiBayar ? (
                        <Image
                            source={{ uri: buktiBayar }}
                            style={styles.buktiImage}
                        />
                    ) : null}

                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={pickBuktiBayar}
                        disabled={isUploadingBukti}
                    >
                        <Ionicons
                            name="camera-outline"
                            size={24}
                            color="black"
                        />
                        <Text style={styles.uploadButtonText}>
                            {isUploadingBukti
                                ? "Mengupload..."
                                : buktiBayarUrl
                                  ? "Ganti Bukti Transfer"
                                  : "Pilih Bukti Transfer"}
                        </Text>
                    </TouchableOpacity>

                    <TextInput
                        style={styles.cashInput}
                        keyboardType="number-pad"
                        placeholder="Whastapp"
                        onChangeText={setWhastapp}
                    />

                    <TextInput
                        style={styles.cashInput}
                        keyboardType="default"
                        placeholder="Alamat"
                        onChangeText={setAlamat}
                    />

                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>
                            {user !== "user" ? "Kasir :" : "Pelanggan :"}{" "}
                        </Text>
                        <Text style={styles.totalValue}>{username || "-"}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalLabel}>
                            Rp {totalHarga.toLocaleString()}
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Kembalian</Text>
                        <Text style={styles.totalValue}>
                            Rp {kembalian.toLocaleString()}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[
                        styles.buyButton,
                        (dataShow.length === 0 || isUploadingBukti) &&
                            styles.buyButtonDisabled,
                    ]}
                    onPress={() => buyHandle()}
                    disabled={dataShow.length === 0 || isUploadingBukti}
                >
                    <Text style={styles.buyText}>Checkout</Text>
                </TouchableOpacity>
                <MenuDrawer
                    open={open}
                    position={"left"}
                    drawerContent={sideBarContent()}
                    drawerPercentage={70}
                    animationTime={250}
                    overlay={true}
                    opacity={0.4}
                ></MenuDrawer>
            </ScrollView>
        </SafeAreaView>
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
    cashInput: {
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 8,
        marginTop: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    buktiImage: {
        width: "100%",
        height: 180,
        borderRadius: 10,
        marginTop: 6,
        marginBottom: 10,
    },
    uploadButton: {
        backgroundColor: "#fff",
        width: "100%",
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 9,
        borderWidth: 1,
        borderColor: "gray",
        flexDirection: "row",
        gap: 8,
    },
    uploadButtonText: {
        color: "black",
        fontWeight: "500",
    },
    container: {
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        paddingBottom: 20,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#fdfdfd",
        borderRadius: 16,
        marginBottom: 16,
        padding: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    cardContent: {
        flex: 1,
        marginLeft: 10,
        justifyContent: "space-between",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    productTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    productSubtitle: {
        fontSize: 12,
        color: "#666",
    },
    price: {
        fontWeight: "bold",
        color: "#000",
    },
    quantityRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        gap: 12,
    },
    quantity: {
        fontSize: 16,
        fontWeight: "bold",
    },
    plusButton: {
        backgroundColor: "#1E5128",
        padding: 6,
        borderRadius: 20,
    },
    summary: {
        marginTop: 16,
        gap: 8,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 4,
    },
    totalLabel: {
        fontWeight: "bold",
        fontSize: 16,
    },
    totalValue: {
        fontSize: 16,
    },
    buyButton: {
        backgroundColor: "#2171c6",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20,
    },
    buyButtonDisabled: {
        opacity: 0.5,
    },
    buyText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    emptyState: {
        paddingVertical: 32,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: "#f7f7f7",
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    emptyText: {
        color: "#666",
        lineHeight: 20,
    },
});

export default Cart;
