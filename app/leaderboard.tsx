import { useRouter } from "expo-router";
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  score: number;
  avatar: string;
}

const leaderboardData: LeaderboardEntry[] = [
  { id: "1", rank: 1, name: "SpeedMaster", score: 523400, avatar: "🥇" },
  { id: "2", rank: 2, name: "TrainDodger", score: 445200, avatar: "🥈" },
  { id: "3", rank: 3, name: "CoinKing", score: 398700, avatar: "🥉" },
  { id: "4", rank: 4, name: "Runner99", score: 287300, avatar: "🏃" },
  { id: "5", rank: 5, name: "SwiftFeet", score: 256100, avatar: "⚡" },
  { id: "6", rank: 6, name: "NightRider", score: 198500, avatar: "🌙" },
  { id: "7", rank: 7, name: "GoldHunter", score: 167200, avatar: "💰" },
  { id: "8", rank: 8, name: "Player123", score: 125430, avatar: "⭐" },
  { id: "9", rank: 9, name: "FastTrack", score: 98700, avatar: "🔥" },
  { id: "10", rank: 10, name: "NewRunner", score: 54200, avatar: "🆕" },
];

export default function LeaderboardScreen() {
  const router = useRouter();

  const renderItem = ({ item }: any) => (
    <View
      style={[
        styles.entryCard,
        item.rank <= 3 && styles.topThreeCard,
        item.name === "Player123" && styles.currentUserCard,
      ]}
    >
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>#{item.rank}</Text>
      </View>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{item.avatar}</Text>
      </View>
      <View style={styles.nameContainer}>
        <Text style={styles.name}>{item.name}</Text>
        {item.name === "Player123" && (
          <Text style={styles.youBadge}>YOU</Text>
        )}
      </View>
      <Text style={styles.score}>{item.score.toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>LEADERBOARD</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.topThree}>
        <View style={styles.podium}>
          <View style={[styles.podiumItem, styles.second]}>
            <Text style={styles.podiumAvatar}>🥈</Text>
            <Text style={styles.podiumName}>{leaderboardData[1].name}</Text>
            <Text style={styles.podiumScore}>
              {leaderboardData[1].score.toLocaleString()}
            </Text>
            <View style={[styles.podiumBar, styles.secondBar]} />
          </View>
          <View style={[styles.podiumItem, styles.first]}>
            <Text style={styles.crown}>👑</Text>
            <Text style={styles.podiumAvatar}>🥇</Text>
            <Text style={styles.podiumName}>{leaderboardData[0].name}</Text>
            <Text style={styles.podiumScore}>
              {leaderboardData[0].score.toLocaleString()}
            </Text>
            <View style={[styles.podiumBar, styles.firstBar]} />
          </View>
          <View style={[styles.podiumItem, styles.third]}>
            <Text style={styles.podiumAvatar}>🥉</Text>
            <Text style={styles.podiumName}>{leaderboardData[2].name}</Text>
            <Text style={styles.podiumScore}>
              {leaderboardData[2].score.toLocaleString()}
            </Text>
            <View style={[styles.podiumBar, styles.thirdBar]} />
          </View>
        </View>
      </View>

      <FlatList
        data={leaderboardData.slice(3)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181C32",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
  },
  placeholder: {
    width: 38,
  },
  topThree: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 200,
  },
  podiumItem: {
    alignItems: "center",
    width: 100,
  },
  first: {
    marginBottom: 0,
  },
  second: {
    marginBottom: 0,
  },
  third: {
    marginBottom: 0,
  },
  crown: {
    fontSize: 24,
    marginBottom: 5,
  },
  podiumAvatar: {
    fontSize: 36,
    marginBottom: 5,
  },
  podiumName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  podiumScore: {
    fontSize: 11,
    color: "#FFD700",
    marginBottom: 10,
  },
  podiumBar: {
    width: 80,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  firstBar: {
    height: 80,
    backgroundColor: "#FEFF28",
  },
  secondBar: {
    height: 60,
    backgroundColor: "#C0C0C0",
  },
  thirdBar: {
    height: 45,
    backgroundColor: "#EB7D26",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  entryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#414E75",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  topThreeCard: {
    borderWidth: 1,
    borderColor: "#FEFF28",
  },
  currentUserCard: {
    backgroundColor: "#3d5c3d",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  rankContainer: {
    width: 40,
  },
  rankText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888",
  },
  avatarContainer: {
    width: 40,
    alignItems: "center",
  },
  avatar: {
    fontSize: 24,
  },
  nameContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  youBadge: {
    marginLeft: 10,
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  score: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FEFF28",
  },
});
