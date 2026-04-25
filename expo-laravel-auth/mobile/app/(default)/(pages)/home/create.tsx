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

  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    image?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required.";
    } else if (title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters.";
    } else if (title.trim().length > 100) {
      newErrors.title = "Title must be under 100 characters.";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required.";
    } else if (description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters.";
    } else if (description.trim().length > 2000) {
      newErrors.description = "Description must be under 2000 characters.";
    }

    if (!image) {
      newErrors.image = "Please select an image.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear a specific field error when the user starts typing
  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

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
      clearError("image");
    }
  };

  const handleCreateBlog = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());

      if (Platform.OS === "web") {
        const response = await fetch(image!);
        const blob = await response.blob();
        const file = new File([blob], "blog.jpg", { type: blob.type || "image/jpeg" });
        formData.append("image", file);
      } else {
        const filename = image!.split("/").pop() ?? "blog.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
        formData.append("image", {
          uri: image!,
          name: filename,
          type: ext === "png" ? "image/png" : "image/jpeg",
        } as any);
      }

      await createBlog(formData);

      setTitle("");
      setDescription("");
      setImage(null);
      setErrors({});
      router.replace("/(default)/(tabs)/home");
    } catch (error) {
      console.log("Error in handleCreateBlog:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
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
            onChangeText={(val) => { setTitle(val); clearError("title"); }}
            className={`h-12 px-4 border rounded-xl bg-gray-50 ${
              errors.title ? "border-red-400" : "border-gray-200"
            }`}
            placeholder="Enter title"
          />
          {errors.title && (
            <Text className="text-red-500 text-xs mt-1 ml-1">{errors.title}</Text>
          )}
          <Text className="text-gray-400 text-xs mt-1 ml-1 text-right">
          </Text>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-1 ml-1">Description</Text>
          <TextInput
            value={description}
            onChangeText={(val) => { setDescription(val); clearError("description"); }}
            className={`px-4 py-3 border rounded-xl bg-gray-50 ${
              errors.description ? "border-red-400" : "border-gray-200"
            }`}
            placeholder="Enter description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && (
            <Text className="text-red-500 text-xs mt-1 ml-1">{errors.description}</Text>
          )}
          <Text className="text-gray-400 text-xs mt-1 ml-1 text-right">
          </Text>
        </View>

        {/* Image Picker */}
        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={pickImage}
            className={`w-80 h-52 rounded-2xl bg-gray-200 justify-center items-center border-2 border-dashed overflow-hidden ${
              errors.image ? "border-red-400" : "border-blue-400"
            }`}
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
          {errors.image && (
            <Text className="text-red-500 text-xs mt-2">{errors.image}</Text>
          )}
        </View>

        {/* Submit */}
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