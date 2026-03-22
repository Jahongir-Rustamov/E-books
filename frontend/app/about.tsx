import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useLanguage } from '../context/language-context';

export default function AboutScreen() {
  const { t } = useLanguage();
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>{t('about')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* App Logo & Version Block */}
        <View style={styles.brandingBox}>
          <View style={[styles.logoCircle, isDark && styles.logoCircleDark]}>
            <Ionicons name="book" size={56} color={isDark ? '#e5e7eb' : '#4f46e5'} />
          </View>
          <Text style={[styles.appName, isDark && styles.textDark]}>Sahifa</Text>
          <Text style={[styles.versionText, isDark && styles.versionTextDark]}>1.0.0 Versiya</Text>
        </View>

        {/* Description Section */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.description, isDark && styles.descriptionDark]}>
            Sahifa elektron kutubxonasi eng sifatli kitoblarni taqdim etadi. Maqsadimiz o'zbek tilidagi sifatli internet resurslari va adabiyotlarni bitta joyda jamlashdir. Ilova orqali minglab asarlarni tez va qulay o'qib, shaxsiy kolleksiyangizni kengaytirishingiz mumkin.
          </Text>
        </View>

        {/* Links Section */}
        <View style={styles.linksContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.linkRow, isDark && styles.cardDark]}
            onPress={() => Linking.openURL('https://t.me/JR0525')}
          >
            <Ionicons name="paper-plane-outline" size={22} color="#3b82f6" />
            <Text style={[styles.linkText, isDark && styles.textDark]}>Dasturchi</Text>
            <Ionicons name="open-outline" size={18} color={isDark ? '#555' : '#ccc'} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#1c1c1e',
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  textDark: {
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  brandingBox: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  logoCircleDark: {
    backgroundColor: '#1c1c1e',
    borderColor: '#333',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  versionText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
    fontWeight: '500',
  },
  versionTextDark: {
    color: '#9ca3af',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  cardDark: {
    backgroundColor: '#1c1c1e',
    borderColor: '#333',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    textAlign: 'left',
  },
  descriptionDark: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  linksContainer: {
    marginTop: 0,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
});
