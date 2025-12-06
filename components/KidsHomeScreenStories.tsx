import { useNavigation } from "@react-navigation/native";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import useGetStories, {
  Story,
} from "../hooks/tanstack/queryHooks/useGetStories";
import { KidsTabNavigatorProp } from "../Navigation/KidsTabNavigator";
import ErrorComponent from "./ErrorComponent";
import ImageWithFallback from "./parents/ImageWithFallback";

interface KidsHomeScreenStoriesProps {
  id: string;
  recommendedStories?: any[]; // optional
}

const KidsHomeScreenStories = ({ id, recommendedStories = [] }: KidsHomeScreenStoriesProps) => {
  const navigation = useNavigation<KidsTabNavigatorProp>();
  const { isPending, error, refetch, data } = useGetStories(id);
  const FALLBACK = require("../assets/parents/unseen-world.jpg");

  const stories: Story[] = (() => {
    const r: any = data;
    if (Array.isArray(r)) return r;
    if (Array.isArray(r?.data)) return r.data;
    if (Array.isArray(r?.data?.data)) return r.data.data;
    console.warn("useGetStories: unexpected shape ->", r);
    return [];
  })();
  
const mergedStories = [
  ...recommendedStories.map((rec) => rec.story),
  ...stories.filter(
    (s) => !recommendedStories.some((rec) => rec.story.id === s.id)
  ), 
];


  console.log("Normalized stories length:", stories.length);

  if (error)
    return (
      <ErrorComponent
        refetch={refetch}
        message={error.message ?? "Unexpected error"}
      />
    );
  return (
    <FlatList
      data={mergedStories}
      className="flex-1 gap-4"
      contentContainerClassName=""
      showsVerticalScrollIndicator={false}
      numColumns={2}
      columnWrapperStyle={{ gap: 10 }}
      renderItem={({ item }) => (
        <Pressable
          key={item.id}
          onPress={() => {
            navigation.navigate("setup" as any, {
              screen: "storyInteraction",
              params: { storyId: item.id },
            });
          }}
          className="overflow-hidden rounded-lg flex-1 mb-10"
        >
          <View className="w-[167] h-[160] rounded-tl-[20] bg-[#5E3A54]"></View>
          <View className="w-[167] h-[24] rounded-bl-[20] bg-[#5E3A54] pt-[2]">
            <View className="rounded-l-[20] flex-row w-[157] self-end  h-[16] bg-[#D5D3E5]">
              <View className="rounded-l-[20] bg-[#A39FC6] h-[16] w-[16]" />
              <View className="bg-[#A39FC6] h-[6] w-[141]">
                {/* <Bookmark color={"#C5240B"} className="bg-red-400" /> */}
              </View>
            </View>
          </View>

          <ImageWithFallback
            sourceUri={item.coverImageUrl}
            fallbackRequire={FALLBACK}
            style={{ position: "absolute", right: 0 }}
            className="h-[162px] w-[150px]"
          />
        </Pressable>
      )}
    />
  );
};

export default KidsHomeScreenStories;
