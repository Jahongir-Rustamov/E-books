import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Modal, Dimensions, Keyboard, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/auth-context';
import { useLanguage } from '../../context/language-context';
import { useColorScheme } from 'nativewind';
import { BASE_URL, API_ENDPOINTS } from '../../constants/api';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 56) / 2;

const CATEGORY_ICONS: any[] = [
  'planet-outline', 'library-outline', 'flask-outline', 'earth-outline',
  'color-palette-outline', 'leaf-outline', 'rocket-outline', 'compass-outline',
  'heart-outline', 'bulb-outline', 'paw-outline', 'cube-outline', 'diamond-outline'
];

export default function HomeScreen() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<'Premium' | 'New' | number | null>(null);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  React.useEffect(() => {
    const unsubscribe = (navigation as any).addListener('tabPress', (e: any) => {
      clearFilter();
    });
    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchData(false);
    }, [])
  );

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [catRes, bookRes] = await Promise.all([
        fetch(`${BASE_URL}${API_ENDPOINTS.CATEGORY_GET_ALL || '/category/get-all-categories'}`),
        fetch(`${BASE_URL}/books/get-all-books`)
      ]);
      const catData = await catRes.json();
      const bookData = await bookRes.json();

      const formattedCategories = (Array.isArray(catData) ? catData : []).map(cat => ({
        ...cat,
        name: cat.name ? cat.name.charAt(0).toUpperCase() + cat.name.slice(1).toLowerCase() : ''
      }));
      setCategories(formattedCategories);
      setBooks(Array.isArray(bookData) ? bookData : []);
    } catch (e) {
      console.log('Error fetching homepage data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(false);
  };

  const getCategoryCount = (categoryId: number) => {
    if (!Array.isArray(books)) return 0;
    return books.filter(b => b.bookCategories?.some((bc: any) => bc.category_id === categoryId)).length;
  };
  const premiumCount = Array.isArray(books) ? books.filter(b => parseFloat(b.price || '0') > 0).length : 0;

  const getCategoryIcon = (index: number) => {
    return CATEGORY_ICONS[index % CATEGORY_ICONS.length] as any;
  };

  const handleCategoryPress = (cat: 'Premium' | 'New' | number | null) => {
    setSelectedCategory(cat);
    setCategoryModalVisible(false);
    setIsSearchFocused(false);
    Keyboard.dismiss();
  };

  const clearFilter = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setIsSearchFocused(false);
    Keyboard.dismiss();
  };

  const isListMode = isSearchFocused || searchQuery.trim().length > 0 || selectedCategory !== null;

  const suggestedBooks = useMemo(() => {
    return [...books].sort(() => 0.5 - Math.random()).slice(0, 5);
  }, [books]);

  const newestBooks = useMemo(() => {
    return [...books].sort((a, b) => b.id - a.id).slice(0, 5);
  }, [books]);

  let displayedBooks = Array.isArray(books) ? books : [];
  let activeFilterLabel = '';
  const filterCategory = selectedCategory;

  if (searchQuery.trim().length > 0) {
    displayedBooks = displayedBooks.filter(b => b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || b.author_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    activeFilterLabel = searchQuery;
  } else if (filterCategory === 'Premium') {
    displayedBooks = displayedBooks.filter(b => parseFloat(b.price || '0') > 0);
    activeFilterLabel = `${t('premium')} ${t('books').toLowerCase()}`;
  } else if (filterCategory === 'New') {
    displayedBooks = [...books].reverse();
    activeFilterLabel = t('newlyAdded');
  } else if (filterCategory !== null) {
    displayedBooks = displayedBooks.filter(b => b.bookCategories?.some((bc: any) => bc.category_id === filterCategory));
    activeFilterLabel = categories.find(c => c.id === filterCategory)?.name || '';
  }


  const renderGridItem = (book: any) => {
    const isPremium = parseFloat(book.price || '0') > 0;

    return (
      <TouchableOpacity
        key={book.id}
        style={{ width: 140, marginRight: 16 }}
        className="group"
        onPress={() => router.push({ pathname: '/book-detail', params: { bookId: book.id.toString() } })}
      >
        <View
          style={{ height: 190 }}
          className="bg-gray-100 dark:bg-[#1c1c1e] rounded-[14px] overflow-hidden relative border border-gray-200/60 dark:border-[#333] shadow-sm"
        >
          {book.cover_image ? (
            <Image source={{ uri: book.cover_image }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-200 dark:bg-[#2c2c2e]">
              <Ionicons name="book-outline" size={40} color={isDark ? "#60a5fa" : "#3b82f6"} />
            </View>
          )}

          <View className="absolute top-2 left-2 bg-white/95 dark:bg-black/80 rounded-lg py-1 px-2 flex-row items-center space-x-1 shadow-sm">
            <Ionicons name="book" size={13} color={isDark ? "#60a5fa" : "#3b82f6"} />
          </View>

          {isPremium && (
            <View className="absolute top-2 right-2 bg-white/95 dark:bg-black/80 rounded-lg py-1.5 px-2 items-center justify-center shadow-sm">
              <FontAwesome5 name="crown" size={12} color={isDark ? "#fb923c" : "#f97316"} />
            </View>
          )}
        </View>

        <Text className="text-[15px] font-extrabold text-gray-900 dark:text-white mt-3 leading-5" numberOfLines={2}>
          {book.title}
        </Text>
        <Text className="text-[13px] text-gray-500 dark:text-gray-400 font-medium mt-1" numberOfLines={1}>
          {book.author_name || t('unknownAuthor')}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderListItem = (book: any) => {
    const isPremium = parseFloat(book.price || '0') > 0;
    return (
      <TouchableOpacity key={book.id} className="flex-row mb-5 px-5 h-32 items-center" onPress={() => router.push({ pathname: '/book-detail', params: { bookId: book.id.toString() } })}>
        <View className="w-24 h-[120px] bg-gray-100 dark:bg-[#1c1c1e] rounded-xl overflow-hidden border border-gray-200 dark:border-[#333] shadow-sm mr-4">
          {book.cover_image ? (
            <Image source={{ uri: book.cover_image }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-200 dark:bg-[#2c2c2e]">
              <Ionicons name="book-outline" size={24} color={isDark ? "#60a5fa" : "#3b82f6"} />
            </View>
          )}
        </View>

        <View className="flex-1 py-1 h-full justify-center pb-2">
          <Text className="text-[19px] font-black text-gray-900 dark:text-white leading-6 mb-1" numberOfLines={2}>
            {book.title}
          </Text>
          <Text className="text-[14px] text-gray-500 dark:text-gray-400 font-medium mb-3" numberOfLines={1}>
            {book.author_name || t('unknownAuthor')}
          </Text>

          <View className="flex-row items-center">
             <View className="flex-row items-center gap-x-2 mr-3 border border-[#3b82f6]/20 dark:border-[#3b82f6]/40 bg-blue-50/50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
               <Ionicons name="book" size={14} color={isDark ? "#93c5fd" : "#3b82f6"} />
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

  const CategoryPill = ({ title, count, icon, onPress, isSelected, isPremium }: any) => {
    let containerClass = 'bg-gray-50 dark:bg-[#1c1c1e] border-gray-200 dark:border-[#333]';
    let textClass = 'font-semibold text-gray-800 dark:text-gray-100';
    let countClass = 'text-gray-500 dark:text-gray-400 font-medium';
    let iconColor = isDark ? '#9ca3af' : '#4b5563';

    if (isSelected) {
      containerClass = 'bg-orange-600 border-orange-600 shadow-md shadow-orange-500/30';
      textClass = 'font-bold text-white';
      countClass = 'text-orange-200 font-medium';
      iconColor = '#fff';
    } else if (isPremium) {
      containerClass = 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-900 border-[1.5px]';
      textClass = 'font-extrabold text-orange-600 dark:text-orange-500';
      countClass = 'bg-orange-200 dark:bg-orange-900 text-orange-700 dark:text-orange-200 font-bold px-1.5 py-0.5 mx-1 rounded-md overflow-hidden';
      iconColor = isDark ? '#fb923c' : '#ea580c';
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        className={`px-5 py-3 rounded-[18px] flex-row items-center border ${containerClass}`}
      >
        {isPremium && !isSelected ? (
          <FontAwesome5 name="crown" size={13} color={iconColor} style={{ marginRight: 8 }} />
        ) : (
          <Ionicons name={icon} size={16} color={iconColor} style={{ marginRight: 8 }} />
        )}
        <Text className={`text-[14px] ${textClass}`}>
          {title} <Text className={countClass}>({count})</Text>
        </Text>
      </TouchableOpacity>
    );
  };

  const midIndex = Math.ceil(categories.length / 2);
  const topRows = categories.slice(0, midIndex);
  const bottomRows = categories.slice(midIndex);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Dynamic Top Navigation / Header */}
      {!isListMode ? (
        <LinearGradient
          colors={isDark ? ['#1a0b06', '#3b1706', '#592209'] : ['#7a3010', '#c45c1a', '#f28e2b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pb-8 rounded-b-[30px] shadow-lg shadow-orange-900/40"
        >
          <SafeAreaView edges={['top']} className="px-5 pt-4">
            <View className="flex-row items-center justify-between px-2 pt-2">
               <View className="flex-row items-center flex-1 pr-4">
                 <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-3 border border-white/30 shadow-sm">
                   <Ionicons name="person" size={22} color="#fff" />
                 </View>
                 <View className="flex-1 justify-center">
                   <Text className="text-[14px] text-white/90 font-medium tracking-wide mb-0.5">
                     {t('welcome')}
                   </Text>
                   {user ? (
                     <Text className="text-[17px] font-bold text-white tracking-wide" numberOfLines={1}>
                       {user.first_name} {user.last_name}
                     </Text>
                   ) : (
                     <Text className="text-[17px] font-bold text-white tracking-wide" numberOfLines={1}>
                       {t('guest')}
                     </Text>
                   )}
                 </View>
               </View>

               <TouchableOpacity className="w-11 h-11 rounded-full bg-white/15 items-center justify-center border border-white/20">
                 <Ionicons name="flame-outline" size={22} color="#fff" />
                 <View className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
               </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      ) : (
        <SafeAreaView edges={['top']} className="bg-white dark:bg-[#09090b] px-5 pt-4 pb-3 border-b border-gray-100 dark:border-[#222] flex-row items-center shadow-sm z-50">
           <TouchableOpacity onPress={clearFilter} className="w-10 h-10 items-center justify-center mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1c1c1e]">
             <Ionicons name="arrow-back" size={26} color={isDark ? "#fff" : "#111827"} />
           </TouchableOpacity>

           {isSearchFocused ? (
             <View className="flex-1 flex-row items-center border border-orange-400 dark:border-orange-500 bg-white dark:bg-[#1c1c1e] rounded-2xl h-12 px-4">
                <Ionicons name="search" size={20} color={isDark ? "#6b7280" : "#9ca3af"} style={{ marginRight: 8 }} />
                <TextInput
                   ref={searchInputRef}
                   placeholder={t('searchPlaceholder').split('...')[0] + '...'}
                   placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                   value={searchQuery}
                   onChangeText={setSearchQuery}
                   autoFocus={true}
                   className="flex-1 text-[16px] font-medium text-gray-900 dark:text-white"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                    <Ionicons name="close-circle" size={22} color={isDark ? "#6b7280" : "#9ca3af"} />
                  </TouchableOpacity>
                )}
             </View>
           ) : (
             <Text className="flex-1 text-center text-[20px] font-black text-gray-900 dark:text-white tracking-tight" numberOfLines={1}>
                {activeFilterLabel}
             </Text>
           )}
        </SafeAreaView>
      )}

      {/* Main Content Area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        className={!isListMode ? "pt-6" : "pt-4"}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ea580c']} tintColor={isDark ? "#ea580c" : undefined} />}
      >
        {!isListMode && (
          <View className="px-5 mb-7">
             <TouchableOpacity
               activeOpacity={1}
               onPress={() => { setIsSearchFocused(true); }}
               className="flex-row items-center bg-gray-50 dark:bg-[#1c1c1e] rounded-2xl px-4 h-14 border border-gray-200 dark:border-[#333]"
             >
               <Ionicons name="search-outline" size={20} color={isDark ? "#6b7280" : "#9ca3af"} style={{ marginRight: 10 }} />
               <Text className="flex-1 text-[15px] text-[#9ca3af] dark:text-gray-400 font-medium">
                 {t('searchPlaceholder')}
               </Text>
             </TouchableOpacity>
          </View>
        )}

        {!isListMode && (
          <View className="flex-row px-5 mb-9 items-center">
            <TouchableOpacity
              onPress={() => setCategoryModalVisible(true)}
              className="w-12 h-[100px] bg-orange-50 dark:bg-orange-950/40 rounded-2xl items-center justify-center mr-3 border border-orange-100 dark:border-orange-900/50 shadow-sm"
            >
              <Ionicons name="apps" size={24} color={isDark ? "#fb923c" : "#ea580c"} />
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {loading ? (
                <View className="flex-row gap-x-3 px-5">
                   {[1, 2, 3, 4].map((i) => (
                      <View key={i} className="w-32 h-12 bg-gray-200/80 dark:bg-[#2c2c2e] animate-pulse rounded-2xl" />
                   ))}
                </View>
              ) : (
                <View className="flex-col gap-y-3">
                  <View className="flex-row gap-x-3">
                    <CategoryPill
                      title={`${t('premium')} ${t('books').toLowerCase()}`} count={premiumCount} icon="star" isSelected={selectedCategory === 'Premium'}
                      isPremium={true} onPress={() => handleCategoryPress('Premium')}
                    />
                    {topRows.map((c, idx) => (
                      <CategoryPill
                        key={c.id} title={c.name} count={getCategoryCount(c.id)} icon={getCategoryIcon(idx)}
                        isSelected={selectedCategory === c.id} onPress={() => handleCategoryPress(c.id)}
                      />
                    ))}
                  </View>
                  <View className="flex-row gap-x-3">
                    {bottomRows.map((c, idx) => (
                       <CategoryPill
                         key={c.id} title={c.name} count={getCategoryCount(c.id)} icon={getCategoryIcon(idx + topRows.length)}
                         isSelected={selectedCategory === c.id} onPress={() => handleCategoryPress(c.id)}
                       />
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {isListMode && isSearchFocused && activeFilterLabel !== '' && (
          <View className="px-5 mb-6">
            <View className="flex-row items-center border border-gray-200 dark:border-[#333] rounded-full pl-4 pr-1 py-1 mr-auto self-start bg-gray-50 dark:bg-[#1c1c1e]">
              <Text className="text-[15px] font-bold text-gray-800 dark:text-gray-200 mr-2">{activeFilterLabel}</Text>
              <TouchableOpacity onPress={clearFilter} className="bg-gray-200/50 dark:bg-[#2c2c2e] rounded-full p-1 border border-gray-200 dark:border-[#333]">
                <Ionicons name="close" size={16} color={isDark ? "#9ca3af" : "#4b5563"} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Books Rendering */}
        {loading ? (
          <View className="w-full mt-2">
            {isListMode ? (
              <View className="px-5 w-full mt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                   <View key={i} className="flex-row items-center mb-5 h-32">
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
              <>
                <View className="mb-10 w-full">
                  <View className="px-5 mb-5 flex-row justify-between">
                    <View className="w-1/3 h-6 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded" />
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                     {[1, 2, 3].map(i => (
                        <View key={i} style={{ width: 140, marginRight: 16 }}>
                           <View style={{ height: 190 }} className="bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded-[14px]" />
                           <View className="h-4 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded w-4/5 mt-3" />
                           <View className="h-3 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded w-1/2 mt-2" />
                        </View>
                     ))}
                  </ScrollView>
                </View>

                <View className="mb-10 w-full">
                  <View className="px-5 mb-5 flex-row justify-between">
                    <View className="w-2/5 h-6 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded" />
                  </View>
                  <View className="px-5 w-full">
                    {[1, 2, 3].map((i) => (
                       <View key={i} className="flex-row items-center mb-5 h-32">
                         <View className="w-24 h-[120px] bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded-xl mr-4" />
                         <View className="flex-1 justify-center py-2 h-full space-y-3">
                            <View className="h-4 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded w-3/4 mb-2" />
                            <View className="h-3 bg-gray-200 dark:bg-[#2c2c2e] animate-pulse rounded w-1/2 mb-4" />
                         </View>
                       </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
        ) : isListMode ? (
          <View className="w-full">
             {displayedBooks.length === 0 ? (
               <View className="items-center mt-10 p-6 bg-gray-50 dark:bg-[#1c1c1e] mx-5 rounded-3xl border border-gray-100 dark:border-[#333]">
                 <Ionicons name="library-outline" size={54} color={isDark ? "#3f3f46" : "#d1d5db"} />
                 <Text className="text-gray-500 dark:text-gray-400 text-[15px] mt-4 font-semibold text-center">
                   {t('noBooksYet')}
                 </Text>
               </View>
             ) : (
               displayedBooks.map(b => renderListItem(b))
             )}
          </View>
        ) : (
          <>
            <View className="mb-10">
              <View className="flex-row items-center justify-between px-5 mb-5">
                <Text className="text-[22px] font-black text-gray-900 dark:text-white tracking-tight">{t('forYou')}</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/books')}>
                  <Text className="text-[15px] font-bold text-[#ea580c] dark:text-[#fb923c]">{t('seeAll')}</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                 {suggestedBooks.map(b => renderGridItem(b))}
              </ScrollView>
            </View>

            <View className="mb-10 w-full">
              <View className="flex-row items-center justify-between px-5 mb-5">
                <Text className="text-[22px] font-black text-gray-900 dark:text-white tracking-tight">{t('newlyAdded')}</Text>
              </View>
              <View className="flex-col">
                 {newestBooks.map(b => renderListItem(b))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Categories Modal */}
      <Modal visible={isCategoryModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setCategoryModalVisible(false)}>
        <View className="flex-1 bg-white dark:bg-[#000]">
          <View className="flex-row items-center justify-between p-5 border-b border-gray-100 dark:border-[#222]">
            <Text className="text-xl font-black text-gray-900 dark:text-white">{t('categories')}</Text>
            <TouchableOpacity onPress={() => setCategoryModalVisible(false)} className="w-10 h-10 bg-gray-50 dark:bg-[#1c1c1e] rounded-full items-center justify-center border border-gray-200 dark:border-[#333]">
               <Ionicons name="close" size={22} color={isDark ? "#9ca3af" : "#4b5563"} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }} className="pt-2">
             <View className="flex-col gap-y-3">
                <TouchableOpacity onPress={() => handleCategoryPress('Premium')} className={`py-4 px-5 rounded-2xl flex-row items-center justify-between border ${selectedCategory === 'Premium' ? 'bg-orange-600 border-orange-600' : 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/50 border-[1.5px]'}`}>
                  <View className="flex-row items-center">
                    {selectedCategory === 'Premium' ? (
                       <Ionicons name="star" size={22} color="#fcd34d" style={{ marginRight: 14 }} />
                    ) : (
                       <FontAwesome5 name="crown" size={18} color={isDark ? "#fb923c" : "#ea580c"} style={{ marginRight: 14 }} />
                    )}
                    <Text className={`text-[17px] ${selectedCategory === 'Premium' ? 'font-black text-white' : 'font-extrabold text-orange-600 dark:text-orange-500'}`}>{t('premium')} {t('books').toLowerCase()}</Text>
                  </View>
                  <View className={`${selectedCategory === 'Premium' ? 'bg-orange-500' : 'bg-orange-200 dark:bg-orange-900/60'} px-2 py-0.5 rounded-lg`}>
                     <Text className={`text-[14px] font-bold ${selectedCategory === 'Premium' ? 'text-white' : 'text-orange-700 dark:text-orange-300'}`}>{premiumCount}</Text>
                  </View>
                </TouchableOpacity>

               {categories.map((c, idx) => {
                 const count = getCategoryCount(c.id);
                 const isSel = selectedCategory === c.id;
                 return (
                   <TouchableOpacity key={c.id} onPress={() => handleCategoryPress(c.id)} className={`py-4 px-5 rounded-2xl flex-row items-center justify-between border ${isSel ? 'bg-orange-600 border-orange-600' : 'bg-gray-50 dark:bg-[#1c1c1e] border-gray-200 dark:border-[#333]'}`}>
                     <View className="flex-row items-center">
                       <Ionicons name={getCategoryIcon(idx)} size={22} color={isSel ? '#fff' : (isDark ? '#9ca3af' : '#4b5563')} style={{ marginRight: 14 }} />
                       <Text className={`text-[17px] ${isSel ? 'font-black text-white' : 'font-bold text-gray-900 dark:text-white'}`}>{c.name}</Text>
                     </View>
                     <Text className={`text-[15px] font-bold ${isSel ? 'text-orange-200' : 'text-gray-500 dark:text-gray-400'}`}>{count}</Text>
                   </TouchableOpacity>
                 )
               })}
             </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
