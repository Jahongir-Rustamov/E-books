import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/auth-context';

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handleBack = () => router.replace('/');

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) return;
    if (password !== confirmPassword) return;
    setLoading(true);
    const success = await signup({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    });
    setLoading(false);
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

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

  const isFormValid = firstName && lastName && email && password && confirmPassword && !passwordsMismatch;

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
              Yangi hisob yarating!
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={{
        flex: 1, backgroundColor: '#fff',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        marginTop: -26, overflow: 'hidden',
      }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 28, paddingHorizontal: 24, paddingTop: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tab switcher */}
          <View style={{
            flexDirection: 'row', backgroundColor: '#fdf0e6',
            borderRadius: 10, padding: 3, marginBottom: 18,
          }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ flex: 1, paddingVertical: 8, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#c45c1a' }}>Kirish</Text>
            </TouchableOpacity>
            <View style={{
              flex: 1, paddingVertical: 8, alignItems: 'center',
              backgroundColor: '#f28e2b', borderRadius: 7,
            }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                Ro'yxatdan o'tish
              </Text>
            </View>
          </View>

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

          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm password */}
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

          {/* Footer */}
          <Text style={{
            textAlign: 'center', color: '#a07858', fontSize: 11,
            lineHeight: 16, marginBottom: 12, marginTop: 14, paddingHorizontal: 14,
          }}>
            Ro'yxatdan o'tish orqali siz{' '}
            <Text style={{ color: '#f28e2b' }}>Foydalanish qoidalariga</Text>
            {' '}rozilik bildirgan bo'lasiz
          </Text>

          <LinearGradient
            colors={!isFormValid || loading ? ['#d4a882', '#d4a882'] : ['#c45c1a', '#f28e2b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 12 }}
          >
            <TouchableOpacity
              onPress={handleSignUp}
              style={{ paddingVertical: 13, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
              activeOpacity={0.8}
              disabled={!isFormValid || loading}
            >
              {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                {loading ? 'Yaratilmoqda...' : 'Hisob yaratish'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </View>
    </View>
  );
}