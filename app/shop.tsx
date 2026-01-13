import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  owned: boolean;
  type: "character" | "powerup";
}

export default function ShopScreen() {
  const router = useRouter();
  const [coins, setCoins] = useState(1250);
  const [items, setItems] = useState<ShopItem[]>([
    { id: "1", name: "Default Runner", emoji: "🏃", price: 0, owned: true, type: "character" },
    { id: "2", name: "Ninja", emoji: "🥷", price: 500, owned: true, type: "character" },
    { id: "3", name: "Robot", emoji: "🤖", price: 1000, owned: false, type: "character" },
    { id: "4", name: "Alien", emoji: "👽", price: 1500, owned: false, type: "character" },
    { id: "5", name: "Wizard", emoji: "🧙", price: 2000, owned: false, type: "character" },
    { id: "6", name: "Astronaut", emoji: "👨‍🚀", price: 3000, owned: false, type: "character" },
    { id: "7", name: "2x Coins", emoji: "💰", price: 200, owned: false, type: "powerup" },
    { id: "8", name: "Shield", emoji: "🛡️", price: 150, owned: false, type: "powerup" },
    { id: "9", name: "Magnet", emoji: "🧲", price: 250, owned: false, type: "powerup" },
    { id: "10", name: "Super Jump", emoji: "🦘", price: 300, owned: false, type: "powerup" },
  ]);

  const buyItem = (item: ShopItem) => {
    if (item.owned) {
      Alert.alert("Already Owned", "You already own this item!");
      return;
    }

    if (coins < item.price) {
      Alert.alert("Not Enough Coins", "You need more coins to buy this item.");
      return;
    }

    Alert.alert(
      "Confirm Purchase",
      `Buy ${item.name} for ${item.price} coins?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Buy",
          onPress: () => {
            setCoins((prev) => prev - item.price);
            setItems((prev) =>
              prev.map((i) => (i.id === item.id ? { ...i, owned: true } : i))
            );
          },
        },
      ]
    );
  };

  const characters = items.filter((item) => item.type === "character");
  const powerups = items.filter((item) => item.type === "powerup");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>SHOP</Text>
        <View style={styles.coinDisplay}>
          <Text style={styles.coinEmoji}>🪙</Text>
          <Text style={styles.coinAmount}>{coins.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>CHARACTERS</Text>
        <View style={styles.grid}>
          {characters.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemCard,
                item.owned && styles.ownedCard,
              ]}
              onPress={() => buyItem(item)}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.owned ? (
                <View style={styles.ownedBadge}>
                  <Text style={styles.ownedText}>OWNED</Text>
                </View>
              ) : (
                <View style={styles.priceContainer}>
                  <Text style={styles.priceEmoji}>🪙</Text>
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>POWER-UPS</Text>
        <View style={styles.grid}>
          {powerups.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemCard,
                styles.powerupCard,
                item.owned && styles.ownedCard,
              ]}
              onPress={() => buyItem(item)}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.owned ? (
                <View style={styles.ownedBadge}>
                  <Text style={styles.ownedText}>OWNED</Text>
                </View>
              ) : (
                <View style={styles.priceContainer}>
                  <Text style={styles.priceEmoji}>🪙</Text>
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>
              )}
            </TouchableOpacity>
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
  coinDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  coinEmoji: {
    fontSize: 18,
    marginRight: 5,
  },
  coinAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    marginTop: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  itemCard: {
    width: "48%",
    backgroundColor: "#414E75",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#414E75",
  },
  powerupCard: {
    borderColor: "#EB7D26",
  },
  ownedCard: {
    borderColor: "#4CAF50",
    backgroundColor: "#2d3d2d",
  },
  itemEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  priceEmoji: {
    fontSize: 14,
    marginRight: 5,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FEFF28",
  },
  ownedBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  ownedText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
});
