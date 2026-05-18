import { apiUrl } from "@/app/config/api";
import { DrawerContent } from "@/app/components";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    Alert,
    BackHandler,
    Image,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuDrawer from "react-native-side-drawer";
import { Add } from "../../inventory/icons";

interface props {
    navigation: NavigationProp<any, any>;
}

const Home: React.FC<props> = ({ navigation }) => {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<string>("makanan");
    const [search, setSearch] = useState<string>();
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
    const [id, setId] = useState<number>();
    const [idLogin, setIdLogin] = useState<number>();
    const [user, setUser] = useState<string>();
    const [username, setUsername] = useState<string>();
    const [dataTransaksi, setDataTransaksi] = useState<
        {
            id: number;
            namaPelanggan: string;
            status: boolean;
            buktiBayar: string;
            cash: number;
        }[]
    >([]);

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

    // Get Data Login --------------------------
    const getUserId = async () => {
        const response = await fetch(apiUrl("/login"));
        const data = await response.json();
        const token = await AsyncStorage.getAllKeys();
        console.log("TOKENALL", token);

        setIdLogin(Object.values(data)[0]?.id);
        setId(Object.values(data)[0]?.userId);
    };

    useEffect(() => {
        getUserId();
    }, []);

    const getAkunLoggin = async () => {
        if (!id) return;

        const response = await fetch(apiUrl(`/user/${id}`));
        const user = await response.json();
        // console.log("login",user);
        if (user != null) {
            setUser(user.role);
            setUsername(user.username);
        }
    };

    useEffect(() => {
        getAkunLoggin();
    }, [id]);

    const logOut = async () => {
        await fetch(apiUrl(`/login/${idLogin}`), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        navigation.navigate("LoginPage" as never);
    };
    // ------------------------

    const getProducts = async () => {
        const response = await fetch(apiUrl("/product"));
        const data = await response.json();
        setProducts(data);
        // console.log(data);
    };

    useEffect(() => {
        getProducts();
    }, []);

    // menfilter data berdasarkan yang diketian di search
    const searchProduct = products.filter((item) => {
        const words = search?.split(" ");
        return words?.some((word) => item.nama_product.includes(word));
    });

    const toggleOpen = () => {
        if (open === false) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    };

    const getTransaksi = async () => {
        if (!username) return;

        const response = await fetch(
            apiUrl(
                `/transaksi?namaPelanggan=${encodeURIComponent(username)}&isDraft=true`,
            ),
        );
        const transaksiS = await response.json();
        setDataTransaksi(transaksiS.response || []);
    };

    useEffect(() => {
        getTransaksi();
    }, [username]);

    const transaksiAktif = dataTransaksi.find(
        (item) => item.buktiBayar === null && item.cash === null,
    );

    const handleDeleteStorage = async () => {
        await AsyncStorage.removeItem("infoPesanan");
        navigation.navigate("HistoryPesanan");
    };

    // cek infoPesanan storage
    useEffect(() => {
        const cekToken = async () => {
            const token = await AsyncStorage.getItem("infoPesanan");
            if (username === "Zaki_Waiter" && token !== null) {
                Alert.alert(
                    "Pesanan Telah Selesai",
                    `Atas Nama Pelanggan : ${token}`,
                    [
                        {
                            text: "Okey",
                            onPress: handleDeleteStorage,
                            style: "default",
                        },
                    ],
                );
                console.log(token);
            }
        };
        cekToken();
    }, [username]);
    // End Cek infoPesanan storage ------

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

    const openProductDetail = (product: {
        id: number;
        nama_product: string;
        deskripsi: string;
        harga_product: number;
        img_product: string;
        kategori_product: string;
        promo: string;
    }) => {
        navigation.navigate("DetailProduct", {
            data: product,
            idTrans: transaksiAktif?.id,
            idUser: id,
            username,
        });
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "#FBFBFB",
                paddingBottom: 20,
            }}
        >
            <StatusBar backgroundColor={"#2171c6"} barStyle={"light-content"} />
            <ScrollView>
                {/* Top menu */}
                <View
                    style={{
                        backgroundColor: "#2171c6",
                        paddingVertical: 18,
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                    }}
                >
                    {/* header page */}
                    <View
                        style={{
                            flexDirection: "row",
                            marginHorizontal: 30,
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Ionicons
                            name="menu"
                            size={30}
                            color="white"
                            onPress={() => toggleOpen()}
                        />

                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    fontWeight: "500",
                                    fontSize: 12,
                                    marginLeft: 5,
                                    color: "white",
                                }}
                            >
                                💌 Kota Tegal, Indonesia
                            </Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.7}>
                            <FontAwesome name="user" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    {/* end header page */}

                    <View style={{ marginHorizontal: 30, marginTop: 15 }}>
                        <Text
                            style={{
                                fontWeight: "500",
                                fontSize: 14,
                                color: "white",
                                textAlign: "center",
                            }}
                        >
                            Good Morning, {username}
                        </Text>
                    </View>
                    {/* Search tab */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "90%",
                            marginHorizontal: "auto",
                            borderWidth: 1,
                            borderColor: "#fff",
                            borderRadius: 8,
                            paddingHorizontal: 20,
                            marginTop: 20,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 2,
                                width: "100%",
                            }}
                        >
                            <TextInput style={{ fontSize: 20, padding: 0 }}>
                                👩🏼‍⚕️
                            </TextInput>
                            <TextInput
                                placeholder="Pencarian ..."
                                placeholderTextColor={"white"}
                                style={{ width: "100%", color: "#fff" }}
                                onChangeText={(text) => setSearch(text)}
                            />
                        </View>
                    </View>
                    {/* End Search */}

                </View>
                {/* End top menu */}

                {/* Product */}
                <View style={{ marginTop: 20, marginLeft: 20 }}>
                    <Text style={{ fontWeight: "500", padding: 10 }}>
                        Semua Produk
                    </Text>
                    <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                    >
                        {/* Product */}
                        {search?.length > 0 && searchProduct.length > 0
                            ? searchProduct.map((a, index) => (
                                  <TouchableOpacity
                                      key={index}
                                      onPress={() => openProductDetail(a)}
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
                                          width: 155,
                                      }}
                                  >
                                      <Image
                                          src={a?.img_product}
                                          style={{
                                              width: 144,
                                              height: 130,
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
                                                  {a.nama_product}
                                              </Text>
                                              <Text
                                                  style={{
                                                      marginTop: 5,
                                                      fontSize: 10,
                                                  }}
                                              >
                                                  {a.deskripsi.substring(0, 30)}
                                                  ...
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
                                              Rp.
                                              {a.harga_product.toLocaleString()}
                                          </Text>
                                          <Image source={Add} />
                                      </View>
                                  </TouchableOpacity>
                              ))
                            : products.map((item, index) => (
                                  <TouchableOpacity
                                      key={index}
                                      onPress={() => openProductDetail(item)}
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
                                          width: 155,
                                      }}
                                  >
                                      <Image
                                          src={item?.img_product}
                                          style={{
                                              width: 144,
                                              height: 130,
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
                                                  style={{
                                                      marginTop: 5,
                                                      fontSize: 10,
                                                  }}
                                              >
                                                  {item.deskripsi.substring(
                                                      0,
                                                      30,
                                                  )}
                                                  ...
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
                                              Rp.
                                              {item.harga_product.toLocaleString()}
                                          </Text>
                                          <Image source={Add} />
                                      </View>
                                  </TouchableOpacity>
                              ))}

                        {/* End Product */}
                    </ScrollView>
                </View>
                {/* End Product */}

                {/* Special offer */}
                <View
                    style={{
                        marginTop: 20,
                        width: "88%",
                        marginHorizontal: "auto",
                        borderRadius: 10,
                        backgroundColor: "#FAF7F3",
                    }}
                >
                    {/* Product */}
                    <Text style={{ fontWeight: "500", padding: 10 }}>
                        Penawaran Promo
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        {products
                            .filter((item, index) => item.promo !== "no")
                            .map((a, index) => (
                                <TouchableOpacity
                                    onPress={() => openProductDetail(a)}
                                    key={index}
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
                                        width: 155,
                                    }}
                                >
                                    <Image
                                        src={a.img_product}
                                        style={{
                                            width: 144,
                                            height: 130,
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
                                                {a.nama_product}
                                            </Text>
                                            <Text
                                                style={{
                                                    marginTop: 5,
                                                    fontSize: 10,
                                                }}
                                            >
                                                {a.deskripsi.substring(0, 35)}
                                                ...
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
                                            Rp{a.harga_product.toLocaleString()}
                                        </Text>
                                        <Image source={Add} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                    </View>

                    {/* End Product */}
                </View>
                {/* End Special Offer */}
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

export default Home;
