import { useRouter } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: "https://media.sketchfab.com/models/baed87144cab479d91f851eadf678c96/thumbnails/7905fb7ef3e94103b0c92b2c45c4a87c/989a3e468c18406589f5181210940e39.jpeg" }}
      style={styles.background}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.content}>
          
          
          <View style={styles.characterContainer}>
            <Image
              source={{ uri: "https://static.wikia.nocookie.net/subwaysurf/images/4/4b/FirstAvatar.jpg/revision/latest/scale-to-width-down/250?cb=20250319180337" }}
              style={styles.characterImage}
            />
          </View>

          <TouchableOpacity
            style={styles.playButton}
            onPress={() => router.push("/game")}
          >
            <Text style={styles.playButtonText}>PLAY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/leaderboard")}
          >
            <Text style={styles.secondaryButtonText}>LEADERBOARD</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/shop")}
          >
            <Text style={styles.secondaryButtonText}>SHOP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.coinContainer}>
            <Text style={styles.coinEmoji}>🪙</Text>
            <Text style={styles.coinText}>1,250</Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 56,
    fontWeight: "900",
    color: "#FEFF28",
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 48,
    fontWeight: "900",
    color: "#EB7D26",
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5,
    marginBottom: 30,
  },
  characterContainer: {
    marginBottom: 40,
  },
  characterImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FEFF28",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  playButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 80,
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  playButtonText: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2,
  },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    padding: 20,
    alignItems: "flex-end",
  },
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coinEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  coinText: {
    color: "#FEFF28",
    fontSize: 20,
    fontWeight: "bold",
  },
});
