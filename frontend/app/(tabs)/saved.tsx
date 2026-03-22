import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { BASE_URL } from '../../constants/api';
import Toast from 'react-native-toast-message';
import { useLanguage } from '../../context/language-context';
import { useColorScheme } from 'nativewind';

export default function SavedScreen() {
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [savedBooks, setSavedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { t } = useLanguage();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchSavedBooks = useCallback(async (showLoading = true) => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/user-library/get-all-books`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedBooks(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error fetching saved books:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, token]);

  useFocusEffect(
    useCallback(() => {
      fetchSavedBooks();
    }, [fetchSavedBooks])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedBooks(false);
  };

  const handleRemove = async (libraryId: number) => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/user-library/remove-book/${libraryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setSavedBooks(prev => prev.filter(item => item.id !== libraryId));
        Toast.show({ type: 'success', text1: 'O\'chirildi', text2: 'Kitob saqlanganlardan olib tashlandi' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Xatolik', text2: 'O\'chirishda xatolik yuz berdi' });
    }
  };

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white dark:bg-black">
        <SafeAreaView edges={['top']} className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-[#222]">
          <Text className="text-[26px] font-black text-gray-900 dark:text-white">{t('saved')}</Text>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-orange-50 dark:bg-orange-950/40 rounded-full items-center justify-center mb-5">
            <Ionicons name="bookmark-outline" size={38} color={isDark ? "#fb923c" : "#ea580c"} />
          </View>
          <Text className="text-[20px] font-black text-gray-900 dark:text-white text-center mb-2">
            Kiring yoki ro'yxatdan o'ting
          </Text>
          <Text className="text-[15px] text-gray-500 dark:text-gray-400 text-center font-medium leading-5 mb-8">
            Sevimli kitoblaringizni saqlash uchun hisobga kiring
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="bg-orange-500 px-8 py-4 rounded-2xl w-full items-center"
          >
            <Text className="text-white font-black text-[16px]">{t('login')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <SafeAreaView edges={['top']} className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-[#222]">
        <Text className="text-[26px] font-black text-gray-900 dark:text-white">{t('saved')}</Text>
        <Text className="text-[14px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
          {savedBooks.length > 0 ? `${savedBooks.length} ta kitob` : ''}
        </Text>
      </SafeAreaView>

      {loading ? (
        <View className="flex-1 px-5 pt-5">
          {[1, 2, 3, 4].map(i => (
            <View key={i} className="flex-row items-center mb-5 h-28">
              <View className="w-20 h-[110px] bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded-xl mr-4" />
              <View className="flex-1 justify-center space-y-3">
                <View className="h-4 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded w-3/4 mb-2" />
                <View className="h-3 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded w-1/2 mb-3" />
                <View className="h-6 w-20 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded" />
              </View>
            </View>
          ))}
        </View>
      ) : savedBooks.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-gray-50 dark:bg-[#1c1c1e] rounded-full items-center justify-center mb-5 border border-gray-100 dark:border-[#333]">
            <Ionicons name="bookmark-outline" size={38} color={isDark ? "#3f3f46" : "#d1d5db"} />
          </View>
          <Text className="text-[19px] font-black text-gray-900 dark:text-white text-center mb-2">
            Hali kitob saqlanmagan
          </Text>
          <Text className="text-[14px] text-gray-400 text-center font-medium leading-5 mb-8">
            "Albatta o'qiyman" tugmasini bosib kitoblarni saqlab qo'ying
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className="bg-orange-500 px-8 py-4 rounded-2xl items-center"
          >
            <Text className="text-white font-bold text-[15px]">{t('books')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ea580c']} tintColor={isDark ? "#ea580c" : undefined} />}
        >
          {savedBooks.map((item: any) => {
            const book = item.book;
            if (!book) return null;
            const isPremium = parseFloat(book.price || '0') > 0;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push({ pathname: '/book-detail', params: { bookId: book.id.toString() } })}
                className="flex-row mb-4 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-[#333] shadow-sm overflow-hidden"
                style={{ shadowColor: '#000', shadowOpacity: isDark ? 0 : 0.06, shadowRadius: 8, elevation: 2 }}
              >
                {/* Cover */}
                <View className="w-[80px] h-[110px] bg-gray-100 dark:bg-[#2c2c2e]">
                  {book.cover_image ? (
                    <Image source={{ uri: book.cover_image }} style={{ width: 80, height: 110 }} resizeMode="cover" />
                  ) : (
                    <View className="flex-1 items-center justify-center bg-gray-200 dark:bg-[#2c2c2e]">
                      <Ionicons name="book-outline" size={28} color={isDark ? "#60a5fa" : "#3b82f6"} />
                    </View>
                  )}
                </View>

                {/* Content */}
                <View className="flex-1 px-4 py-3 justify-between">
                  <View>
                    <Text className="text-[16px] font-black text-gray-900 dark:text-white leading-5 mb-1" numberOfLines={2}>
                      {book.title}
                    </Text>
                    <Text className="text-[13px] text-gray-500 dark:text-gray-400 font-medium" numberOfLines={1}>
                      {book.author_name || t('unknownAuthor')}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between mt-2">
                    {isPremium ? (
                      <View className="flex-row items-center bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 rounded-lg px-2 py-1">
                        <FontAwesome5 name="crown" size={11} color={isDark ? "#fb923c" : "#ea580c"} style={{ marginRight: 4 }} />
                        <Text className="text-orange-600 dark:text-orange-500 font-bold text-[12px]">
                          {parseFloat(book.price).toLocaleString()} so'm
                        </Text>
                      </View>
                    ) : (
                      <View className="bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-lg px-2 py-1">
                        <Text className="text-green-600 dark:text-green-400 font-bold text-[12px]">{t('free')}</Text>
                      </View>
                    )}

                    {/* Remove button */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                      className="w-8 h-8 items-center justify-center bg-gray-50 dark:bg-[#2c2c2e] rounded-full border border-gray-200 dark:border-[#333]"
                    >
                      <Ionicons name="bookmark" size={16} color={isDark ? "#fb923c" : "#ea580c"} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
