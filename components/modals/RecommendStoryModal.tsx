import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import LoadingOverlay from "../LoadingOverlay";
import ErrorMessageDisplay from "../ErrorMessageDisplay";
import CustomButton from "../UI/CustomButton";
import useGetUserKids from "../../hooks/tanstack/queryHooks/useGetUserKids";
import useGetRecommendStories from "../../hooks/tanstack/queryHooks/useGetRecommendedStories";
import { X } from "lucide-react-native";
import SuccessModal from "./SuccessModal";

type Props = {
  visible: boolean;
  onClose: () => void;
  storyId?: string | null;
};

export default function RecommendStoryModal({ visible, onClose, storyId }: Props) {
  const { data: kids = [], isPending, error } = useGetUserKids();
  const [selectedKidId, setSelectedKidId] = useState<string>("");
  const [successOpen, setSuccessOpen] = useState(false);

  // >>> Correct mutation hook
  const mutation = useGetRecommendStories({
    onSuccess: () => setSuccessOpen(true),
  });

  useEffect(() => {
    if (!visible) return;
    if (kids && kids.length) setSelectedKidId((prev) => prev || kids[0].id);
  }, [visible, kids]);

  if (isPending) return <LoadingOverlay visible label="Loading children..." />;
  if (error) return <ErrorMessageDisplay errorMessage={error.message} />;

  const onSelectPress = () => {
    if (!selectedKidId || !storyId) {
      Alert.alert("Select a child to continue");
      return;
    }

    mutation.mutate({
      kidId: selectedKidId,
      storyId,
      message: "Hope your kid enjoys this story!",
    });
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {mutation.isPending && <LoadingOverlay visible label="Recommending story..." />}

      <Pressable onPress={onClose} className="flex-1 bg-black/60" />
      <View className="bg-white rounded-t-3xl p-4 pb-8 absolute bottom-0 w-full">
        <View className="flex-col items-end justify-between mb-4">
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close" className="bg-white p-0 border rounded-md">
            <X size={20} />
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-[quilka] mb-4 text-center">
          Who are you recommending this story for?
        </Text>

        {kids.length === 0 ? (
          <View className="flex-col items-center py-6">
            <Text className="font-[quilka] text-primary text-2xl mb-4 text-center">No child added yet</Text>
            <CustomButton text="Close" onPress={onClose} />
          </View>
        ) : (
          <View className="flex flex-col gap-y-3 mb-4">
            {kids.map((kid: any) => {
              const isSelected = selectedKidId === kid.id;

              return (
                <Pressable
                  key={kid.id}
                  onPress={() => setSelectedKidId(kid.id)}
                  className="flex-row items-center justify-between py-4 px-4 rounded-2xl"
                  style={{ borderBottomWidth: 2, borderColor: "rgba(250, 244, 242, 1)" }}
                >
                  <View className="flex-row items-center gap-x-3">
                    <Image
                      source={require("../../assets/placeholder-pfp.png")}
                      className="w-12 h-12 rounded-full bg-gray-200"
                      resizeMode="cover"
                    />
                    <Text className="text-base capitalize font-[abeezee]">
                      {kid.name.split(" ")[0]}
                    </Text>
                  </View>

                  <View
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-blue-600" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <View className="w-3 h-3 rounded-full bg-blue-600" />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View>
          <CustomButton
            text={mutation.isPending ? "Processing..." : "Select"}
            onPress={onSelectPress}
            disabled={mutation.isPending}
          />

          <Pressable
            onPress={onClose}
            className="bg-transparent border border-black/20 w-full py-4 rounded-full mt-4"
          >
            <Text className="text-center text-black font-[abeezee]">Cancel</Text>
          </Pressable>
        </View>
      </View>

      <SuccessModal visible={successOpen} onClose={handleSuccessClose} />
    </Modal>
  );
}
