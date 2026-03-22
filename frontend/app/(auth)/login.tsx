import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/auth-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const router = useRouter();
  const { login, signup } = useAuth();

  const switchTab = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: tab === 'login' ? 0 : -SCREEN_WIDTH,
        useNativeDriver: true,
        tension: 68,
        friction: 12,
      }),
      Animated.spring(tabIndicatorAnim, {
        toValue: tab === 'login' ? 0 : 1,
        useNativeDriver: false,
        tension: 68,
        friction: 12,
      }),
    ]).start();
  };

  const handleBack = () => router.replace('/');

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoginLoading(true);
    const success = await login(email, password);
    setLoginLoading(false);
    if (success) router.replace('/(tabs)');
  };

  const handleSignUp = async () => {
    if (!firstName || !lastName || !signupEmail || !signupPassword || !confirmPassword) return;
    if (signupPassword !== confirmPassword) return;
    setSignupLoading(true);
    const success = await signup({
      first_name: firstName,
      last_name: lastName,
      email: signupEmail,
      password: signupPassword,
    });
    setSignupLoading(false);
    if (success) router.replace('/(tabs)');
  };

  const passwordsMatch = confirmPassword.length > 0 && signupPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && signupPassword !== confirmPassword;
  const isSignupValid = firstName && lastName && signupEmail && signupPassword && confirmPassword && !passwordsMismatch;

  const inputBox = (mismatch = false, match = false) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: mismatch ? '#fff0f0' : '#fdf6f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: mismatch ? '#ff4d4d' : match ? '#22c55e' : '#f0d5bc',
    marginBottom: 8,
  });

  // Tab indicator position
  const indicatorLeft = tabIndicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#3d1f0a' }}>


      <LinearGradient
        colors={['#7a3010', '#c45c1a', '#f28e2b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingBottom: 50 }}
      >
        <SafeAreaView style={{ paddingTop: 10, paddingHorizontal: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={handleBack}
              style={{
                width: 34, height: 34, borderRadius: 17,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', marginBottom: 2 }}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 14, padding: 8, marginBottom: 8,
            }}>
              <Ionicons name="book-outline" size={24} color="#fff" />
            </View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 }}>
              Sahifa
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 }}>
              {activeTab === 'login' ? 'Hisobingizga kiring!' : 'Yangi hisob yarating!'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={{
        flex: 1, backgroundColor: '#fff',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        marginTop: -26, overflow: 'hidden',
      }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Tab switcher */}
          <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4 }}>
            <View style={{
              flexDirection: 'row', backgroundColor: '#fdf0e6',
              borderRadius: 10, padding: 3, position: 'relative',
            }}>
              {/* Animated indicator */}
              <Animated.View style={{
                position: 'absolute', top: 3, bottom: 3,
                left: indicatorLeft, width: '50%',
                backgroundColor: '#f28e2b', borderRadius: 7,
              }} />

              <TouchableOpacity
                onPress={() => switchTab('login')}
                style={{ flex: 1, paddingVertical: 8, alignItems: 'center', zIndex: 1 }}
              >
                <Text style={{
                  fontSize: 12, fontWeight: '700',
                  color: activeTab === 'login' ? '#fff' : '#c45c1a',
                }}>
                  Kirish
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => switchTab('signup')}
                style={{ flex: 1, paddingVertical: 8, alignItems: 'center', zIndex: 1 }}
              >
                <Text style={{
                  fontSize: 12, fontWeight: '700',
                  color: activeTab === 'signup' ? '#fff' : '#c45c1a',
                }}>
                  Ro'yxatdan o'tish
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sliding content */}
          <Animated.View style={{
            flexDirection: 'row',
            width: SCREEN_WIDTH * 2,
            flex: 1,
            transform: [{ translateX: slideAnim }],
          }}>
            {/* ===== LOGIN FORM ===== */}
            <ScrollView
              style={{ width: SCREEN_WIDTH }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 28, paddingHorizontal: 24, paddingTop: 14 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#3d1f0a', marginBottom: 3, marginLeft: 2 }}>
                Elektron pochta
              </Text>
              <View style={inputBox()}>
                <Ionicons name="mail-outline" size={14} color="#c45c1a" style={{ marginRight: 6 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 12, fontWeight: '500', color: '#3d1f0a' }}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#d4a882"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <Text style={{ fontSize: 11, fontWeight: '600', color: '#3d1f0a', marginBottom: 3, marginLeft: 2 }}>
                Parol
              </Text>
              <View style={inputBox()}>
                <Ionicons name="lock-closed-outline" size={14} color="#c45c1a" style={{ marginRight: 6 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 12, fontWeight: '500', color: '#3d1f0a' }}
                  placeholder="••••••••"
                  placeholderTextColor="#d4a882"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={14} color="#c45c1a" />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }} />

              <Text style={{
                textAlign: 'center', color: '#a07858', fontSize: 11,
                lineHeight: 16, marginBottom: 12, marginTop: 16, paddingHorizontal: 14,
              }}>
                Davom etish orqali siz{' '}
                <Text style={{ color: '#f28e2b' }}>Foydalanish qoidalariga</Text>
                {' '}rozilik bildirgan bo'lasiz
              </Text>

              <LinearGradient
                colors={loginLoading ? ['#d4a882', '#d4a882'] : ['#c45c1a', '#f28e2b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12 }}
              >
                <TouchableOpacity
                  onPress={handleLogin}
                  style={{ paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                  activeOpacity={0.8}
                  disabled={loginLoading}
                >
                  {loginLoading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                    {loginLoading ? 'Kirish...' : 'Davom etish'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </ScrollView>

            {/* ===== SIGNUP FORM ===== */}
            <ScrollView
              style={{ width: SCREEN_WIDTH }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 28, paddingHorizontal: 24, paddingTop: 14 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Name row */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#3d1f0a', marginBottom: 3, marginLeft: 2 }}>
                    Ism
                  </Text>
                  <View style={inputBox()}>
                    <Ionicons name="person-outline" size={14} color="#c45c1a" style={{ marginRight: 6 }} />
                    <TextInput
                      style={{ flex: 1, fontSize: 12, fontWeight: '500', color: '#3d1f0a' }}
                      placeholder="Ism"
                      placeholderTextColor="#d4a882"
                      autoCapitalize="words"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#3d1f0a', marginBottom: 3, marginLeft: 2 }}>
                    Familiya
                  </Text>
                  <View style={inputBox()}>
                    <TextInput
                      style={{ flex: 1, fontSize: 12, fontWeight: '500', color: '#3d1f0a' }}
                      placeholder="Familiya"
                      placeholderTextColor="#d4a882"
                      autoCapitalize="words"
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>
                </View>
              </View>

              <Text style={{ fontSize: 11, fontWeight: '600', color: '#3d1f0a', marginBottom: 3, marginLeft: 2 }}>
                Elektron pochta
              </Text>
              <View style={inputBox()}>
                <Ionicons name="mail-outline" size={14} color="#c45c1a" style={{ marginRight: 6 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 12, fontWeight: '500', color: '#3d1f0a' }}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#d4a882"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={signupEmail}
                  onChangeText={setSignupEmail}
                />
              </View>

              <Text style={{ fontSize: 11, fontWeight: '600', color: '#3d1f0a', marginBottom: 3, marginLeft: 2 }}>
                Parol
              </Text>
              <View style={inputBox()}>
                <Ionicons name="lock-closed-outline" size={14} color="#c45c1a" style={{ marginRight: 6 }} />
                <TextInput
                  style={{ flex: 1, fontSize: 12, fontWeight: '500', color: '#3d1f0a' }}
                  placeholder="••••••••"
                  placeholderTextColor="#d4a882"
                  secureTextEntry={!showSignupPassword}
                  value={signupPassword}
                  onChangeText={setSignupPassword}
                />
                <TouchableOpacity onPress={() => setShowSignupPassword(!showSignupPassword)}>
                  <Ionicons name={showSignupPassword ? 'eye-outline' : 'eye-off-outline'} size={14} color="#c45c1a" />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 11, fontWeight: '600', color: '#3d1f0a', marginBottom: 3, marginLeft: 2 }}>
                Parolni tasdiqlang
              </Text>
              <View style={inputBox(passwordsMismatch, passwordsMatch)}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color={passwordsMismatch ? '#ff4d4d' : passwordsMatch ? '#22c55e' : '#c45c1a'}
                  style={{ marginRight: 6 }}
                />
                <TextInput
                  style={{ flex: 1, fontSize: 12, fontWeight: '500', color: passwordsMismatch ? '#ff4d4d' : '#3d1f0a' }}
                  placeholder="••••••••"
                  placeholderTextColor="#d4a882"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={14} color="#c45c1a" />
                </TouchableOpacity>
              </View>
              {passwordsMismatch && (
                <Text style={{ color: '#ff4d4d', fontSize: 10, marginTop: -6, marginBottom: 6, marginLeft: 2 }}>
                  Parollar mos kelmadi
                </Text>
              )}
              {passwordsMatch && (
                <Text style={{ color: '#22c55e', fontSize: 10, marginTop: -6, marginBottom: 6, marginLeft: 2 }}>
                  Parollar mos keldi ✓
                </Text>
              )}

              <View style={{ flex: 1 }} />

              <Text style={{
                textAlign: 'center', color: '#a07858', fontSize: 11,
                lineHeight: 16, marginBottom: 12, marginTop: 14, paddingHorizontal: 14,
              }}>
                Ro'yxatdan o'tish orqali siz{' '}
                <Text style={{ color: '#f28e2b' }}>Foydalanish qoidalariga</Text>
                {' '}rozilik bildirgan bo'lasiz
              </Text>

              <LinearGradient
                colors={!isSignupValid || signupLoading ? ['#d4a882', '#d4a882'] : ['#c45c1a', '#f28e2b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12 }}
              >
                <TouchableOpacity
                  onPress={handleSignUp}
                  style={{ paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                  activeOpacity={0.8}
                  disabled={!isSignupValid || signupLoading}
                >
                  {signupLoading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                    {signupLoading ? 'Yaratilmoqda...' : 'Hisob yaratish'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}