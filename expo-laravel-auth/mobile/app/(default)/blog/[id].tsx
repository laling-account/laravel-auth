import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import axios from "@/api/axios";

const BASE_URL = "http://192.168.0.77:8000/storage/blogs";

interface Blog {
  id: number;
  title: string;
  description: string;
  image: string;
  user_id: number;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function BlogDetail() {
  const { id } = useLocalSearchParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `${BASE_URL}/storage/${cleanPath}`;
  };

  useEffect(() => {
    fetchBlogDetail();
  }, [id]);

  const fetchBlogDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`/blog/${id}`);
      setBlog(response.data.blog || response.data);
    } catch (error: any) {
      console.error("Error fetching blog detail:", error);
      setError("Failed to load blog post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error || !blog) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-center mb-4">{error || "Blog not found"}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUrl = getImageUrl(blog.image);

  return (
    <ScrollView className="flex-1 bg-white">
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-64"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-64 bg-gray-200 items-center justify-center">
          <Text className="text-gray-400">No Image</Text>
        </View>
      )}

      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-800 mb-3">
          {blog.title}
        </Text>

        <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-2">
              <Text className="text-white font-bold">
                {blog.user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text className="text-gray-800 font-semibold">
                {blog.user?.name || "Anonymous"}
              </Text>
              <Text className="text-gray-400 text-xs">
                {new Date(blog.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-gray-700 leading-6 text-base">
          {blog.description}
        </Text>
      </View>
    </ScrollView>
  );
}