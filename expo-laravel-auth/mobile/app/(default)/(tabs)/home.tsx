import { View, Text, Image, Pressable, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "@/api/axios";
import { router } from "expo-router";

type BlogProps = {
  id: number;
  user_id: number;
  image: string;
  title: string;
  description: string;
  created_at?: string;
};

export default function Home() {
  const [blogs, setBlogs] = useState<BlogProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const BASE_URL = "http://192.168.8.106:8000"; 
  const getBlog = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/api/blogs`);
      // Handle different response structures
      const blogsData = data.blogs || data.data || data;
      setBlogs(Array.isArray(blogsData) ? blogsData : []);
      console.log("Fetched blogs:", blogsData);
    } catch (error) {
      console.log("Error fetching blogs:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getBlog();
  };

  useEffect(() => {
    getBlog();
  }, []);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `${BASE_URL}/storage/${cleanPath}`;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (blogs.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-gray-500 text-center mb-4">No blogs yet</Text>
        <Pressable
          onPress={() => router.push("/(default)/(pages)/home/create")}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Create First Blog</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        {blogs.map((blog) => {
          const imageUrl = getImageUrl(blog.image);
          
          return (
            <Pressable
              onPress={() => router.push(`/(default)/blog/${blog.id}`)}
              key={blog.id}
              className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
            >
              {/* Blog Image */}
              {imageUrl ? (
                <View style={{ width: "100%", aspectRatio: 16 / 9, overflow: "hidden" }}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    resizeMode="cover"
                    onError={(e) => console.log("Image error for blog", blog.id, e.nativeEvent.error)}
                  />
                </View>
              ) : (
                <View style={{ width: "100%", aspectRatio: 16 / 9 }} className="bg-gray-200 items-center justify-center">
                  <Text className="text-gray-400">No Image Available</Text>
                </View>
              )}
              
              {/* Blog Content */}
              <View className="p-4">
                <Text className="text-xl font-bold text-gray-800 mb-2">
                  {blog.title}
                </Text>
                <Text className="text-gray-600" numberOfLines={2}>
                  {blog.description}
                </Text>
                
                {/* Optional: Add metadata */}
                <View className="flex-row justify-between items-center mt-3">
                  <View className="flex-row items-center">
                    <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-1">
                      <Text className="text-white text-xs font-bold">
                        {blog.user_id?.toString().charAt(0) || 'U'}
                      </Text>
                    </View>
                    <Text className="text-gray-400 text-xs">
                      User ID: {blog.user_id}
                    </Text>
                  </View>
                  {blog.created_at && (
                    <Text className="text-gray-400 text-xs">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}