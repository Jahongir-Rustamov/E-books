import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/auth-context';
import { useLanguage, Language } from '../../context/language-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/theme-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useAppTheme();
  const router = useRouter();

  const [localIsDark, setLocalIsDark] = useState(isDark);

  useEffect(() => {
    setLocalIsDark(isDark);
  }, [isDark]);

  const handleToggleTheme = (newValue: boolean) => {
    setLocalIsDark(newValue);
    setTimeout(() => {
      toggleTheme(newValue);
    }, 150); // wait 150ms for the switch animation to finish seamlessly
  };

  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
    } else {
      router.push('/(auth)/login');
    }
  };

  const languages: { code: Language, label: string }[] = [
    { code: 'uz', label: "O'zbekcha" },
    { code: 'ru', label: "Русский" },
    { code: 'en', label: "English" }
  ];

  const selectLanguage = (code: Language) => {
    setLanguage(code);
    setLanguageModalVisible(false);
  };

  const currentLanguageLabel = {
    uz: "O'zbekcha",
    ru: "Русский",
    en: "English"
  }[language];

  return (
    <SafeAreaView className="flex-1 bg-[#f3f4f6] dark:bg-[#000000]">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4">
          <Text className="text-[28px] font-bold text-black dark:text-white">{t('profileTitle')}</Text>
          <TouchableOpacity>
            <Ionicons name="flame-outline" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        <View className="px-4 pt-2 pb-6">
          {/* Section 0: Profile Info (Only when Authenticated) */}
          {isAuthenticated && user && (
            <View style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
              <LinearGradient
                colors={isDark ? ['#1f2937', '#111827'] : ['#7a3010', '#c45c1a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-5 px-5 shadow-sm shadow-black/15"
              >
                <View className="flex-row items-center">
                  <Ionicons name="person-circle-outline" size={60} color="#fff" className="mr-4" />
                  <View className="flex-1 justify-center">
                    <Text className="text-xl font-bold text-white mb-0.5">
                      {user.first_name} {user.last_name}
                    </Text>
                    <Text className="text-[13px] text-white/80">
                      Xaridlar: <Text className="font-bold text-white">{user._count?.purchases || 0}</Text> ta kitob
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Section 1: Auth (Kirish) - Only show if unauthenticated inside content list */}
          {!isAuthenticated && (
            <View className="bg-white dark:bg-[#1c1c1e] rounded-2xl mb-4 overflow-hidden">
              <TouchableOpacity className="flex-row items-center py-3.5 px-4" onPress={handleAuthAction}>
                <View className="w-8 h-8 rounded-lg justify-center items-center mr-4 bg-blue-500">
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                </View>
                <Text className="flex-1 text-base text-[#1f2937] dark:text-white">
                  {t('login')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={isDark ? '#52525b' : '#a1a1aa'} />
              </TouchableOpacity>
            </View>
          )}

          {/* Section 2: Admin specific content */}
          {user?.role === 'ADMIN' && (
            <View className="bg-white dark:bg-[#1c1c1e] rounded-2xl mb-4 overflow-hidden">
              <TouchableOpacity className="flex-row items-center py-3.5 px-4" onPress={() => router.push('/admin')}>
                <View className="w-8 h-8 rounded-lg justify-center items-center mr-4 bg-red-600">
                  <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                </View>
                <Text className="flex-1 text-base text-[#1f2937] dark:text-white">{t('adminPage')}</Text>
                <Ionicons name="chevron-forward" size={20} color={isDark ? '#52525b' : '#a1a1aa'} />
              </TouchableOpacity>
            </View>
          )}

          {/* Section 3: Settings (Language & Dark Mode) */}
          <View className="bg-white dark:bg-[#1c1c1e] rounded-2xl mb-4 overflow-hidden">
            <TouchableOpacity className="flex-row items-center py-3.5 px-4 border-b border-gray-200 dark:border-[#333]" onPress={() => setLanguageModalVisible(true)}>
              <View className="w-8 h-8 rounded-lg justify-center items-center mr-4 bg-blue-500">
                <Ionicons name="globe-outline" size={20} color="#fff" />
              </View>
              <Text className="flex-1 text-base text-[#1f2937] dark:text-white">{t('appLanguage')}</Text>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-500 mr-1">{currentLanguageLabel}</Text>
                <Ionicons name="chevron-forward" size={20} color={isDark ? '#52525b' : '#a1a1aa'} />
              </View>
            </TouchableOpacity>

            <View className="flex-row items-center py-3.5 px-4">
              <View className="w-8 h-8 rounded-lg justify-center items-center mr-4 bg-orange-500">
                <Ionicons name="moon" size={20} color="#fff" />
              </View>
              <Text className="flex-1 text-base text-[#1f2937] dark:text-white">{t('darkMode')}</Text>
              <Switch
                value={localIsDark}
                onValueChange={handleToggleTheme}
                trackColor={{ false: '#d1d5db', true: '#f97316' }}
                thumbColor={'#fff'}
              />
            </View>
          </View>

          {/* Section 4: App Info & Logout */}
          <View className="bg-white dark:bg-[#1c1c1e] rounded-2xl mb-4 overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center py-3.5 px-4 border-b border-gray-200 dark:border-[#333]"
              onPress={() => router.push('/terms')}
            >
              <View className="w-8 h-8 rounded-lg justify-center items-center mr-4 bg-slate-500">
                <Ionicons name="document-text-outline" size={20} color="#fff" />
              </View>
              <Text className="flex-1 text-base text-[#1f2937] dark:text-white">{t('terms')}</Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#52525b' : '#a1a1aa'} />
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center py-3.5 px-4 ${isAuthenticated ? 'border-b border-gray-200 dark:border-[#333]' : ''}`}
              onPress={() => router.push('/about')}
            >
              <View className="w-8 h-8 rounded-lg justify-center items-center mr-4 bg-teal-500">
                <Ionicons name="information-circle-outline" size={20} color="#fff" />
              </View>
              <Text className="flex-1 text-base text-[#1f2937] dark:text-white">{t('about')}</Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#52525b' : '#a1a1aa'} />
            </TouchableOpacity>

            {/* Logout Appended directly inside Settings array if authenticated */}
            {isAuthenticated && (
              <TouchableOpacity className="flex-row items-center py-3.5 px-4" onPress={logout}>
                <View className="w-8 h-8 rounded-lg justify-center items-center mr-4 bg-red-100 dark:bg-red-500/20">
                  <Ionicons name="log-out-outline" size={20} color={isDark ? '#f87171' : '#e53e3e'} />
                </View>
                <Text className="flex-1 text-base font-bold text-red-600 dark:text-red-400">
                  {t('logout')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <View className="w-4/5 bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 shadow-md shadow-black/25">
            <Text className="text-lg font-bold mb-4 text-center text-black dark:text-white">{t('appLanguage')}</Text>
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang.code}
                className={`flex-row justify-between py-3.5 ${index < languages.length - 1 ? 'border-b border-gray-200 dark:border-[#333]' : ''} ${language === lang.code ? 'bg-indigo-500/10 rounded-lg -mx-2 px-2' : ''}`}
                onPress={() => selectLanguage(lang.code)}
              >
                <Text className={`text-base text-[#1f2937] dark:text-white ${language === lang.code ? 'px-2' : ''}`}>{lang.label}</Text>
                {language === lang.code && (
                  <Ionicons name="checkmark-circle" size={20} color="#4f46e5" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
