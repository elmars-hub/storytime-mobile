import React from "react";
import { Modal, View, Text, Pressable, Image, Dimensions } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const { width: screenWidth } = Dimensions.get("window");

export default function SuccessModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <View
          style={{
            width: screenWidth,
            backgroundColor: "white",
            padding: 24,
            alignItems: "center",
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
          }}
        >
          <Image
            source={require("../../assets/icons/successful-reset-illustration.png")}
            style={{ alignSelf: "center" }}
          />
          <Text style={{ fontSize: 24, fontFamily: "quilka", textAlign: "center", marginVertical: 16 }}>
            Story Recommended Successfully!
          </Text>

          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: "transparent",
              borderColor: "rgba(0,0,0,0.2)",
              borderWidth: 1,
              width: "100%",
              paddingVertical: 16,
              borderRadius: 50,
              marginTop: 16,
            }}
          >
            <Text style={{ textAlign: "center", color: "black", fontFamily: "abeezee" }}>
              Close
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
