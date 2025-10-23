import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useUserProfile } from "@/hooks/useUserProgfile";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

type ProfileProps = {
  userId?: Id<"users">;
  showBackButton?: boolean;
};

const Profile = ({ userId, showBackButton = false }: ProfileProps) => {
  const { top } = useSafeAreaInsets();
  const { userProfile } = useUserProfile();
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <FlatList
        data={[]}
        renderItem={({ item }) => <Text>Test</Text>}
        ListEmptyComponent={
          <Text style={styles.tabContentText}>
            You haven't posted anything yet.
          </Text>
        }
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              backgroundColor: Colors.border,
            }}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            {showBackButton ? (
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color="#000" />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <MaterialCommunityIcons name="web" size={24} color="black" />
            )}
            <View style={styles.headerIcons}>
              <Ionicons name="logo-instagram" size={24} color="black" />
              <TouchableOpacity onPress={() => signOut()}>
                <Ionicons name="log-out-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  tabContentText: {
    fontSize: 16,
    marginVertical: 16,
    color: Colors.border,
    alignSelf: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    fontSize: 16,
  },
});
