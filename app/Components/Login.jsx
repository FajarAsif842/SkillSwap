import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      // Firebase Authentication request
      const response = await fetch(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBqKX8Mhie30xCcg9BbyyB9IKDmAg8phy8',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true,
          }),
        }
      );

      const result = await response.json();

      if (result.error) {
        const errorMessages = {
          'INVALID_CREDENTIAL': 'Invalid email or password.',
          'USER_DISABLED': 'This account has been disabled.',
          'TOO_MANY_ATTEMPTS': 'Too many attempts. Please try again later.',
        };
        setError(errorMessages[result.error.code] || 'Login failed. Please check your credentials.');
        return;
      }

      const userUID = result.localId;

      // Fetch user data from Firebase Realtime Database
      const userDataResponse = await fetch(
        `https://matchmatchingsystem-default-rtdb.firebaseio.com/Users/${userUID}.json`
      );
      const userData = await userDataResponse.json();

      if (!userData) {
        setError('User profile not found in the database.');
        return;
      }

      setError('');
      setModalVisible(true);
      console.log('Login: Navigating to DashboardScreen with userID:', userUID);
      setTimeout(() => {
        setModalVisible(false);
        navigation.navigate('DashboardScreen', { userID: userUID });
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <Modal animationType="slide" visible={modalVisible} transparent={true}>
        <View style={styles.centeredDiv}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Login Successful!</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('DashboardScreen', { userID: userUID });
              }}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.logo}>
        <Text style={styles.logoMini}>Asaan</Text>
        <Text style={styles.logoMain}>Kaam</Text>
      </Text>

      <View style={styles.separator} />

      <Text style={styles.heading}>Login</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email (abc@example.com)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#6B7280"
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          maxLength={8}
          placeholder="Password"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#6B7280"
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <MaterialIcons
            name={passwordVisible ? 'visibility' : 'visibility-off'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {error !== '' && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
        <Text style={styles.arrow}>➔</Text>
      </TouchableOpacity>

      <View style={styles.orContainer}>
        <Text style={styles.orText}>or</Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.registerText}>Register here</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotText}>Forgot Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 40,
    marginTop: -140,
  },
  logoMini: {
    fontSize: 14,
    color: '#444',
  },
  logoMain: {
    fontSize: 27,
    color: '#4CAF50',
  },
  heading: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '700',
    color: '#1E3A8A',
    marginTop: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    backgroundColor: '#FFA500',
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  arrow: {
    color: '#fff',
    fontSize: 20,
  },
  orContainer: {
    marginVertical: 2,
  },
  orText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: -10,
    marginBottom: 5,
  },
  registerText: {
    fontSize: 16,
    color: '#4CAF50',
    textDecorationLine: 'underline',
    marginBottom: 15,
  },
  forgotText: {
    fontSize: 15,
    color: '#FF0000',
    textDecorationLine: 'underline',
  },
  separator: {
    borderBottomColor: '#999',
    borderBottomWidth: 1,
    marginVertical: 10,
    marginBottom: 40,
    alignSelf: 'stretch',
    marginHorizontal: 10,
    marginTop: -30,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  centeredDiv: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 15,
  },
  modalButtonText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 10,
  },
});