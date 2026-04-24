import { useAuth } from "@/contexts/auth-context";
import { Redirect, Tabs } from "expo-router";

export default function TabsLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Tabs />;
}
