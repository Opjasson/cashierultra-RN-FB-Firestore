import { apiUrl } from "@/app/config/api";
import { DrawerContent } from "@/app/components";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { NavigationProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
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

const KelolaProduct: React.FC<props> = ({ navigation }) => {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(true);
    const [products, setProducts] = useState<
        {
            id: number;
            nama_product: string;
            deskripsi: string;
            harga_product: number;
            img_product: string;
            kategori_product: string;
            promo: string;
        }[]
    >([]);
    const [idLogin, setIdLogin] = useState<number>();

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

    const getProducts = async () => {
        const response = await fetch(apiUrl("/product"));
        const data = await response.json();
        setProducts(data);
        // console.log(data);
    };

    useEffect(() => {
        getProducts();
    }, []);

    const handleDeleteProduct = async (productId: number) => {
        await fetch(apiUrl(`/product/${productId}`), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        alert("Product berhasil dihapus!");
        navigation.navigate("Home");
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
    return (
        <SafeAreaView style={{ paddingBottom: 130, paddingTop: 10 }}>
            {/* Product */}
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
                    Kelola Product
                </Text>
            </View>

            <TouchableOpacity
                activeOpacity={0.8}
                style={{
                    justifyContent: "center",
                    flexDirection: "row",
                    backgroundColor: "#2171c6",
                    alignItems: "center",
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    borderRadius: 30,
                    gap: 5,
                    marginRight: 10,
                }}
                onPress={() => navigation.navigate("TambahProduct")}
            >
                <Feather name="plus-circle" size={24} color="white" />
                <Text style={{ color: "white" }}>Tambah Product</Text>
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        marginTop: 20,
                        justifyContent: "center",
                    }}
                >
                    {/* Show Products */}

                    {products.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() =>
                                navigation.navigate("UbahProduct", {
                                    data: item,
                                })
                            }
                            activeOpacity={0.7}
                            style={{
                                backgroundColor: "white",
                                borderRadius: 20,
                                paddingHorizontal: 5,
                                paddingVertical: 5,
                                elevation: 5,
                                shadowColor: "black",
                                marginRight: 8,
                                margin: 8,
                            }}
                        >
                            <Image
                                src={item.img_product}
                                style={{
                                    width: 144,
                                    height: 144,
                                    borderRadius: 20,
                                }}
                            />
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginTop: 10,
                                }}
                            >
                                <View>
                                    <Text
                                        style={{
                                            fontWeight: "500",
                                            fontSize: 14,
                                        }}
                                    >
                                        {item.nama_product}
                                    </Text>
                                    <Text
                                        style={{ marginTop: 5, fontSize: 10 }}
                                    >
                                        {item.kategori_product}
                                    </Text>
                                </View>
                            </View>

                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Text>
                                    Rp. {item.harga_product.toLocaleString()}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => handleDeleteProduct(item.id)}
                                >
                                    <MaterialIcons
                                        name="delete"
                                        size={24}
                                        color="black"
                                    />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            {/* End Product */}
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
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
});

export default KelolaProduct;
