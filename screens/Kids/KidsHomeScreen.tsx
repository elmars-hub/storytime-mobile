import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { lazy, Suspense } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  View,
  Pressable,
  ScrollView,
} from "react-native";
import ErrorComponent from "../../components/ErrorComponent";
import LoadingOverlay from "../../components/LoadingOverlay";
import useGetKidById from "../../hooks/tanstack/queryHooks/useGetKidById";
import useGetStoryBuddyById from "../../hooks/tanstack/queryHooks/useGetStoryBuddyById";
import useGetRecommendedStory from "../../hooks/tanstack/queryHooks/useGetRecommendedStory";
import {
  KidsTabNavigatorParamList,
  KidsTabNavigatorProp,
} from "../../Navigation/KidsTabNavigator";
import { ProtectedRoutesNavigationProp } from "../../Navigation/ProtectedNavigator";
import KidAvatar from "../../components/KidAvatar";
const KidsHomeScreenStories = lazy(
  () => import("../../components/KidsHomeScreenStories")
);

type RouteProps = RouteProp<KidsTabNavigatorParamList, "home">;

const KidHomeScreen = () => {
  const { params } = useRoute<RouteProps>();
  const parentNav = useNavigation<ProtectedRoutesNavigationProp>();

  const { isPending, error, data, refetch } = useGetKidById(params.childId);
  const {
    data: buddyData,
    error: buddyError,
    refetch: refetchBuddy,
  } = useGetStoryBuddyById(data?.storyBuddyId!);
  const {
    data: recommendedData,
    isLoading: recommendedLoading,
    error: recommendedError,
  } = useGetRecommendedStory(params.childId);

  const navigation = useNavigation<any>();

  // Show loading overlay while fetching kid
  if (isPending || !data) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show error if fetch failed
  if (error) {
    return <ErrorComponent message={error.message} refetch={refetch} />;
  }

  // Buddy fetch error (optional)
  if (buddyError) {
    return (
      <ErrorComponent
        message={buddyError.message ?? "Buddy not found"}
        refetch={refetchBuddy}
      />
    );
  }

  return (
    <View style={{ padding: 20 }} className="flex-1">
      {/* Kid header */}
      <View className="flex flex-row pb-4 items-center gap-x-3">
        <KidAvatar
          uri={data.avatar?.url}
          size={50}
          onPress={() =>
            parentNav.reset({ index: 0, routes: [{ name: "selection" }] })
          }
        />
        <Text className="text-xl font-[abeezee] flex-1">
          Hello, {data.name}
        </Text>
        <Image
          source={
            buddyData?.name === "lumina"
              ? require("../../assets/avatars/lumina.png")
              : require("../../assets/avatars/zylo.png")
          }
          className="size-[50px]"
        />
      </View>

      {/* Recommended stories loading */}
      {recommendedLoading && <ActivityIndicator size="large" />}
      {recommendedError && (
        <Text style={{ color: "red", marginBottom: 10 }}>
          Could not load recommended story
        </Text>
      )}

      {/* Stories list */}
      <Suspense fallback={<ActivityIndicator size={"large"} />}>
        <KidsHomeScreenStories
          id={params.childId}
          recommendedStories={recommendedData?.data ?? []}
        />
      </Suspense>

      {/* Optional loading overlay for other states */}
      <LoadingOverlay visible={isPending} />
    </View>
  );
};


export default KidHomeScreen;
