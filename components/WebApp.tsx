import { useEffect, useState } from "react";
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
import { ActivityIndicator, Platform, View } from "react-native";

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
  const [isLoading, setIsLoading] = useState(true);
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

  const ActivityIndicatorElement = () => {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#363741",
        }}
      >
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  };

  return (
    <>
      {Platform.OS === "web" ? (
        <iframe
          src={process.env.REACT_APP_URL}
          height={"100%"}
          width={"100%"}
        />
      ) : (
        <>
          {isLoading && ActivityIndicatorElement()}
          <View
            style={
              isLoading
                ? {}
                : { width: "100%", height: "100%", backgroundColor: "#FFF" }
            }
          >
            <WebView
              source={{
                uri: process.env.REACT_APP_URL || "",
              }}
              onMessage={(e) => setMessage(e.nativeEvent.data)}
              onLoad={() => setIsLoading(false)}
            />
          </View>
        </>
      )}
    </>
  );
}
