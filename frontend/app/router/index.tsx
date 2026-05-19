import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import {
    Cart,
    DetailProduct,
    KelolaProduct,
    Home,
    Profile,
    SplashScreen,
    TambahProduct,
    UbahProduct,
    HistoryPesanan,
    LoginPage,
    DetailTransaksi,
    Laporan,
    CekEmail,
    ChangePass,
    TambahUser,
} from "../pages";
import UbahUser from "../pages/ubahUser";
import RegisterPage from "../pages/register";

const Stack = createNativeStackNavigator();

const Router = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsCheckingAuth(false);
        });

        return unsubscribe;
    }, []);

    if (isCheckingAuth) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#faf9f7",
                }}
            >
                <ActivityIndicator size="large" color="#2171c6" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <>
                    <Stack.Screen name="Home" component={Home} />
                    <Stack.Screen
                        name="KelolaProduct"
                        component={KelolaProduct}
                    />
                    <Stack.Screen name="Cart" component={Cart} />
                    <Stack.Screen name="Profile" component={Profile} />
                    <Stack.Screen
                        name="DetailProduct"
                        component={DetailProduct}
                    />
                    <Stack.Screen name="Laporan" component={Laporan} />
                    <Stack.Screen
                        name="ChangePass"
                        component={ChangePass}
                    />
                    <Stack.Screen
                        options={{
                            headerShown: true,
                            headerTitle: "Detail Transaksi",
                        }}
                        name="DetailTransaksi"
                        component={DetailTransaksi}
                    />
                    <Stack.Screen
                        options={{
                            headerShown: true,
                            headerTitle: "Tambah Product",
                        }}
                        name="TambahProduct"
                        component={TambahProduct}
                    />
                    <Stack.Screen
                        options={{
                            headerShown: true,
                            headerTitle: "Ubah Product",
                        }}
                        name="UbahProduct"
                        component={UbahProduct}
                    />
                    <Stack.Screen
                        name="HistoryPesanan"
                        component={HistoryPesanan}
                    />
                    <Stack.Screen
                        options={{
                            headerShown: true,
                            headerTitle: "Tambah User",
                        }}
                        name="TambahUser"
                        component={TambahUser}
                    />
                    <Stack.Screen
                        options={{
                            headerShown: true,
                            headerTitle: "Ubah User",
                        }}
                        name="UbahUser"
                        component={UbahUser}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen
                        name="SplashScreen"
                        component={SplashScreen}
                    />
                    <Stack.Screen
                        name="RegisterPage"
                        component={RegisterPage}
                    />
                    <Stack.Screen name="LoginPage" component={LoginPage} />
                    <Stack.Screen name="CekEmail" component={CekEmail} />
                    <Stack.Screen
                        name="ChangePass"
                        component={ChangePass}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};

export default Router;
