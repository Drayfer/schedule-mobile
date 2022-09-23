import { useEffect, useState } from "react";
import { Text } from "react-native";
import WebView from "react-native-webview";
import * as Notification from "expo-notifications";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useDispatch } from "react-redux";
import {
  resetUserInfo,
  setUserInfo,
  setWebviewToken,
} from "../store/slices/userInfoSlice";
import axios from "axios";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

Notification.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function WebApp() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [message, setMessage] = useState("");

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
          return;
        }
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        dispatch(setWebviewToken(token));
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
  }, [userInfo]);

  useEffect(() => {
    if (message) {
      if (message === "exit") {
        dispatch(resetUserInfo());
        axios.post(
          `${process.env.REACT_APP_API}/option/webview/token/${userInfo.userId}`,
          { webviewToken: "" }
        );
        setMessage("");
        return;
      }
      const messageObj = JSON.parse(message);
      dispatch(setUserInfo(messageObj));
      setMessage("");
    }
  }, [message]);

  useEffect(() => {
    if (userInfo.userId && userInfo.token && userInfo.webviewToken) {
      axios.post(
        `${process.env.REACT_APP_API}/option/webview/token/${userInfo.userId}`,
        {
          webviewToken: userInfo.webviewToken,
        }
      );
    }
  }, [userInfo]);

  return (
    <>
      <WebView
        source={{
          uri: process.env.REACT_APP_URL || "",
        }}
        onMessage={(e) => setMessage(e.nativeEvent.data)}
      />
      <Text>
        {userInfo.userId} {userInfo.webviewToken}
      </Text>
    </>
  );
}
