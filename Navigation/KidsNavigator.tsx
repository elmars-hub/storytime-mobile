import { NavigatorScreenParams } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import KidSetupNavigator, {
  KidsSetupNavigatorParamList,
} from "./KidsSetupNavigator";
import KidsTabNavigator from "./KidsTabNavigator";

type KidsNavigatorParamList = {
  setup: NavigatorScreenParams<KidsSetupNavigatorParamList>;
  index: { childId?: string; selected?: string };
};
type KidsNavigatorProp = NativeStackNavigationProp<KidsNavigatorParamList>;

const Stack = createNativeStackNavigator<KidsNavigatorParamList>();

const KidsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="setup" component={KidSetupNavigator} />
      <Stack.Screen name="index" component={KidsTabNavigator} />
    </Stack.Navigator>
  );
};

export type { KidsNavigatorParamList, KidsNavigatorProp };
export default KidsNavigator;
