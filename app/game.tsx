import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PERSPECTIVE_SCALE = 0.4;
const TRACK_TOP = SCREEN_HEIGHT * 0.15;
const TRACK_BOTTOM = SCREEN_HEIGHT * 0.85;
const TRACK_HEIGHT = TRACK_BOTTOM - TRACK_TOP;

const LANE_POSITIONS = [
  SCREEN_WIDTH * 0.22,
  SCREEN_WIDTH * 0.5,
  SCREEN_WIDTH * 0.78,
];

interface Obstacle {
  id: number;
  lane: number;
  progress: Animated.Value;
  type: "train" | "barrier";
}

interface Coin {
  id: number;
  lane: number;
  progress: Animated.Value;
  collected: boolean;
}

interface TrackLine {
  id: number;
  progress: Animated.Value;
}

export default function GameScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [playerLane, setPlayerLane] = useState(1);
  const [isJumping, setIsJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [coinItems, setCoinItems] = useState<Coin[]>([]);
  const [trackLines, setTrackLines] = useState<TrackLine[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [gameSpeed, setGameSpeed] = useState(2000);

  const playerY = useRef(new Animated.Value(0)).current;
  const playerX = useRef(new Animated.Value(LANE_POSITIONS[1])).current;
  const playerScale = useRef(new Animated.Value(1)).current;
  const obstacleIdRef = useRef(0);
  const coinIdRef = useRef(0);
  const trackLineIdRef = useRef(0);
  const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const obstacleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const coinIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackLineIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const collisionCheckedRef = useRef<Set<number>>(new Set());
  const coinCollectedRef = useRef<Set<number>>(new Set());

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        if (gameOver) return;

        const { dx, dy } = gestureState;

        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 30 && playerLane < 2) {
            const newLane = playerLane + 1;
            setPlayerLane(newLane);
            Animated.spring(playerX, {
              toValue: LANE_POSITIONS[newLane],
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }).start();
          } else if (dx < -30 && playerLane > 0) {
            const newLane = playerLane - 1;
            setPlayerLane(newLane);
            Animated.spring(playerX, {
              toValue: LANE_POSITIONS[newLane],
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }).start();
          }
        } else if (dy < -30 && !isJumping) {
          jump();
        }
      },
    })
  ).current;

  const jump = () => {
    setIsJumping(true);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(playerY, {
          toValue: -120,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(playerY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(playerScale, {
          toValue: 1.3,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(playerScale, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setIsJumping(false));
  };

  const spawnTrackLine = () => {
    const id = trackLineIdRef.current++;
    const progress = new Animated.Value(0);

    const newLine: TrackLine = { id, progress };
    setTrackLines((prev) => [...prev, newLine]);

    Animated.timing(progress, {
      toValue: 1,
      duration: gameSpeed * 0.8,
      useNativeDriver: true,
    }).start(() => {
      setTrackLines((prev) => prev.filter((l) => l.id !== id));
    });
  };

  const spawnObstacle = () => {
    const lane = Math.floor(Math.random() * 3);
    const type = Math.random() > 0.5 ? "train" : "barrier";
    const id = obstacleIdRef.current++;
    const progress = new Animated.Value(0);

    const newObstacle: Obstacle = { id, lane, progress, type };
    setObstacles((prev) => [...prev, newObstacle]);

    Animated.timing(progress, {
      toValue: 1,
      duration: gameSpeed,
      useNativeDriver: true,
    }).start(() => {
      setObstacles((prev) => prev.filter((o) => o.id !== id));
      collisionCheckedRef.current.delete(id);
    });
  };

  const spawnCoin = () => {
    const lane = Math.floor(Math.random() * 3);
    const id = coinIdRef.current++;
    const progress = new Animated.Value(0);

    const newCoin: Coin = { id, lane, progress, collected: false };
    setCoinItems((prev) => [...prev, newCoin]);

    Animated.timing(progress, {
      toValue: 1,
      duration: gameSpeed,
      useNativeDriver: true,
    }).start(() => {
      setCoinItems((prev) => prev.filter((c) => c.id !== id));
      coinCollectedRef.current.delete(id);
    });
  };

  const getPositionFromProgress = (progress: number, lane: number) => {
    const y = TRACK_TOP + progress * TRACK_HEIGHT;
    const scale = PERSPECTIVE_SCALE + progress * (1 - PERSPECTIVE_SCALE);
    const centerX = SCREEN_WIDTH / 2;
    const laneOffset = (LANE_POSITIONS[lane] - centerX) * scale;
    const x = centerX + laneOffset;
    return { x, y, scale };
  };

  const checkCollisions = () => {
    obstacles.forEach((obstacle) => {
      if (collisionCheckedRef.current.has(obstacle.id)) return;
      
      const listenerId = obstacle.progress.addListener(({ value }) => {
        if (value > 0.75 && value < 0.95 && obstacle.lane === playerLane && !isJumping && !gameOver) {
          collisionCheckedRef.current.add(obstacle.id);
          endGame();
        }
      });
      
      return () => obstacle.progress.removeListener(listenerId);
    });

    coinItems.forEach((coin) => {
      if (coin.collected || coinCollectedRef.current.has(coin.id)) return;
      
      const listenerId = coin.progress.addListener(({ value }) => {
        if (value > 0.7 && value < 0.9 && coin.lane === playerLane && !coinCollectedRef.current.has(coin.id)) {
          coinCollectedRef.current.add(coin.id);
          coin.collected = true;
          setCoins((prev) => prev + 1);
          setMultiplier((prev) => Math.min(prev + 0.1, 9));
        }
      });
      
      return () => coin.progress.removeListener(listenerId);
    });
  };

  const endGame = () => {
    setGameOver(true);
    if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
    if (obstacleIntervalRef.current) clearInterval(obstacleIntervalRef.current);
    if (coinIntervalRef.current) clearInterval(coinIntervalRef.current);
    if (trackLineIntervalRef.current) clearInterval(trackLineIntervalRef.current);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  };

  const restartGame = () => {
    setScore(0);
    setCoins(0);
    setPlayerLane(1);
    setGameOver(false);
    setObstacles([]);
    setCoinItems([]);
    setTrackLines([]);
    setMultiplier(1);
    setGameSpeed(2000);
    obstacleIdRef.current = 0;
    coinIdRef.current = 0;
    trackLineIdRef.current = 0;
    collisionCheckedRef.current.clear();
    coinCollectedRef.current.clear();
    playerX.setValue(LANE_POSITIONS[1]);
  };

  useEffect(() => {
    if (gameOver) return;

    scoreIntervalRef.current = setInterval(() => {
      setScore((prev) => prev + Math.floor(10 * multiplier));
    }, 100);

    obstacleIntervalRef.current = setInterval(() => {
      spawnObstacle();
    }, 1800);

    coinIntervalRef.current = setInterval(() => {
      spawnCoin();
    }, 600);

    trackLineIntervalRef.current = setInterval(() => {
      spawnTrackLine();
    }, 200);

    gameLoopRef.current = setInterval(() => {
      checkCollisions();
    }, 50);

    return () => {
      if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current);
      if (obstacleIntervalRef.current) clearInterval(obstacleIntervalRef.current);
      if (coinIntervalRef.current) clearInterval(coinIntervalRef.current);
      if (trackLineIntervalRef.current) clearInterval(trackLineIntervalRef.current);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameOver, playerLane, isJumping, multiplier]);

  useEffect(() => {
    if (score > 0 && score % 1000 === 0) {
      setGameSpeed((prev) => Math.max(prev - 50, 1000));
    }
  }, [score]);

  const renderTrackLine = (line: TrackLine) => {
    const translateY = line.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [TRACK_TOP, TRACK_BOTTOM],
    });
    const scale = line.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1.5],
    });
    const opacity = line.progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 0.6, 0],
    });

    return (
      <Animated.View
        key={line.id}
        style={[
          styles.trackLine,
          {
            transform: [{ translateY }, { scaleX: scale }],
            opacity,
          },
        ]}
      />
    );
  };

  const renderObstacle = (obstacle: Obstacle) => {
    const translateY = obstacle.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [TRACK_TOP - 50, TRACK_BOTTOM + 50],
    });
    const scale = obstacle.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1.2],
    });
    const translateX = obstacle.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        SCREEN_WIDTH / 2 + (LANE_POSITIONS[obstacle.lane] - SCREEN_WIDTH / 2) * PERSPECTIVE_SCALE,
        LANE_POSITIONS[obstacle.lane],
      ],
    });
    const zIndex = obstacle.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 50],
    });

    return (
      <Animated.View
        key={obstacle.id}
        style={[
          styles.obstacle3D,
          {
            transform: [{ translateX }, { translateY }, { scale }],
            zIndex,
          },
        ]}
      >
        <View style={[styles.obstacleBody, obstacle.type === "train" ? styles.trainBody : styles.barrierBody]}>
          {obstacle.type === "train" ? (
            <>
              <View style={styles.trainTop} />
              <View style={styles.trainWindows}>
                <View style={styles.trainWindow} />
                <View style={styles.trainWindow} />
              </View>
              <View style={styles.trainBottom}>
                <View style={styles.trainLight} />
                <View style={styles.trainLight} />
              </View>
            </>
          ) : (
            <>
              <View style={styles.barrierStripe} />
              <View style={[styles.barrierStripe, styles.barrierStripeYellow]} />
              <View style={styles.barrierStripe} />
            </>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderCoin = (coin: Coin) => {
    if (coin.collected || coinCollectedRef.current.has(coin.id)) return null;

    const translateY = coin.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [TRACK_TOP - 20, TRACK_BOTTOM + 20],
    });
    const scale = coin.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });
    const translateX = coin.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        SCREEN_WIDTH / 2 + (LANE_POSITIONS[coin.lane] - SCREEN_WIDTH / 2) * PERSPECTIVE_SCALE,
        LANE_POSITIONS[coin.lane],
      ],
    });

    return (
      <Animated.View
        key={coin.id}
        style={[
          styles.coin3D,
          {
            transform: [{ translateX }, { translateY }, { scale }],
          },
        ]}
      >
        <View style={styles.coinInner}>
          <Text style={styles.coinSymbol}>$</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <LinearGradient
        colors={["#181C32", "#414E75", "#181C32", "#181C32"]}
        style={styles.sky}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={styles.cityBackground}>
        <View style={[styles.building, { height: 120, left: "5%", backgroundColor: "#414E75" }]} />
        <View style={[styles.building, { height: 180, left: "15%", backgroundColor: "#3a3a5a" }]} />
        <View style={[styles.building, { height: 150, left: "28%", backgroundColor: "#181C32" }]} />
        <View style={[styles.building, { height: 200, left: "42%", backgroundColor: "#414E75" }]} />
        <View style={[styles.building, { height: 140, left: "58%", backgroundColor: "#414E75" }]} />
        <View style={[styles.building, { height: 170, left: "72%", backgroundColor: "#3a3a5a" }]} />
        <View style={[styles.building, { height: 130, left: "85%", backgroundColor: "#181C32" }]} />
      </View>

      <View style={styles.bridge}>
        <View style={styles.bridgeArch} />
        <View style={[styles.bridgeArch, { left: "60%" }]} />
      </View>

      <View style={styles.track3D}>
        <LinearGradient
          colors={["#4a5568", "#2d3748", "#1a202c"]}
          style={styles.trackGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <View style={styles.railLeft} />
        <View style={styles.railRight} />
        <View style={styles.railCenter} />
        {trackLines.map(renderTrackLine)}
      </View>

      {obstacles.map(renderObstacle)}
      {coinItems.map(renderCoin)}

      <Animated.View
        style={[
          styles.player3D,
          {
            transform: [
              { translateX: Animated.subtract(playerX, new Animated.Value(40)) },
              { translateY: playerY },
              { scale: playerScale },
            ],
          },
        ]}
      >
        <View style={styles.playerShadow} />
        <View style={styles.playerBody}>
          <View style={styles.playerHead}>
            <View style={styles.playerHair} />
            <View style={styles.playerFace} />
          </View>
          <View style={styles.playerTorso}>
            <View style={styles.playerBackpack} />
          </View>
          <View style={styles.playerLegs}>
            <View style={styles.playerLeg} />
            <View style={[styles.playerLeg, styles.playerLegRight]} />
          </View>
        </View>
      </Animated.View>

      <SafeAreaView style={styles.hud}>
        <View style={styles.hudLeft}>
          <TouchableOpacity style={styles.pauseButton}>
            <Text style={styles.pauseIcon}>⏸</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.hudRight}>
          <View style={styles.multiplierContainer}>
            <Text style={styles.multiplierText}>x{multiplier.toFixed(1)}</Text>
            <Text style={styles.starIcon}>⭐</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </View>
          <View style={styles.coinBox}>
            <Text style={styles.coinCount}>{coins}</Text>
            <View style={styles.coinIconSmall}>
              <Text style={styles.coinIconText}>$</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <LinearGradient
            colors={["rgba(0,0,0,0.9)", "rgba(20,10,40,0.95)"]}
            style={styles.gameOverGradient}
          >
            <View style={styles.gameOverCard}>
              <Text style={styles.gameOverTitle}>GAME OVER</Text>
              <View style={styles.gameOverStats}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>SCORE</Text>
                  <Text style={styles.statValue}>{score.toLocaleString()}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>COINS</Text>
                  <View style={styles.coinStatContainer}>
                    <Text style={styles.statValue}>{coins}</Text>
                    <View style={styles.coinIconSmall}>
                      <Text style={styles.coinIconText}>$</Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.playAgainButton} onPress={restartGame}>
                <LinearGradient
                  colors={["#4CAF50", "#2E7D32"]}
                  style={styles.playAgainGradient}
                >
                  <Text style={styles.playAgainText}>PLAY AGAIN</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.back()}
              >
                <Text style={styles.homeButtonText}>HOME</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      <View style={styles.controls}>
        <Text style={styles.controlsText}>← SWIPE → | ↑ JUMP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181C32",
  },
  sky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
  },
  cityBackground: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.05,
    left: 0,
    right: 0,
    height: 200,
  },
  building: {
    position: "absolute",
    bottom: 0,
    width: 45,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    opacity: 0.7,
  },
  bridge: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.12,
    left: 0,
    right: 0,
    height: 80,
  },
  bridgeArch: {
    position: "absolute",
    left: "10%",
    width: 120,
    height: 60,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderWidth: 8,
    borderBottomWidth: 0,
    borderColor: "#414E75",
    opacity: 0.6,
  },
  track3D: {
    position: "absolute",
    top: TRACK_TOP,
    left: SCREEN_WIDTH * 0.1,
    right: SCREEN_WIDTH * 0.1,
    bottom: SCREEN_HEIGHT * 0.1,
    overflow: "hidden",
  },
  trackGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  railLeft: {
    position: "absolute",
    left: "20%",
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#718096",
  },
  railRight: {
    position: "absolute",
    right: "20%",
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#718096",
  },
  railCenter: {
    position: "absolute",
    left: "50%",
    marginLeft: -2,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#4A5568",
  },
  trackLine: {
    position: "absolute",
    left: "10%",
    right: "10%",
    height: 3,
    backgroundColor: "#8B7355",
    borderRadius: 2,
  },
  obstacle3D: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  obstacleBody: {
    width: 70,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
  },
  trainBody: {
    backgroundColor: "#1E40AF",
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  barrierBody: {
    backgroundColor: "#DC2626",
    borderWidth: 2,
    borderColor: "#FCA5A5",
    justifyContent: "center",
  },
  trainTop: {
    height: 15,
    backgroundColor: "#1E3A8A",
    borderBottomWidth: 2,
    borderBottomColor: "#60A5FA",
  },
  trainWindows: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  trainWindow: {
    width: 20,
    height: 25,
    backgroundColor: "#FEF3C7",
    borderRadius: 3,
  },
  trainBottom: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
  },
  trainLight: {
    width: 12,
    height: 12,
    backgroundColor: "#FCD34D",
    borderRadius: 6,
  },
  barrierStripe: {
    height: 25,
    backgroundColor: "#DC2626",
  },
  barrierStripeYellow: {
    backgroundColor: "#FBBF24",
  },
  coin3D: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  },
  coinInner: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#FFD700",
    borderWidth: 3,
    borderColor: "#EB7D26",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FEFF28",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  coinSymbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  player3D: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.12,
    width: 80,
    height: 120,
    alignItems: "center",
    zIndex: 60,
  },
  playerShadow: {
    position: "absolute",
    bottom: -5,
    width: 50,
    height: 15,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 25,
  },
  playerBody: {
    alignItems: "center",
  },
  playerHead: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#FFDAB9",
    overflow: "hidden",
  },
  playerHair: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: "#8B4513",
    borderTopLeftRadius: 17.5,
    borderTopRightRadius: 17.5,
  },
  playerFace: {
    position: "absolute",
    top: 15,
    left: 8,
    width: 20,
    height: 10,
  },
  playerTorso: {
    width: 40,
    height: 45,
    backgroundColor: "#4ECDC4",
    borderRadius: 5,
    marginTop: -5,
    alignItems: "center",
    justifyContent: "center",
  },
  playerBackpack: {
    position: "absolute",
    right: -8,
    top: 5,
    width: 20,
    height: 30,
    backgroundColor: "#FF6B6B",
    borderRadius: 5,
  },
  playerLegs: {
    flexDirection: "row",
    marginTop: -2,
  },
  playerLeg: {
    width: 14,
    height: 35,
    backgroundColor: "#2C3E50",
    borderRadius: 4,
    marginHorizontal: 2,
  },
  playerLegRight: {
    transform: [{ rotate: "15deg" }],
  },
  hud: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 10,
    zIndex: 100,
  },
  hudLeft: {
    alignItems: "flex-start",
  },
  hudRight: {
    alignItems: "flex-end",
  },
  pauseButton: {
    width: 45,
    height: 45,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4ECDC4",
  },
  pauseIcon: {
    fontSize: 20,
    color: "#fff",
  },
  multiplierContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  multiplierText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FEFF28",
    marginRight: 5,
  },
  starIcon: {
    fontSize: 20,
  },
  scoreBox: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginBottom: 5,
  },
  scoreValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  coinBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  coinCount: {
    color: "#FEFF28",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 5,
  },
  coinIconSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FEFF28",
    justifyContent: "center",
    alignItems: "center",
  },
  coinIconText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8B4513",
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  gameOverGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gameOverCard: {
    backgroundColor: "#181C32",
    borderRadius: 25,
    padding: 35,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FEFF28",
    width: SCREEN_WIDTH * 0.85,
  },
  gameOverTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "#DE2126",
    marginBottom: 25,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  gameOverStats: {
    width: "100%",
    marginBottom: 25,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  statLabel: {
    fontSize: 18,
    color: "#888",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 24,
    color: "#FEFF28",
    fontWeight: "bold",
  },
  coinStatContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playAgainButton: {
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 15,
  },
  playAgainGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  playAgainText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  homeButton: {
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 25,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  controls: {
    position: "absolute",
    bottom: 25,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  controlsText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
