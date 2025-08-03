import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from './Components/DashboardScreen';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import ChatScreen from './Components/ChatScreen'
import  SplashScreen  from './Components/SplashScreen'
import ForgotPassword from './Components/ForgotPassword'
export default function Index() {
  const Stack=createNativeStackNavigator();
  return (
    <Stack.Navigator>
      <Stack.Screen name="SplashScreen" component={SplashScreen}/>
      <Stack.Screen name="SignUp" component={SignUp}/>
      <Stack.Screen name="Login" component={Login}/>
      <Stack.Screen name="DashboardScreen" component={DashboardScreen}/>
      <Stack.Screen name="ChatScreen" component={ChatScreen}/>
      <Stack.Screen name="ForgotPassword" component={ForgotPassword}/>

    </Stack.Navigator>
  );
}
