import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, RefreshControl,
  Alert, Modal, TextInput, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/auth-context';
import { BASE_URL } from '../constants/api';
import Toast from 'react-native-toast-message';
import { useLanguage } from '../context/language-context';

export default function EditBooksScreen() {
  const { t } = useLanguage();
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const { token } = useAuth();
  const isDark = colorScheme === 'dark';

  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const displayedBooks = books.filter(b =>
    (b.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (b.author_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editAgeLimit, setEditAgeLimit] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBooks = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/books/get-all-books`);
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Error fetching books:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchBooks(); }, [fetchBooks]));

  const onRefresh = () => { setRefreshing(true); fetchBooks(false); };

  const openEditModal = (book: any) => {
    setEditingBook(book);
    setEditTitle(book.title || '');
    setEditAuthor(book.author_name || '');
    setEditDescription(book.description || '');
    setEditPrice(book.price?.toString() || '0');
    setEditAgeLimit(book.age_limit?.toString() || '');
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return Toast.show({ type: 'error', text1: 'Xatolik', text2: 'Kitob nomini kiriting' });
    if (!editAuthor.trim()) return Toast.show({ type: 'error', text1: 'Xatolik', text2: 'Muallif ismini kiriting' });
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/books/update-book/${editingBook.id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          author_name: editAuthor.trim(),
          description: editDescription.trim(),
          price: parseFloat(editPrice) || 0,
          age_limit: editAgeLimit.trim() ? parseInt(editAgeLimit) : null,
        }),
      });
      if (res.ok) {
        setEditModal(false);
        fetchBooks(false);
        Toast.show({ type: 'success', text1: 'Yangilandi ✅', text2: `"${editTitle}" kitobi yangilandi` });
      } else {
        const data = await res.json();
        Toast.show({ type: 'error', text1: 'Xatolik', text2: data.message || 'Yangilashda xatolik' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Xatolik', text2: 'Serverga ulanib bo\'lmadi' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (book: any) => {
    Alert.alert(
      'Kitobni o\'chirish',
      `"${book.title}" kitobini o'chirmoqchimisiz?\nBu amal qaytarib bo'lmaydi!`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Ha, o\'chirish', style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${BASE_URL}/books/delete-book/${book.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
              });
              if (res.ok) {
                setBooks(prev => prev.filter(b => b.id !== book.id));
                Toast.show({ type: 'success', text1: 'O\'chirildi', text2: `"${book.title}" o'chirildi` });
              } else {
                const data = await res.json();
                Toast.show({ type: 'error', text1: 'Xatolik', text2: data.message || 'O\'chirishda xatolik' });
              }
            } catch {
              Toast.show({ type: 'error', text1: 'Xatolik', text2: 'Serverga ulanib bo\'lmadi' });
            }
          }
        }
      ]
    );
  };

  const bg = isDark ? '#000' : '#f3f4f6';
  const cardBg = isDark ? '#1c1c1e' : '#fff';
  const border = isDark ? '#2c2c2e' : '#e5e7eb';
  const textPrimary = isDark ? '#fff' : '#111827';
  const textSecondary = isDark ? '#a1a1aa' : '#6b7280';

  const renderBook = ({ item }: { item: any }) => {
    const isPremium = parseFloat(item.price || '0') > 0;
    const categories: string[] = item.bookCategories?.map((bc: any) => bc.category?.name).filter(Boolean) || [];

    return (
      <View
        style={{ backgroundColor: cardBg, borderColor: border, borderWidth: 1 }}
        className="flex-row mx-4 mb-3 rounded-2xl overflow-hidden"
        // subtle shadow
      >
        {/* Cover */}
        <View style={{ width: 86, height: 116, backgroundColor: isDark ? '#2c2c2e' : '#f3f4f6' }}>
          {item.cover_image ? (
            <Image source={{ uri: item.cover_image }} style={{ width: 86, height: 116 }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="book-outline" size={28} color="#3b82f6" />
            </View>
          )}
          {/* Premium overlay */}
          {isPremium && (
            <View style={{ position: 'absolute', top: 6, left: 6, backgroundColor: '#f97316', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <FontAwesome5 name="crown" size={8} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>Pro</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '800', lineHeight: 20, marginBottom: 3 }} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={{ color: textSecondary, fontSize: 12, fontWeight: '500', marginBottom: 6 }} numberOfLines={1}>
              {item.author_name || t('unknownAuthor')}
            </Text>
            {categories.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                {categories.slice(0, 2).map((cat, i) => (
                  <View key={i} style={{ backgroundColor: isDark ? '#1e1b4b' : '#eef2ff', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: '#6366f1', fontSize: 10, fontWeight: '600' }}>{cat}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: isPremium ? '#ea580c' : '#16a34a', fontSize: 13, fontWeight: '700' }}>
              {isPremium ? `${parseFloat(item.price).toLocaleString()} so'm` : t('free')}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={{ justifyContent: 'center', alignItems: 'center', paddingRight: 12, gap: 8 }}>
          <TouchableOpacity
            onPress={() => openEditModal(item)}
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isDark ? '#1e3a5f' : '#eff6ff', borderWidth: 1, borderColor: isDark ? '#2563eb' : '#bfdbfe', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="pencil" size={17} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isDark ? '#3f1212' : '#fef2f2', borderWidth: 1, borderColor: isDark ? '#dc2626' : '#fecaca', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="trash-outline" size={17} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: cardBg, borderBottomWidth: 1, borderBottomColor: border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111827'} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: textPrimary }}>{t('manageBooks')}</Text>
          {books.length > 0 && (
            <Text style={{ fontSize: 12, color: textSecondary, fontWeight: '500', marginTop: 1 }}>
              {books.length} {t('books').toLowerCase()}
            </Text>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: cardBg, borderBottomWidth: 1, borderBottomColor: border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: bg, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: border }}>
          <Ionicons name="search" size={20} color={textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            style={{ flex: 1, color: textPrimary, fontSize: 15 }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color={textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Skeleton */}
      {loading ? (
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={{ flexDirection: 'row', backgroundColor: cardBg, borderRadius: 16, overflow: 'hidden', height: 116, borderWidth: 1, borderColor: border }}>
              <View style={{ width: 86, backgroundColor: isDark ? '#2c2c2e' : '#e5e7eb' }} />
              <View style={{ flex: 1, padding: 12, gap: 8 }}>
                <View style={{ height: 14, backgroundColor: isDark ? '#2c2c2e' : '#e5e7eb', borderRadius: 6, width: '75%' }} />
                <View style={{ height: 11, backgroundColor: isDark ? '#2c2c2e' : '#e5e7eb', borderRadius: 6, width: '50%' }} />
                <View style={{ height: 10, backgroundColor: isDark ? '#2c2c2e' : '#e5e7eb', borderRadius: 6, width: '30%' }} />
              </View>
              <View style={{ width: 62, justifyContent: 'center', alignItems: 'center', gap: 8, paddingRight: 12 }}>
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isDark ? '#2c2c2e' : '#e5e7eb' }} />
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isDark ? '#2c2c2e' : '#e5e7eb' }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={displayedBooks}
          keyExtractor={item => item.id.toString()}
          renderItem={renderBook}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} tintColor={isDark ? '#818cf8' : '#6366f1'} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 80 }}>
              <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: isDark ? '#1c1c1e' : '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="library-outline" size={40} color={isDark ? '#3f3f46' : '#d1d5db'} />
              </View>
              <Text style={{ color: textSecondary, fontSize: 16, fontWeight: '700' }}>{t('noBooksYetAdmin')}</Text>
              <Text style={{ color: isDark ? '#52525b' : '#9ca3af', fontSize: 13, marginTop: 6 }}>{t('addBookFirst')}</Text>
            </View>
          }
        />
      )}

      {/* ── Edit Modal ── */}
      <Modal visible={editModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }} edges={['top']}>

            {/* Modal Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: border }}>
              <TouchableOpacity
                onPress={() => setEditModal(false)}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: isDark ? '#1c1c1e' : '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="close" size={22} color={isDark ? '#fff' : '#374151'} />
              </TouchableOpacity>
              <Text style={{ fontSize: 17, fontWeight: '800', color: textPrimary }}>{t('editBook')}</Text>
              <TouchableOpacity
                onPress={handleSaveEdit}
                disabled={saving}
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: saving ? (isDark ? '#374151' : '#d1d5db') : '#f97316' }}
              >
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{t('save')}</Text>}
              </TouchableOpacity>
            </View>

            {/* Book preview strip */}
            {editingBook && (
              <View style={{ flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: isDark ? '#1c1c1e' : '#f9fafb', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: border }}>
                <View style={{ width: 48, height: 64, borderRadius: 8, overflow: 'hidden', marginRight: 12, backgroundColor: isDark ? '#2c2c2e' : '#e5e7eb' }}>
                  {editingBook.cover_image && (
                    <Image source={{ uri: editingBook.cover_image }} style={{ width: 48, height: 64 }} resizeMode="cover" />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: isDark ? '#a1a1aa' : '#6b7280', fontSize: 11, fontWeight: '600', marginBottom: 2 }}>{t('editing')}</Text>
                  <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '800' }} numberOfLines={1}>{editingBook.title}</Text>
                </View>
              </View>
            )}

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

              {/* Title */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('bookNameReq')}</Text>
              <TextInput
                value={editTitle} onChangeText={setEditTitle}
                placeholder={t('bookNamePlace')}
                placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                style={{ backgroundColor: isDark ? '#1c1c1e' : '#f9fafb', borderColor: border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, color: textPrimary, fontSize: 15, marginBottom: 16 }}
              />

              {/* Author */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('authorReq')}</Text>
              <TextInput
                value={editAuthor} onChangeText={setEditAuthor}
                placeholder={t('authorPlace')}
                placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                style={{ backgroundColor: isDark ? '#1c1c1e' : '#f9fafb', borderColor: border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, color: textPrimary, fontSize: 15, marginBottom: 16 }}
              />

              {/* Description */}
              <Text style={{ fontSize: 12, fontWeight: '600', color: textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('description')}</Text>
              <TextInput
                value={editDescription} onChangeText={setEditDescription}
                placeholder={t('descriptionPlace')}
                placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                multiline numberOfLines={4}
                style={{ backgroundColor: isDark ? '#1c1c1e' : '#f9fafb', borderColor: border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingTop: 13, color: textPrimary, fontSize: 15, height: 100, textAlignVertical: 'top', marginBottom: 16 }}
              />

              {/* Price & Age row */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('priceInSom')}</Text>
                  <TextInput
                    value={editPrice} onChangeText={setEditPrice}
                    placeholder="0" keyboardType="numeric"
                    placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                    style={{ backgroundColor: isDark ? '#1c1c1e' : '#f9fafb', borderColor: border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, color: textPrimary, fontSize: 15 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('ageLimit')}</Text>
                  <TextInput
                    value={editAgeLimit} onChangeText={setEditAgeLimit}
                    placeholder="16" keyboardType="numeric"
                    placeholderTextColor={isDark ? '#52525b' : '#9ca3af'}
                    style={{ backgroundColor: isDark ? '#1c1c1e' : '#f9fafb', borderColor: border, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, color: textPrimary, fontSize: 15 }}
                  />
                </View>
              </View>

              {/* Info note */}
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e1b4b' : '#eef2ff', borderRadius: 14, padding: 14, marginTop: 20, borderWidth: 1, borderColor: isDark ? '#312e81' : '#c7d2fe' }}>
                <Ionicons name="information-circle-outline" size={18} color="#6366f1" style={{ marginRight: 10 }} />
                <Text style={{ color: '#6366f1', fontSize: 13, fontWeight: '500', flex: 1, lineHeight: 18 }}>
                  {t('editInfoNote')}
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
