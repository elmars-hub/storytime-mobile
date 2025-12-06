import { useNavigation } from "@react-navigation/native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { ProtectedRoutesNavigationProp } from "../Navigation/ProtectedNavigator";
import ErrorComponent from "../components/ErrorComponent";
import Icon from "../components/Icon";
import LoadingOverlay from "../components/LoadingOverlay";
import useAuth from "../contexts/AuthContext";
import useGetUserKids from "../hooks/tanstack/queryHooks/useGetUserKids";
import ChildrenEmptyState from "../components/emptyState/ChildrenEmptyState";
import AsyncStorage from "@react-native-async-storage/async-storage";
import KidAvatar from "../components/KidAvatar";
import Avatar from "../components/Avatar";
import defaultStyles from "../styles";

const KidSelectionScreen = () => {
  const { user } = useAuth();
  const { data, isPending, error, refetch } = useGetUserKids();
  const navigation = useNavigation<ProtectedRoutesNavigationProp>();
  if (isPending) return <LoadingOverlay visible={isPending} />;

  if (error)
    return <ErrorComponent message={error.message} refetch={refetch} />;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      contentContainerClassName="gap-14 p-8 min-h-full max-w-screen-md mx-auto w-full"
    >
      <View
        aria-labelledby="User information"
        className="flex flex-row gap-x-2 items-center "
      >
        <Avatar size={50} />
        <View className="flex flex-col gap-y-1 ">
          <Text
            style={[defaultStyles.defaultText, { fontSize: 15 }]}
            className=" text-text"
          >
            Welcome back 👋🏾
          </Text>
          <Text className="text-base font-[abeezee] capitalize">
            {user?.title} {user?.name}
          </Text>
        </View>
      </View>

      {data.length ? (
        <View className="flex flex-col gap-y-6 flex-1">
          <Text className="font-[quilka] text-[18px]">
            Whose Storytime is it?
          </Text>
          <View className="flex flex-row justify-around flex-wrap gap-y-6 gap-x-1">
            {data.map((kid) => (
              <Pressable
                onPress={async () => {
                  await AsyncStorage.setItem("currentKid", kid.id);

                  const storedBuddy = await AsyncStorage.getItem(
                    `buddy_${kid.id}`
                  );

                  if (storedBuddy) {
                    // Buddy already selected → skip buddy selection
                    navigation.navigate("kid", {
                      screen: "index",
                      params: {
                        childId: kid.id,
                        selected: storedBuddy,
                      },
                    });
                  } else {
                    // No buddy yet → go to buddy selection page
                    navigation.navigate("kid", {
                      screen: "setup",
                      params: {
                        screen: "buddySelectionPage",
                        params: { childId: kid.id },
                      },
                    });
                  }
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
                      screen: "index",
                      params: {
                        childId: kid.id,
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
            ))}
          </View>
        </View>
      ) : (
        <ChildrenEmptyState navigate={() => navigation.navigate("addChild")} />
      )}

      <Pressable
        onPress={() => navigation.navigate("parents")}
        className="px-6 py-3 rounded-2xl bg-[#EEE8FF]  flex flex-row items-center gap-3"
      >
        <View className="flex flex-col flex-1 gap-y-2">
          <Text className="font-[abeezee] text-2xl">Access Parent Account</Text>
          <Text className="text-base font-[abeezee]">
            Create and manage your child's storytelling world.
          </Text>
        </View>
        <Icon color="black" name="ChevronRight" />
      </Pressable>
    </ScrollView>
  );
};

export default KidSelectionScreen;
