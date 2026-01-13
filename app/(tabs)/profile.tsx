import { StyleSheet, View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const stats = [
    { label: "High Score", value: "125,430" },
    { label: "Total Runs", value: "342" },
    { label: "Total Coins", value: "45,200" },
    { label: "Characters", value: "5/12" },
  ];

  const achievements = [
    { emoji: "🏆", title: "First Run", completed: true },
    { emoji: "⚡", title: "Speed Demon", completed: true },
    { emoji: "🪙", title: "Coin Master", completed: false },
    { emoji: "🎯", title: "Perfect Run", completed: false },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>🏃</Text>
          </View>
          <Text style={styles.username}>Player123</Text>
          <Text style={styles.level}>Level 15</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>STATISTICS</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
          {achievements.map((achievement, index) => (
            <View
              key={index}
              style={[
                styles.achievementCard,
                !achievement.completed && styles.achievementLocked,
              ]}
            >
              <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              {achievement.completed ? (
                <Text style={styles.achievementCheck}>✓</Text>
              ) : (
                <Text style={styles.achievementLock}>🔒</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181C32",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#4CAF50",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FEFF28",
    marginBottom: 15,
  },
  avatarEmoji: {
    fontSize: 50,
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  level: {
    fontSize: 18,
    color: "#FEFF28",
    fontWeight: "600",
  },
  statsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FEFF28",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#2d2d44",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  statLabel: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 5,
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2d2d44",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementEmoji: {
    fontSize: 30,
    marginRight: 15,
  },
  achievementTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  achievementCheck: {
    fontSize: 24,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  achievementLock: {
    fontSize: 20,
  },
});
