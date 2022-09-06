import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import WebView from "react-native-webview";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import storage from "@react-native-async-storage/async-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [message, setMessage] = useState("");

  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    const getPermission = async () => {
      if (Constants.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          alert("Enable push notifications to use the app!");
          await storage.setItem("expopushtoken", "");
          return;
        }
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        await storage.setItem("expopushtoken", token);
      } else {
        alert("Must use physical device for Push Notifications");
      }

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    };

    getPermission();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {});

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener?.current);
    };
  }, []);

  const onClick = async (text: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Title",
        body: text,
        data: { data: "data goes here" },
      },
      trigger: {
        seconds: 1,
      },
    });
  };

  useEffect(() => {
    if (message) {
      onClick(message);
    }
  }, [message]);

  return (
    <>
      <WebView
        source={{ uri: "https://schedule-lessons-app.herokuapp.com/" }}
        onMessage={(e) => setMessage(e.nativeEvent.data)}
      />
      <TouchableOpacity onPress={(e) => onClick("111")}>
        <Text style={{ backgroundColor: "red", padding: 10, color: "white" }}>
          Click me to send a push notification
        </Text>
      </TouchableOpacity>
      <Text>{message}</Text>
      <StatusBar />
    </>
    // <View style={styles.container}>

    //     <Text>111</Text>
    //     {/* <StatusBar style="auto" /> */}
    //   </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
