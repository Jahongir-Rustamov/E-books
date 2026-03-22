import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useLanguage } from '../context/language-context';

export default function TermsScreen() {
  const { t } = useLanguage();
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-[#1c1c1e] border-b border-gray-200 dark:border-[#333]">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">{t('terms')}</Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerClassName="p-4">
        <View className="mb-5 items-center">
          <Text className="text-[13px] text-gray-500 font-semibold tracking-widest uppercase">Foydalanuvchi Qo'llanmasi</Text>
        </View>

        <View className="bg-white dark:bg-[#1c1c1e] rounded-xl p-4 mb-3 border border-gray-200 dark:border-[#333]">
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-2">1. Kutubxona va Mutolaa</Text>
          <Text className="text-[14px] leading-relaxed text-gray-600 dark:text-white/75 text-left">
            Foydalanuvchilar ilovada taqdim etilgan elektron kitoblarni istalgan vaqtda o'qishlari mumkin. O'zingizga yoqqan kitoblarni "Saqlanganlar" (Javon) qismiga qo'shib, shaxsiy kolleksiyangizni bepul shakllantirish imkoniyati mavjud.
          </Text>
        </View>

        <View className="bg-white dark:bg-[#1c1c1e] rounded-xl p-4 mb-3 border border-gray-200 dark:border-[#333]">
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-2">2. Xaridlar va Cheklovlar</Text>
          <Text className="text-[14px] leading-relaxed text-gray-600 dark:text-white/75 text-left">
            Platformadagi barcha Premium kitoblar elektron xarid orqali umrbod profilingizga biriktiriladi. Sotib olingan kitoblarni nusxalash, tarqatish yoki uchinchi shaxslarga tijorat maqsadida berish qat'iyan taqiqlanadi hamda intellektual mulk himoyasiga olinadi.
          </Text>
        </View>

        <View className="bg-white dark:bg-[#1c1c1e] rounded-xl p-4 mb-3 border border-gray-200 dark:border-[#333]">
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-2">3. Profil Sozlamalari</Text>
          <Text className="text-[14px] leading-relaxed text-gray-600 dark:text-white/75 text-left">
            Shaxsiy ekraningiz ("Sahifam") orqali ilova tilini (O'zbek, Rus, Ingliz) va ko'rinish rejimini (Tungi/Kunduzgi rejim) almashtirishingiz mumkin. Ro'yxatdan o'tgan userlar xaridlar statistikasini kuzatib boradi.
          </Text>
        </View>
        
        <View className="items-center p-5 bg-gray-100 dark:bg-gray-900 rounded-xl mt-2">
          <Text className="text-base font-bold text-gray-900 dark:text-white mb-1">Savollaringiz bormi?</Text>
          <Text className="text-[13px] text-gray-500 text-center px-4 leading-relaxed">Biz bilan bog'lanish uchun ijtimoiy tarmoqlarimiz orqali yozishingiz mumkin.</Text>
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
