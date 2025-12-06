import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import useGetUserKids from "../hooks/tanstack/queryHooks/useGetUserKids";
import { ProtectedRoutesNavigationProp } from "../Navigation/ProtectedNavigator";
import ChildrenEmptyState from "./emptyState/ChildrenEmptyState";
import ErrorComponent from "./ErrorComponent";
import KidAvatar from "./KidAvatar";
import LoadingOverlay from "./LoadingOverlay";

const UserKids = () => {
  const { data, isPending, error, refetch } = useGetUserKids();
  const navigation = useNavigation<ProtectedRoutesNavigationProp>();

  if (error)
    return <ErrorComponent refetch={refetch} message={error.message} />;
  if (isPending) return <ActivityIndicator size={"large"} />;
  return (
    <View className="flex flex-row justify-around flex-wrap gap-y-6 gap-x-1">
      {data?.length ? (
        data?.map((kid) => (
          <Pressable
            onPress={async () => {
              // await AsyncStorage.getItem("currentKid", kid.id);
              navigation.navigate("kid", {
                screen: "setup",
                params: {
                  screen: "buddySelectionPage",
                  params: { childId: kid.id },
                },
              });
            }}
            key={kid.id}
            className="flex w-[100px] items-center flex-col gap-y-3"
          >
            <KidAvatar
              uri={kid.avatar?.url}
              size={87}
              onPress={async () => {
                await AsyncStorage.setItem("currentKid", kid.id);
                navigation.navigate("kid", {
                  screen: "setup",
                  params: {
                    screen: "buddySelectionPage",
                    params: { childId: kid.id },
                  },
                });
              }}
            />
            <View className="flex flex-col gap-y-1.5">
              <Text className="text-2xl font-[abeezee] text-center">
                {kid.name.split(" ").at(0)}
              </Text>
              <Text className="text-base font-[abeezee] text-center">
                {kid.ageRange} years
              </Text>
            </View>
          </Pressable>
        ))
      ) : (
        <ChildrenEmptyState navigate={() => navigation.navigate("addChild")} />
      )}
    </View>
  );
};

export default UserKids;
