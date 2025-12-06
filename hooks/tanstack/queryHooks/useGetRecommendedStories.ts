import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../../constants";
import apiFetch from "../../../apiFetch";
import { Alert } from "react-native";

const useGetRecommendStory = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      kidId,
      storyId,
      message,
    }: {
      kidId: string;
      storyId: string;
      message?: string;
    }) => {
      const url = `${BASE_URL}/stories/recommend`;

      const request = await apiFetch(url, {
        method: "POST",
        body: JSON.stringify({
          kidId,
          storyId,
          message,
        }),
      });

      const response = await request.json();

      if (!response?.success) {
        Alert.alert(response?.message ?? "Unexpected error, try again");
        return;
      }

      return response;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kidById", variables.kidId],
      });

      queryClient.invalidateQueries({
        queryKey: ["storyById", variables.storyId],
      });

      queryClient.invalidateQueries({
        queryKey: ["stories"],
      });

      onSuccess?.();
    },
  });
};

export default useGetRecommendStory;
