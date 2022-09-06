import { useEffect, useState } from "react";
import { StyleSheet, StatusBar } from "react-native";
import WebView from "react-native-webview";
import * as Notification from "expo-notifications";
import * as Permission from "expo-permissions";

Notification.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    Permission.getAsync(Permission.NOTIFICATIONS)
      .then((response) => {
        if (response.status !== "granted") {
          return Permission.askAsync(Permission.NOTIFICATIONS);
        }
        return response;
      })
      .then((response) => {
        if (response.status !== "granted") {
          return;
        }
      });
  }, []);

  const handleNotification = (title: string, body: string) => {
    Notification.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: {
        seconds: 1,
      },
    });
  };

  useEffect(() => {
    if (message) {
      const messageObj = JSON.parse(message);
      handleNotification(messageObj.title, messageObj.body);
      setMessage("");
    }
  }, [message]);

  return (
    <>
      <WebView
        source={{
          uri: (process && process.env && process.env.REACT_APP_URL) || "",
        }}
        onMessage={(e) => setMessage(e.nativeEvent.data)}
      />
      <StatusBar />
    </>
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
