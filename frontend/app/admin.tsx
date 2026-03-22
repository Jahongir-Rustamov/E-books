import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useLanguage } from '../context/language-context';
import { useAuth } from '../context/auth-context';
import { BASE_URL, API_ENDPOINTS } from '../constants/api';
import Toast from 'react-native-toast-message';

export default function AdminScreen() {
  const { t } = useLanguage();
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const { token } = useAuth();
  const isDark = colorScheme === 'dark';

  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isWarningModalVisible, setWarningModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCategoryPress = () => {
    setCategoryModalVisible(true);
  };

  const handleSavePress = () => {
    if (!categoryName.trim()) {
      Toast.show({ type: 'error', text1: 'Xatolik', text2: 'Kategoriya nomini kiriting' });
      return;
    }
    setWarningModalVisible(true);
  };

  const confirmCreateCategory = async () => {
    setWarningModalVisible(false);
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}${API_ENDPOINTS.CATEGORY_CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: categoryName.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        let errorMessage = data.message || 'Xatolik yuz berdi';
        if (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('already exist')) {
          errorMessage = 'Ushbu kategoriya allaqachon mavjud!';
        }
        // Close modal first, then show toast
        setCategoryModalVisible(false);
        setCategoryName('');
        setTimeout(() => {
          Toast.show({ type: 'error', text1: 'Xatolik', text2: errorMessage });
        }, 350);
        return;
      }
      setCategoryModalVisible(false);
      setCategoryName('');
      setTimeout(() => {
        Toast.show({ type: 'success', text1: 'Muvaffaqiyatli', text2: 'Kategoriya yaratildi ✅' });
      }, 350);
    } catch (error: any) {
      setCategoryModalVisible(false);
      setTimeout(() => {
        Toast.show({ type: 'error', text1: 'Xatolik', text2: error.message });
      }, 350);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-[#1c1c1e] border-b border-gray-200 dark:border-[#333]">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">{t('adminPage')}</Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerClassName="px-4 pb-10" showsVerticalScrollIndicator={false}>
        <View className="px-1 py-4">
          <Text className="text-[13px] text-gray-500 font-semibold tracking-widest uppercase">{t('systemManagement')}</Text>
        </View>

        {/* Card 1: Category Yaratish */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-row items-center bg-white dark:bg-[#1c1c1e] p-4 rounded-2xl mb-3 border border-gray-200 dark:border-[#333]"
          onPress={handleCreateCategoryPress}
        >
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-indigo-600">
            <Ionicons name="layers" size={20} color="#fff" />
          </View>
          <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">{t('createCategory')}</Text>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#555' : '#ccc'} />
        </TouchableOpacity>

        {/* Card 2: Kitob qo'shish */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-row items-center bg-white dark:bg-[#1c1c1e] p-4 rounded-2xl mb-3 border border-gray-200 dark:border-[#333]"
          onPress={() => router.push('/add-book' as any)}
        >
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-orange-600">
            <Ionicons name="book" size={20} color="#fff" />
          </View>
          <Text className="flex-1 text-base font-semibold text-gray-900 dark:text-white">{t('addBook')}</Text>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#555' : '#ccc'} />
        </TouchableOpacity>

        {/* Card 3: Kitoblarni tahrirlash */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-row items-center bg-white dark:bg-[#1c1c1e] p-4 rounded-2xl mb-3 border border-gray-200 dark:border-[#333]"
          onPress={() => router.push('/edit-books' as any)}
        >
          <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-emerald-600">
            <Ionicons name="create" size={20} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">{t('editBooks')}</Text>
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('editAndDelete')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={isDark ? '#555' : '#ccc'} />
        </TouchableOpacity>

        <View className="h-10" />
      </ScrollView>

      {/* Category Create Modal */}
      <Modal visible={isCategoryModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white dark:bg-[#1c1c1e] rounded-t-3xl p-6 min-h-[40%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900 dark:text-white">{t('createCategory')}</Text>
                <TouchableOpacity onPress={() => setCategoryModalVisible(false)} className="p-2 bg-gray-100 dark:bg-[#2c2c2e] rounded-full">
                  <Ionicons name="close" size={20} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
              </View>

              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{t('categoryName')}</Text>
              <TextInput
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder={t('newCategoryName')}
                placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
                autoFocus
                className="bg-gray-50 dark:bg-[#09090b] border border-gray-200 dark:border-[#333] rounded-xl px-4 py-4 text-base text-gray-900 dark:text-white mb-6"
              />

              <TouchableOpacity
                onPress={handleSavePress}
                disabled={isSubmitting}
                className={`rounded-xl py-4 items-center justify-center flex-row shadow-sm ${
                  isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 shadow-indigo-500/30'
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={22} color="#fff" />
                    <Text className="text-white font-bold text-base ml-2">{t('save')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Warning Modal */}
      <Modal visible={isWarningModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-5">
          <View className="bg-white dark:bg-[#1c1c1e] w-full rounded-3xl p-6 shadow-xl shadow-black/40">
            <View className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full items-center justify-center self-center mb-5">
              <Ionicons name="warning" size={32} color={isDark ? '#ef4444' : '#dc2626'} />
            </View>
            <Text className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
              {t('attention')}
            </Text>
            <Text className="text-base text-center text-gray-500 dark:text-gray-400 mb-8 leading-6">
              {t('categoryWarning')}
              {'\n\n'}{t('enteredName')}<Text className="font-bold text-gray-900 dark:text-white">"{categoryName}"</Text>
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setWarningModalVisible(false)}
                className="flex-1 py-3.5 bg-gray-100 dark:bg-[#2c2c2e] rounded-xl items-center mr-3"
              >
                <Text className="font-semibold text-gray-900 dark:text-white text-base">{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmCreateCategory}
                className="flex-1 py-3.5 bg-red-600 rounded-xl items-center shadow-sm shadow-red-500/30"
              >
                <Text className="font-semibold text-white text-base">{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
