import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../../constants/api';
import { useRouter } from 'expo-router';
import { useLanguage } from '../../context/language-context';
import { useColorScheme } from 'nativewind';

export default function LibraryScreen() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const { t } = useLanguage();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchBooks = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/books/get-all-books`);
      const data = await res.json();
      const booksArray = Array.isArray(data) ? data : [];
      setBooks(booksArray.sort(() => 0.5 - Math.random())); // Har refreshda random qilish
    } catch (e) {
      console.log('Error fetching books for library:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks(loading);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks(false);
  };

  const renderBookItem = ({ item }: { item: any }) => {
    const isPremium = parseFloat(item.price || '0') > 0;

    return (
      <TouchableOpacity key={item.id} className="flex-row mb-5 px-5 h-32 items-center w-full" onPress={() => router.push({ pathname: '/book-detail', params: { bookId: item.id.toString() } })}>
        <View className="w-24 h-[120px] bg-gray-100 dark:bg-[#1c1c1e] rounded-xl overflow-hidden border border-gray-200 dark:border-[#333] shadow-sm mr-4 relative">
          {item.cover_image ? (
            <Image source={{ uri: item.cover_image }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-200 dark:bg-[#2c2c2e]">
              <Ionicons name="book-outline" size={24} color={isDark ? "#60a5fa" : "#3b82f6"} />
            </View>
          )}
        </View>

        <View className="flex-1 py-1 h-full justify-center pb-2">
          <Text className="text-[19px] font-black text-gray-900 dark:text-white leading-6 mb-1" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-[14px] text-gray-500 dark:text-gray-400 font-medium mb-3" numberOfLines={1}>
            {item.author_name || t('unknownAuthor')}
          </Text>

          <View className="flex-row items-center">
             <View className="flex-row items-center gap-x-2 mr-3 border border-[#3b82f6]/20 dark:border-[#3b82f6]/40 bg-blue-50/50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
               <Ionicons name="book" size={14} color={isDark ? "#60a5fa" : "#3b82f6"} />
             </View>

             {isPremium && (
               <View className="bg-orange-100 dark:bg-orange-950/40 rounded mx-1.5 border border-orange-200 dark:border-orange-900/50 px-2 py-1 items-center justify-center shadow-sm">
                 <FontAwesome5 name="crown" size={12} color={isDark ? "#fb923c" : "#ea580c"} />
               </View>
             )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white dark:bg-black">
      <View className="px-5 pt-4 pb-3 border-b border-gray-100 dark:border-[#222] flex-row items-center shadow-sm bg-white dark:bg-[#000] z-50">
        <Text className="text-[25px] font-black text-gray-900 dark:text-white tracking-tight">{t('books')}</Text>
      </View>

      {loading && !refreshing && books.length === 0 ? (
        <View className="w-full mt-6 px-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
             <View key={i} className="flex-row items-center mb-5 h-32 w-full">
               <View className="w-24 h-[120px] bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded-xl mr-4" />
               <View className="flex-1 justify-center py-2 h-full space-y-3">
                  <View className="h-4 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded w-3/4 mb-2" />
                  <View className="h-3 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded w-1/2 mb-4" />
                  <View className="flex-row gap-2">
                    <View className="h-6 w-8 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded" />
                  </View>
               </View>
             </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookItem}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} tintColor={isDark ? "#3b82f6" : undefined} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="library-outline" size={64} color={isDark ? "#3f3f46" : "#d1d5db"} />
              <Text className="text-gray-500 dark:text-gray-400 text-[15px] mt-4 font-semibold text-center">
                {t('noBooksYet')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
