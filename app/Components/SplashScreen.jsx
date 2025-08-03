import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('SignUp');
    }, 5000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <LinearGradient
      colors={['#E0F7FA', '#80CBC4', '#26A69A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        <View style={styles.workerImageContainer}>
          <Image
            source={require('../../assets/images/worker.png')}
            style={styles.workerImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.asaanText}>Skills</Text>
          <Text style={styles.kaamText}>Match</Text>
        </View>
        <View style={styles.separator} />

        <Text style={styles.tagline}>Connecting Users with Experts</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:40
  },
  workerImageContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 80,
  },
  workerImage: {
    width: 150,
    height: 150,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop : -60
  },
  asaanText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    marginRight: -5,
    marginBottom : 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  kaamText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#008000',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,

  },
  tagline: {
    fontSize: 16,
    color: '#555',
    marginTop: 0,
    fontStyle: 'italic',
  },
  
});

export default SplashScreen;
