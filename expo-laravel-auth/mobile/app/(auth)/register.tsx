import { useAuth } from "@/contexts/auth-context";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView, Image, Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function Register() {
  const { register, user } = useAuth(); 
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    image: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      router.replace("/(default)/(tabs)/home");
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your gallery to upload a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setForm((prev) => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.includes("@")) newErrors.email = "Valid email is required";
    if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.password_confirmation)
      newErrors.password_confirmation = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
  if (!validateForm()) return;
  setIsLoading(true);
  try {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("password_confirmation", form.password_confirmation);

    if (form.image) {
      if (Platform.OS === "web") {
        // ✅ Web: fetch the blob URI and append as a real File
        const response = await fetch(form.image);
        const blob = await response.blob();
        const file = new File([blob], "avatar.jpg", { type: blob.type || "image/jpeg" });
        formData.append("image", file);
      } else {
        // ✅ Native (iOS/Android): use the { uri, name, type } object
        const filename = form.image.split("/").pop() ?? "avatar.jpg";
        const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
        formData.append("image", {
          uri: form.image,
          name: filename,
          type: ext === "png" ? "image/png" : "image/jpeg",
        } as any);
      }
    }

    await register(formData);
  } catch (error: any) {
    const serverErrors = error.response?.data?.errors;
    if (serverErrors) {
      const firstError = Object.values(serverErrors).flat()[0] as string;
      Alert.alert("Registration Failed", firstError);
    } else {
      Alert.alert("Error", error.response?.data?.message ?? "Registration failed.");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      className="bg-gray-100 p-6"
    >
      <View className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md self-center">
        <Text className="text-3xl font-extrabold text-center text-gray-900 mb-2">Welcome</Text>
        <Text className="text-center text-gray-500 mb-8">Register your Account</Text>

        {/* Profile Image Picker */}
        <View className="items-center mb-8">
          <TouchableOpacity
            onPress={pickImage}
            className="w-28 h-28 rounded-full bg-gray-200 justify-center items-center border-2 border-dashed border-blue-400 overflow-hidden"
          >
            {form.image ? (
              <Image source={{ uri: form.image }} className="w-full h-full" />
            ) : (
              <View className="items-center">
                <Text className="text-blue-500 font-semibold text-xs text-center">
                  Browse{"\n"}Photo
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className="text-gray-400 text-xs mt-2">Profile Picture</Text>
        </View>

        {/* Full Name */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-1 ml-1">Full Name</Text>
          <TextInput
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            className={`h-12 px-4 border rounded-xl bg-gray-50 ${errors.name ? "border-red-500" : "border-gray-200"}`}
            placeholder="Enter Fullname"
          />
          {errors.name && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.name}</Text>}
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-1 ml-1">Email Address</Text>
          <TextInput
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            className={`h-12 px-4 border rounded-xl bg-gray-50 ${errors.email ? "border-red-500" : "border-gray-200"}`}
            placeholder="Enter Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email}</Text>}
        </View>

        {/* Password */}
        <View className="mb-4">
          <Text className="text-gray-700 font-semibold mb-1 ml-1">Password</Text>
          <TextInput
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            className={`h-12 px-4 border rounded-xl bg-gray-50 ${errors.password ? "border-red-500" : "border-gray-200"}`}
            placeholder="Enter Password"
            secureTextEntry
          />
          {errors.password && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>}
        </View>

        {/* Confirm Password */}
        <View className="mb-8">
          <Text className="text-gray-700 font-semibold mb-1 ml-1">Confirm Password</Text>
          <TextInput
            value={form.password_confirmation}
            onChangeText={(text) => setForm({ ...form, password_confirmation: text })}
            className={`h-12 px-4 border rounded-xl bg-gray-50 ${errors.password_confirmation ? "border-red-500" : "border-gray-200"}`}
            placeholder="Confirmed Password"
            secureTextEntry
          />
          {errors.password_confirmation && (
            <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password_confirmation}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          className={`h-14 rounded-2xl items-center justify-center shadow-md ${
            isLoading ? "bg-blue-300" : "bg-blue-600"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign Up</Text>
          )}
        </TouchableOpacity>

        <View className="mt-4 flex-row justify-center">
          <Text className="text-gray-600">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="text-blue-500 font-semibold">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}