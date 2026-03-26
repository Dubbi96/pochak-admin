import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import GreenButton from '../../components/common/GreenButton';

const BG = '#1A1A1A';
const SURFACE = '#262626';
const GREEN = '#00CC33';
const WHITE = '#FFFFFF';
const GRAY = '#A6A6A6';
const GRAY_LIGHT = '#A6A6A6';

const ForeignerEmailVerifyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [emailDomain, setEmailDomain] = useState('gmail.com');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />
        <View style={styles.container}>
          <View style={styles.centerSection}>
            <Text style={styles.sentTitle}>Verification email sent.</Text>
            <Text style={styles.sentSubtitle}>Please check your inbox.</Text>
          </View>

          <View style={styles.bottomSection}>
            <GreenButton title="Back to Home" onPress={() => navigation.navigate('Login' as any)} />
            <TouchableOpacity
              style={styles.resendLink}
              onPress={() => setSent(false)}
            >
              <Text style={styles.resendText}>Resend Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Verify email.</Text>

          {/* Email Input */}
          <View style={styles.emailRow}>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={GRAY}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <Text style={styles.atSign}>@</Text>
            <TouchableOpacity style={styles.domainDropdown}>
              <Text style={styles.domainText}>{emailDomain}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={GRAY} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <GreenButton title="Next" onPress={handleSend} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    paddingTop: 48,
  },
  title: {
    color: WHITE,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 32,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
    padding: 0,
  },
  atSign: {
    color: GRAY_LIGHT,
    fontSize: 16,
  },
  domainDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4D4D4D',
    paddingHorizontal: 14,
    height: 50,
  },
  domainText: {
    color: WHITE,
    fontSize: 14,
    marginRight: 8,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentTitle: {
    color: WHITE,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  sentSubtitle: {
    color: GRAY_LIGHT,
    fontSize: 16,
  },
  bottomSection: {
    paddingBottom: 32,
    alignItems: 'center',
  },
  resendLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  resendText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default ForeignerEmailVerifyScreen;
