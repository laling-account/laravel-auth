import { useAuth } from "@/contexts/auth-context";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";

export default function Login() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (user) {
      router.replace("/(default)/(tabs)/profile");
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Validation Error",
        "Please fill in all fields before logging in.",
        [{ text: "OK" }]
      );
      
      const newErrors: typeof errors = {};
      if (!email.trim()) newErrors.email = "Email is required";
      if (!password.trim()) newErrors.password = "Password is required";
      setErrors(newErrors);
      return;
    }

    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please check your inputs and try again.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLoading(true);
    
    try {
      await login({ email, password });
      router.replace("/(default)/(tabs)/home");
    } catch (error: any) {
      if (error.response?.data?.message) {
        Alert.alert("Login Failed", error.response.data.message);
      } else {
        Alert.alert("Error", "Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    router.push("/(auth)/register");
  };

  return (
    <View className="flex-1 items-center justify-center p-4 bg-gray-50">
      <View className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </Text>
        
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-1">Email</Text>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`h-12 px-4 border rounded-lg bg-gray-50 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          {errors.email && (
            <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 font-medium mb-1">Password</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            className={`h-12 px-4 border rounded-lg bg-gray-50 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your password"
            secureTextEntry
            editable={!isLoading}
          />
          {errors.password && (
            <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          className={`h-12 rounded-lg items-center justify-center ${
            isLoading ? "bg-blue-400" : "bg-blue-500"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Login</Text>
          )}
        </TouchableOpacity>

        <View className="mt-4 flex-row justify-center">
          <Text className="text-gray-600">Don't have an account? </Text>
          <TouchableOpacity onPress={goToRegister}>
            <Text className="text-blue-500 font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}