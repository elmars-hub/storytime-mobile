import React, { lazy, Suspense, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoadingOverlay from "../../components/LoadingOverlay";
import ErrorComponent from "../../components/ErrorComponent";
import Icon from "../../components/Icon";
import useGetKidById from "../../hooks/tanstack/queryHooks/useGetKidById";
import useSetStoryBuddy from "../../hooks/tanstack/mutationHooks/useSetStoryBuddy";
import { KidsSetupNavigatorParamList, KidsSetupProp } from "../../Navigation/KidsSetupNavigator";

const BuddySelectionComponent = lazy(() => import("../../components/BuddySelectionComponent"));

type RouteProps = RouteProp<KidsSetupNavigatorParamList, "buddySelectionPage">;

const BuddySelectionScreen = () => {
  const { params } = useRoute<RouteProps>();
  const { childId } = params;
  const navigator = useNavigation<KidsSetupProp>();
  const [selected, setSelected] = useState<string>("");

  const { isPending, data, error, refetch } = useGetKidById(childId);

  // Function to save buddy to AsyncStorage
  const saveBuddyToStorage = async (buddyId: string) => {
    try {
      await AsyncStorage.setItem(`buddy_${childId}`, buddyId);
    } catch (err) {
      console.log("Error saving buddy to AsyncStorage:", err);
    }
  };

  const { mutate, isPending: isUpdating } = useSetStoryBuddy({
    kidId: childId,
    id: selected,
    onSuccess: async () => {
      // Save to AsyncStorage when backend is successful
      await saveBuddyToStorage(selected);

      // Navigate to welcome screen
      navigator.navigate("welcomeScreen", { childId, selected });
    },
  });

  useEffect(() => {
    if (!data) return;
    setSelected(data.storyBuddyId ?? "");
  }, [data]);

  if (error) return <ErrorComponent refetch={refetch} message={error.message} />;

  return (
    <View className="flex flex-col gap-y-10 py-10 flex-1 max-w-screen-md mx-auto w-full">
      <Text className="text-center font-[quilka] text-2xl">
        Hi, {data?.name ?? "User"}
      </Text>
      <Text className="text-center font-[abeezee]">
        Choose your Storytime Buddy
      </Text>

      <Suspense fallback={<ActivityIndicator size="large" />}>
        <BuddySelectionComponent selected={selected} setSelected={setSelected} />
      </Suspense>

      <Pressable
        disabled={!selected}
        onPress={() => mutate()}
        className={`mx-5 flex flex-row justify-center items-center gap-x-4 sm:w-full py-4 rounded-full mt-4 max-w-screen-sm sm:mx-auto ${
          !selected ? "bg-purple/20" : "bg-purple"
        }`}
      >
        <Text className="text-center text-white font-[quilka] text-2xl">Apply</Text>
        <Icon name="ArrowRight" color="white" />
      </Pressable>

      <LoadingOverlay visible={isPending || isUpdating} />
    </View>
  );
};

export default BuddySelectionScreen;
