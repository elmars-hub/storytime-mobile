// hooks/tanstack/queryHooks/useGetRecommendedStory.ts
import { useQuery } from "@tanstack/react-query";
import apiFetch from "../../../apiFetch";
import { BASE_URL } from "../../../constants";

const fetchRecommendedStory = async (kidId: string) => {
  const url = `${BASE_URL}/stories/recommendations/kid/${kidId}`;
  const res = await apiFetch(url);

  if (!res.ok) throw new Error("Failed to load recommended story");

  const json = await res.json();

  console.log("🔥 Recommended stories response:", JSON.stringify(json, null, 2));

  return json;
};

export default function useGetRecommendedStory(kidId: string) {
  return useQuery({
    queryKey: ["recommendedStory", kidId],
    queryFn: () => fetchRecommendedStory(kidId),
  });
}
