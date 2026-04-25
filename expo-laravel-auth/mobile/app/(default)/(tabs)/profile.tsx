import React from "react";
import {
  View, Text, TouchableOpacity, Image,
  ActivityIndicator, ScrollView,
} from "react-native";
import { useAuth } from "@/contexts/auth-context";
import { router } from "expo-router";

const BASE_URL = "http://127.0.0.1:8000";

const getImageUrl = (image: string | null | undefined): string | null => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  const cleanImage = image.replace(/^\/+/, '');
  return `${BASE_URL}/storage/${cleanImage}`;
};

export default function Profile() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const imageUrl = getImageUrl(user.image);
  console.log("Raw user.image:", user.image);
  console.log("Resolved image URL:", imageUrl);

  return (
    <View style={{ flex: 1 }} className="bg-purple-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View className="items-center mt-10 mb-8">
          <View className="w-28 h-28 rounded-full bg-blue-100 border-4 border-white shadow-sm overflow-hidden mb-4">
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
                onError={(e) => {
                  console.log("Image load error:", e.nativeEvent.error);
                  console.log("Failed URL:", imageUrl);
                }}
                onLoad={() => console.log("Image loaded successfully:", imageUrl)}
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-blue-500 font-bold text-3xl">
                  {user.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-2xl font-bold text-gray-800">{user.name}</Text>
          <Text className="text-gray-500 mt-1">{user.email}</Text>
        </View>

        {/* Account Info Card */}
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Account Info</Text>
          <View className="mb-3">
            <Text className="text-xs text-gray-400 uppercase mb-1">Full Name</Text>
            <Text className="text-gray-800 font-medium">{user.name}</Text>
          </View>
          <View className="h-px bg-gray-100 my-2" />
          <View>
            <Text className="text-xs text-gray-400 uppercase mb-1">Email</Text>
            <Text className="text-gray-800 font-medium">{user.email}</Text>
          </View>
        </View>

        {/* Account Status Card */}
        <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Account Status</Text>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            <Text className="text-gray-600">Active and Logged In</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-blue-500 border border-red-200 h-14 rounded-xl items-center justify-center"
        >
          <Text className="text-white font-bold text-lg">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}