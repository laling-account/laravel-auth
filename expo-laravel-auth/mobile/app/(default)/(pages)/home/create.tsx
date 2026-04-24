import {
  View, Text, Alert, TextInput, ScrollView,
  TouchableOpacity, Image, ActivityIndicator, Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@/contexts/auth-context";

export default function Create() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { createBlog } = useAuth();

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission required", "Permission to access the media library is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateBlog = async () => {

    if (!title.trim()) { Alert.alert("Validation", "Title is required."); return; }
    if (!description.trim()) { Alert.alert("Validation", "Description is required."); return; }
    if (!image) { Alert.alert("Validation", "Please select an image."); return; }


    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());

      if (Platform.OS === "web") {
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], "blog.jpg", { type: blob.type || "image/jpeg" });
        formData.append("image", file);
      } else {
        const filename = image.split("/").pop() ?? "blog.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
        formData.append("image", {
          uri: image,
          name: filename,
          type: ext === "png" ? "image/png" : "image/jpeg",
        } as any);
      }

      await createBlog(formData);

      setTitle("");
      setDescription("");
      setImage(null);
      router.replace("/(default)/(tabs)/home");

      } catch (error) {
        console.log("Error in handleCreateBlog:", error);
      } finally {
        setLoading(false);
      }
};

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      className="bg-gray-100 p-6"
    >
      <View className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md self-center">
        <Text className="text-3xl font-extrabold text-center text-gray-900 mb-2">
          Create Blog
        </Text>
        <Text className="text-center text-gray-500 mb-8">Share your thoughts</Text>

        {/* Title */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-1 ml-1">Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            className="h-12 px-4 border border-gray-200 rounded-xl bg-gray-50"
            placeholder="Enter blog title"
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-1 ml-1">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
            placeholder="Enter description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={pickImage}
            className="w-80 h-52 rounded-2xl bg-gray-200 justify-center items-center border-2 border-dashed border-blue-400 overflow-hidden"
          >
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center gap-2">
                <Text className="text-blue-500 font-semibold text-sm text-center">
                  Tap to browse photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>


        <TouchableOpacity
          onPress={handleCreateBlog}
          disabled={loading}
          className={`h-14 rounded-2xl items-center justify-center shadow-md ${
            loading ? "bg-blue-300" : "bg-blue-600"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Create Blog</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}