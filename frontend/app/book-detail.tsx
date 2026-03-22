import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, Alert, Linking, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/auth-context';
import { BASE_URL } from '../constants/api';
import { useLanguage } from '../context/language-context';
import { useColorScheme } from 'nativewind';
import { useStripe } from '@stripe/stripe-react-native';

const { width } = Dimensions.get('window');

export default function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  const { t } = useLanguage();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [savedLibraryId, setSavedLibraryId] = useState<number | null>(null);

  const isPremium = parseFloat(book?.price || '0') > 0;

  const fetchBook = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/books/get-book/${bookId}`);
      const data = await res.json();
      setBook(data);
    } catch (e) {
      console.error('Error fetching book:', e);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  const checkSavedAndPurchased = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      // Check user library (saved books)
      const libRes = await fetch(`${BASE_URL}/user-library/get-all-books`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (libRes.ok) {
        const libData = await libRes.json();
        const savedEntry = libData.find((item: any) => item.book_id === parseInt(bookId));
        if (savedEntry) {
          setIsSaved(true);
          setSavedLibraryId(savedEntry.id);
        }
      }

      // Check purchased books
      const purchRes = await fetch(`${BASE_URL}/purchase/my-books`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (purchRes.ok) {
        const purchData = await purchRes.json();
        const found = purchData.find((b: any) => b.id === parseInt(bookId));
        if (found) setIsPurchased(true);
      }
    } catch (e) {
      console.error('Error checking saved/purchased:', e);
    }
  }, [bookId, isAuthenticated, token]);

  useEffect(() => {
    fetchBook();
    checkSavedAndPurchased();
  }, [fetchBook, checkSavedAndPurchased]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated || !token) {
      Toast.show({ type: 'error', text1: 'Kirish kerak', text2: 'Kitobni saqlash uchun tizimga kiring' });
      return;
    }

    setSavingLoading(true);
    try {
      if (isSaved && savedLibraryId) {
        // Remove from library
        const res = await fetch(`${BASE_URL}/user-library/remove-book/${savedLibraryId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          setIsSaved(false);
          setSavedLibraryId(null);
          Toast.show({ type: 'success', text1: 'O\'chirildi', text2: 'Kitob saqlanganlardan olib tashlandi' });
        }
      } else {
        // Add to library
        const res = await fetch(`${BASE_URL}/user-library/add-book/${bookId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok || res.status === 201) {
          setIsSaved(true);
          setSavedLibraryId(data.id);
          Toast.show({ type: 'success', text1: 'Saqlandi!', text2: 'Kitob "Saqlangan"ga qo\'shildi ✅' });
        } else {
          Toast.show({ type: 'error', text1: 'Xatolik', text2: data.message || 'Saqlashda xatolik yuz berdi' });
        }
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Xatolik', text2: 'Serverga ulanib bo\'lmadi' });
    } finally {
      setSavingLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!book?.file_url) {
      Toast.show({ type: 'error', text1: 'Xatolik', text2: 'PDF fayl topilmadi' });
      return;
    }
    try {
      const supported = await Linking.canOpenURL(book.file_url);
      if (supported) {
        await Linking.openURL(book.file_url);
      } else {
        Toast.show({ type: 'error', text1: 'Xatolik', text2: 'PDF ochib bo\'lmadi' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Xatolik', text2: 'PDF yuklab olishda xatolik' });
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated || !token) {
      Toast.show({ type: 'error', text1: 'Kirish kerak', text2: 'Sotib olish uchun tizimga kiring' });
      return;
    }

    Alert.alert(
      'Kitobni sotib olish',
      `"${book?.title}" kitobini ${parseFloat(book?.price || '0').toLocaleString()} so\'mga sotib olasizmi?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Ha, sotib olish',
          style: 'default',
          onPress: async () => {
            setPurchaseLoading(true);
            try {
              // Create payment intent
              const intentRes = await fetch(`${BASE_URL}/purchase/create-intent`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  book_id: parseInt(bookId),
                  amount: parseFloat(book?.price || '0'),
                  currency: 'uzs',
                }),
              });

              const intentData = await intentRes.json();

              if (!intentRes.ok) {
                Toast.show({ type: 'error', text1: 'Xatolik', text2: intentData.message || 'To\'lov amalga oshmadi' });
                return;
              }

              // Initialize Payment Sheet
              console.log('--- STRIPE FRONTEND INIT ---');
              console.log('Client Secret:', intentData.clientSecret?.substring(0, 15) + '...');
              const { error: initError } = await initPaymentSheet({
                merchantDisplayName: 'E-books',
                paymentIntentClientSecret: intentData.clientSecret,
                returnURL: 'ebooks://stripe-redirect'
              });

              if (initError) {
                console.error('--- STRIPE INIT ERROR ---');
                console.error(initError);
                Toast.show({ type: 'error', text1: 'Xatolik', text2: initError.message || 'To\'lov oynasini yuklashda xatolik' });
                return;
              }

              // Present Payment Sheet
              const { error: paymentError } = await presentPaymentSheet();

              if (paymentError) {
                if (paymentError.code === 'Canceled') {
                  Toast.show({ type: 'info', text1: 'Bekor qilindi', text2: 'To\'lov jarayoni bekor qilindi' });
                } else {
                  Toast.show({ type: 'error', text1: 'Xatolik', text2: paymentError.message });
                }
                return;
              }

              // Confirm the purchase on the backend
              const confirmRes = await fetch(`${BASE_URL}/purchase/confirm`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentIntentId: intentData.paymentIntentId }),
              });

              if (confirmRes.ok) {
                setIsPurchased(true);
                // Also add to library automatically
                if (!isSaved) {
                  const libRes = await fetch(`${BASE_URL}/user-library/add-book/${bookId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                  });
                  if (libRes.ok || libRes.status === 201) {
                    const libData = await libRes.json();
                    setIsSaved(true);
                    setSavedLibraryId(libData.id);
                  }
                }
                Toast.show({ type: 'success', text1: 'Muvaffaqiyatli!', text2: 'Kitob muvaffaqiyatli sotib olindi ✅' });
              } else {
                const confirmData = await confirmRes.json();
                Toast.show({ type: 'error', text1: 'Xatolik', text2: confirmData.message || 'Tasdiqlashda xatolik' });
              }
            } catch (e) {
              Toast.show({ type: 'error', text1: 'Xatolik', text2: 'Serverga ulanib bo\'lmadi' });
            } finally {
              setPurchaseLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <ActivityIndicator size="large" color={isDark ? "#fb923c" : "#ea580c"} />
      </View>
    );
  }

  if (!book) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center px-8">
        <Ionicons name="book-outline" size={64} color={isDark ? "#3f3f46" : "#d1d5db"} />
        <Text className="text-gray-500 dark:text-gray-400 text-[16px] font-semibold mt-4 text-center">
          {t('noBooksYet')} {/* Will do for now */}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-orange-500 px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Orqaga</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categories = book.bookCategories?.map((bc: any) => bc.category?.name).filter(Boolean) || [];

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Cover Image Section */}
        <View style={{ height: 260, width: '100%' }}>
          {book.cover_image ? (
            <Image source={{ uri: book.cover_image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={isDark ? ['#1a0b06', '#3b1706', '#592209'] : ['#7a3010', '#c45c1a', '#f28e2b']}
              style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="book" size={70} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          )}

          {/* Gradient overlay at bottom */}
          <LinearGradient
            colors={isDark ? ['transparent', 'rgba(0,0,0,0.45)', '#000000'] : ['transparent', 'rgba(0,0,0,0.45)', '#ffffff']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}
          />

          {/* Header row: back button | Pro badge | bookmark */}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <View className="flex-row items-center justify-between px-4 pt-2">
              {/* Back */}
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>

              {/* Pro badge — center, only if premium */}
              {isPremium ? (
                <View className="flex-row items-center bg-orange-500 rounded-full px-2.5 py-1" style={{ gap: 4 }}>
                  <FontAwesome5 name="crown" size={10} color="#fff" />
                  <Text className="text-white font-bold text-[12px]">Pro</Text>
                </View>
              ) : (
                <View />
              )}

              {/* Bookmark */}
              <TouchableOpacity
                onPress={handleSaveToggle}
                disabled={savingLoading}
                className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
              >
                {savingLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={22} color={isSaved ? '#f97316' : '#fff'} />
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Book Info */}
        <View className="px-5 -mt-4">
          {/* Title & Author */}
          <Text className="text-[26px] font-black text-gray-900 dark:text-white leading-8 mt-2" style={{ letterSpacing: -0.5 }}>
            {book.title}
          </Text>
          <Text className="text-[16px] text-gray-500 dark:text-gray-400 font-semibold mt-1">
            {book.author_name || t('unknownAuthor')}
          </Text>

          {/* Stats Row */}
          <View className="flex-row items-center gap-x-3 mt-5 mb-6">
            {/* Age limit */}
            {book.age_limit && (
              <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-xl px-3 py-2">
                <Ionicons name="person-outline" size={15} color={isDark ? "#60a5fa" : "#3b82f6"} style={{ marginRight: 5 }} />
                <Text className="text-blue-600 dark:text-blue-400 font-bold text-[13px]">{book.age_limit}+</Text>
              </View>
            )}

            {/* Categories */}
            {categories.slice(0, 2).map((cat: string, idx: number) => (
              <View key={idx} className="bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 rounded-xl px-3 py-2">
                <Text className="text-orange-600 dark:text-orange-500 font-bold text-[13px]">{cat}</Text>
              </View>
            ))}
          </View>

          {/* Price section (Premium only) */}
          {isPremium && (
            <View className="bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 rounded-2xl p-4 mb-6 flex-row items-center justify-between">
              <View>
                <Text className="text-[13px] text-orange-600/70 dark:text-orange-500/70 font-semibold mb-0.5">{t('price')}</Text>
                <Text className="text-[24px] font-black text-orange-600 dark:text-orange-500">
                  {parseFloat(book.price).toLocaleString()} so'm
                </Text>
              </View>
              <View className="w-12 h-12 bg-orange-500 rounded-xl items-center justify-center">
                <FontAwesome5 name="crown" size={20} color="#fff" />
              </View>
            </View>
          )}

          {/* Description */}
          {book.description && (
            <View className="mb-6">
              <Text className="text-[20px] font-black text-gray-900 dark:text-white mb-3">{t('aboutBook')}</Text>
              <Text className="text-[15px] text-gray-600 dark:text-gray-300 leading-6 font-medium">
                {book.description}
              </Text>
            </View>
          )}

          {/* All categories */}
          {categories.length > 0 && (
            <View className="mb-6">
              <Text className="text-[17px] font-black text-gray-900 dark:text-white mb-3">{t('categories')}</Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((cat: string, idx: number) => (
                  <View key={idx} className="bg-gray-100 dark:bg-[#1c1c1e] rounded-xl px-3 py-2">
                    <Text className="text-gray-700 dark:text-gray-300 font-semibold text-[13px]">{cat}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-100 dark:border-[#222] px-5 py-4 shadow-lg">
        <SafeAreaView edges={['bottom']}>
          {/* Bookmark Button */}
          <TouchableOpacity
            onPress={handleSaveToggle}
            disabled={savingLoading}
            className={`flex-row items-center justify-center rounded-2xl h-14 mb-3 ${isSaved ? 'bg-gray-100 dark:bg-[#1c1c1e] border border-gray-200 dark:border-[#333]' : 'bg-gray-900 dark:bg-white'}`}
          >
            {savingLoading ? (
              <ActivityIndicator size="small" color={isSaved ? '#6b7280' : (isDark ? '#000' : '#fff')} />
            ) : (
              <>
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={isSaved ? '#6b7280' : (isDark ? '#000' : '#fff')}
                  style={{ marginRight: 8 }}
                />
                <Text className={`font-bold text-[15px] ${isSaved ? 'text-gray-500 dark:text-gray-400' : 'text-white dark:text-black'}`}>
                  {isSaved ? t('alreadySaved') : t('mustRead')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* PDF Download or Purchase Button */}
          {!isPremium ? (
            // Free book - download directly
            <TouchableOpacity
              onPress={handleDownloadPdf}
              className="flex-row items-center justify-center bg-orange-500 rounded-2xl h-14"
            >
              <Ionicons name="download-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white font-black text-[16px]">{t('downloadPdf')}</Text>
            </TouchableOpacity>
          ) : isPurchased ? (
            // Purchased premium - allow download
            <TouchableOpacity
              onPress={handleDownloadPdf}
              className="flex-row items-center justify-center bg-green-500 rounded-2xl h-14"
            >
              <Ionicons name="download-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white font-black text-[16px]">{t('downloadPdf')}</Text>
            </TouchableOpacity>
          ) : (
            // Premium not purchased - buy
            <TouchableOpacity
              onPress={handlePurchase}
              disabled={purchaseLoading}
              className="flex-row items-center justify-center rounded-2xl h-14"
              style={{ backgroundColor: '#ea580c' }}
            >
              {purchaseLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <FontAwesome5 name="crown" size={16} color="#fff" style={{ marginRight: 8 }} />
                  <Text className="text-white font-black text-[16px]">
                    {parseFloat(book.price).toLocaleString()} so'm — {t('buy')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </View>
    </View>
  );
}
