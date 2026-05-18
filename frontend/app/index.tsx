import {
    NavigationContainer,
    NavigationIndependentTree,
} from "@react-navigation/native";
import { Text, View } from "react-native";
import { SplashScreen } from "./pages";
import "react-native-gesture-handler";
import Router from "./router";

export default function Index() {
    return (
        <NavigationIndependentTree>
            <NavigationContainer>
                <Router />
            </NavigationContainer>
        </NavigationIndependentTree>
    );
}
