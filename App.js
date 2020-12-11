import React, { useEffect, useReducer, useMemo } from "react";
import { Alert } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  BoardStackScreen,
  LoginStackScreen,
  MatchingStackScreen,
  MyPageStackScreen,
  TeamStackScreen,
} from "./src/screens/Stack";
import { AuthContext } from "./src/context";
import { api } from "./src/api";

const Tab = createBottomTabNavigator();

const { Provider } = AuthContext;

export default App = () => {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
      }
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };
    bootstrapAsync();
  }, []);

  const success = (navigation) =>
    Alert.alert(
      "회원가입 성공!!",
      `로그인 페이지로 이동합니다.`,
      [
        { text: "확인", onPress: () => { console.log("OK Pressed"), navigation.navigate('로그인'); } }
      ],
      { cancelable: false }
    );


  const authContext = useMemo(
    () => ({
      signIn: async data => {
        try {
          const res = await api.post("/api/login", data);
          const token = res.data.token;
          await AsyncStorage.setItem("token", token);
          console.log("토큰 저장 성공");
          dispatch({ type: 'SIGN_IN', token: token });
          console.log("로그인 성공");
        } catch (err) {
          console.log("로그인 실패");
        }
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem("token");
          console.log("토큰 삭제 성공");
          dispatch({ type: 'SIGN_OUT' });
          console.log("로그아웃");
        } catch (err) {
          console.log("토큰 삭제 실패");
        }
      },
      signUp: async (data, navigation) => {
        try {
          await api.post("/api/accounts", data);
          success(navigation)
          console.log("회원가입 성공");
        } catch (err) {
          console.log("회원가입 실패");
        }
      },
    }),
    []
  );

  return (
    <Provider value={authContext}>
      <NavigationContainer>
        {state.userToken == null ?
          (
            <>
              <LoginStackScreen />
            </>
          ) :
          (
            <>
              <Tab.Navigator tabBarOptions={{
                activeTintColor: '#e85433'
              }}>
                <Tab.Screen name="마이페이지" component={MyPageStackScreen}
                  options={{
                    tabBarLabel: "마이페이지",
                    tabBarIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="account" color={color} size={size} />
                    ),
                  }} />
                <Tab.Screen name="팀목록" component={TeamStackScreen}
                  options={{
                    tabBarLabel: "팀목록",
                    tabBarIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="account-supervisor" color={color} size={size} />
                    ),
                  }} />
                <Tab.Screen name="경기" component={MatchingStackScreen}
                  options={{
                    tabBarLabel: "경기",
                    tabBarIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="soccer" color={color} size={size} />
                    ),
                  }} />
                <Tab.Screen name="게시판" component={BoardStackScreen}
                  options={{
                    tabBarLabel: "게시판",
                    tabBarIcon: ({ color, size }) => (
                      <MaterialCommunityIcons name="clipboard-text-outline" color={color} size={size} />
                    ),
                  }} />
              </Tab.Navigator>
            </>
          )} 
      </NavigationContainer>
    </Provider>
  )
}