import { apiUrl } from "@/app/config/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface props {
    navigation: NavigationProp<any, any>;
    route: RouteProp<any, any>;
}

const TambahProduct: React.FC<props> = ({ navigation, route }) => {
    const [imgSend, setImgSend] = useState<string>();
    const [nama_product, setNama_Product] = useState<string>();
    const [harga_product, setHarga_Product] = useState<number>();
    const [id, setId] = useState<number>();
    const [kategori, setKategori] = useState<string>();
    const [deskripsi, setDeskripsi] = useState<string>();
    const [img_product, setImg_Product] = useState<string>();
    const [promo, setPromo] = useState<string>();

    console.log();

    // handle uplod image --------------------
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

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImg_Product(result.assets[0].uri);
            uploadToCloudinary(result.assets[0].uri);
        }
    };

    const uploadToCloudinary = async (imageUri) => {
        const data2 = new FormData();

        // Ekstrak file name dan type dari URI
        const fileName = imageUri.split("/").pop();
        const fileType = fileName.split(".").pop();

        data2.append("file", {
            uri: imageUri,
            name: fileName,
            type: `image/${fileType}`,
        });

        data2.append("upload_preset", "Cloudinary_my_first_time"); // dari cloudinary
        data2.append("cloud_name", "dqcnnluof");

        try {
            const res = await fetch(
                "https://api.cloudinary.com/v1_1/dqcnnluof/image/upload",
                {
                    method: "POST",
                    body: data2,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            const json = await res.json();
            setImgSend(json.secure_url);
            console.log("Uploaded URL:", json.secure_url);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    // end handle uplod image --------------

    // Handle Update Product -----------
    const handleUpdateProduct = async () => {
        try {
            await fetch(apiUrl("/product"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nama_product: nama_product,
                    harga_product: harga_product,
                    kategori_product: kategori,
                    img_product: imgSend,
                    deskripsi: deskripsi,
                    promo: promo,
                }),
            });
            alert("Product Berhasil ditambahkan");
            navigation.navigate("KelolaProduct");
        } catch (error) {
            console.log(error);
        }
    };
    // end Handle Update Product -----------

    return (
        <SafeAreaView>
            <ScrollView>
                <View style={styles.containerForm}>
                    <Text style={styles.textLabel}>Nama Product</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            marginBottom: 5,
                            borderRadius: 5,
                        }}
                        keyboardType="default"
                        placeholder="Nama product"
                        onChangeText={(text) => setNama_Product(text)}
                    />

                    <Text style={styles.textLabel}>Harga</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            marginBottom: 5,
                            borderRadius: 5,
                        }}
                        keyboardType="numeric"
                        placeholder="Rp."
                        onChangeText={(text) => setHarga_Product(Number(text))}
                    />

                    <Text style={styles.textLabel}>Deskripsi</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Deskripsi"
                        onChangeText={(text) => setDeskripsi(text)}
                        multiline={true}
                        numberOfLines={4}
                    />

                    <Text style={styles.textLabel}>Kategori</Text>
                    <View
                        style={{
                            borderWidth: 1,
                            marginBottom: 5,
                            borderRadius: 5,
                        }}
                    >
                        <Picker
                            onValueChange={(value, index) => setKategori(value)}
                        >
                            <Picker.Item
                                value={"undefined"}
                                label="Pilih Ketegori"
                            />
                            <Picker.Item value={"spray"} label="Spray" />
                            <Picker.Item value={"cream"} label="Cream" />
                            <Picker.Item
                                value={"kombinasi"}
                                label="Kombinasi"
                            />
                        </Picker>
                    </View>

                    <Text style={styles.textLabel}>Promo?</Text>
                    <View
                        style={{
                            borderWidth: 1,
                            marginBottom: 5,
                            borderRadius: 5,
                        }}
                    >
                        <Picker
                            onValueChange={(value, index) => setPromo(value)}
                        >
                            <Picker.Item
                                value={"undefined"}
                                label="Setting Promo"
                            />
                            <Picker.Item value={"no"} label="No" />
                            <Picker.Item value={"offer"} label="Offer" />
                        </Picker>
                    </View>

                    <Text style={styles.textLabel}>Gambar Product</Text>
                    {img_product?.length > 0 ? (
                        <Image
                            src={img_product}
                            style={{
                                width: 200,
                                height: 200,
                                marginLeft: 6,
                                marginBottom: 10,
                            }}
                        />
                    ) : (
                        ""
                    )}

                    <TouchableOpacity
                        style={styles.button2}
                        onPress={() => pickImage()}
                    >
                        <Ionicons
                            name="camera-outline"
                            size={24}
                            color="black"
                        />
                        <Text style={{ color: "black" }}>Pilih Gambar</Text>
                    </TouchableOpacity>
                </View>
                {/* End Form */}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleUpdateProduct}
                >
                    <Text style={{ color: "white" }}>Kirim</Text>
                </TouchableOpacity>
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

export default TambahProduct;
