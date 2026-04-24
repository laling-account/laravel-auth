import axios from "@/api/axios";
import { setToken } from "@/services/auth-storage";
import { Alert } from "react-native";
import { create } from "zustand";
import { router } from "expo-router";

interface User {
  name: string;
  email: string;
  image: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  image?: string;
}

interface BlogData {
  title: string;  // Changed from 'name' to 'title'
  description: string;
  image: string;  // This should be the image URI
}

interface AuthState {
  user: User | null;
  getUser: () => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  createBlog: (data: BlogData) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,

  getUser: async () => {
    try {
      const { data } = await axios.get("/user");
      set({ user: data });
    } catch (error) {
      console.log(error);
    }
  },

  login: async (data) => {
    try {
      const response = await axios.post("/login", data);
      await setToken(response.data.token);
      await get().getUser();
    } catch (error) {
      throw error;
    }
  },

  register: async (data: any) => {
  try {
    const res = await axios.post("/register", data);

    Alert.alert("Success", "Account created! Please log in.", [
      { text: "OK", onPress: () => router.replace("/(auth)/login") },
    ]);

    return res.data;
  } catch (error: any) {
    console.log("Register failed:", error.response?.status, JSON.stringify(error.response?.data));
    throw error;
  }
},

  createBlog: async (data: any) => {
  try {
    const response = await axios.post("/create/blog", data);
    console.log("Blog created successfully:", response.data);
    Alert.alert("Success", "Blog post created successfully!");
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.errors?.image?.[0] ??
      error.response?.data?.errors?.title?.[0] ??
      error.response?.data?.message ??
      "Could not save blog post";
    Alert.alert("Error", errorMessage);
    throw error;
  }
},

  logout: async () => {
    try {
      await axios.post("/logout");
      await setToken(null);
      set({ user: null });
    } catch (error) {
      console.log(error);
    }
  },
}));