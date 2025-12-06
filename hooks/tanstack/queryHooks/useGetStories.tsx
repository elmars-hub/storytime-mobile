import { useSuspenseQuery } from "@tanstack/react-query";
import apiFetch from "../../../apiFetch";
import { BASE_URL } from "../../../constants";

type StoryRequest = {
  statusCode: number;
  success: boolean;
  data: { data: Story[] };
  message: string;
};

type Story = {
  id: string;
  title: string;
  description: string;
  language: string;
  coverImageUrl: string;
  audioUrl: string;
  textContent: string;
  isInteractive: boolean;
  ageMin: number;
  ageMax: number;
  recommended: false;
  aiGenerated: false;
  difficultyLevel: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  images: string[];
  categories: string[];
  questions: {
    id: string;
    storyId: string;
    question: string;
    options: string[];
    correctOption: number;
  };
  progress: number;
};

const useGetStories = (id?: string) => {
  return useSuspenseQuery({
    queryKey: ["getStories", id],
    queryFn: async () => {
      const url = `${BASE_URL}/stories?kidId=${id}`;
      const request = await apiFetch(url, {
        method: "GET",
      });
      const response: StoryRequest = await request.json();
      if (!response.success) {
        throw new Error(response.message ?? "Unexpected error,try again later");
      }
      // console.log("Get Stories response:", response);
      return response;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (res) => res.data.data,
  });
};

export type { Story, StoryRequest };

export default useGetStories;