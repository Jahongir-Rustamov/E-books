import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export type Language = 'uz' | 'ru' | 'en';

type Translations = Record<string, Record<Language, string>>;

export const TRANSLATIONS: Translations = {
  profileTitle: { uz: 'Sahifam', ru: 'Профиль', en: 'Profile' },
  login: { uz: 'Kirish', ru: 'Войти', en: 'Login' },
  logout: { uz: 'Chiqish', ru: 'Выйти', en: 'Logout' },
  adminPage: { uz: 'Admin sahifasi', ru: 'Панель админа', en: 'Admin Page' },
  appLanguage: { uz: 'Ilova tili', ru: 'Язык приложения', en: 'App Language' },
  darkMode: { uz: 'Tungi rejim', ru: 'Ночной режим', en: 'Dark Mode' },
  terms: { uz: 'Foydalanish qoidalari', ru: 'Правила использования', en: 'Terms of Use' },
  about: { uz: 'Ilova haqida', ru: 'О приложении', en: 'About App' },
  home: { uz: 'Asosiy', ru: 'Главная', en: 'Home' },
  books: { uz: 'Kutubxona', ru: 'Библиотека', en: 'Library' },
  saved: { uz: 'Saqlanganlar', ru: 'Сохраненные', en: 'Saved' },
  createCategory: { uz: 'Kategoriya yaratish', ru: 'Создать категорию', en: 'Create Category' },
  addBook: { uz: "Kitob qo'shish", ru: 'Добавить книгу', en: 'Add Book' },
  editBooks: { uz: 'Kitoblarni tahrirlash', ru: 'Редактировать книги', en: 'Edit Books' },
  forYou: { uz: 'Siz uchun', ru: 'Для вас', en: 'For You' },
  newlyAdded: { uz: "Yangi qo'shilganlar", ru: 'Недавно добавленные', en: 'Newly Added' },
  seeAll: { uz: 'Barchasi', ru: 'Все', en: 'See All' },
  premium: { uz: 'Premium', ru: 'Премиум', en: 'Premium' },
  free: { uz: 'Bepul', ru: 'Бесплатно', en: 'Free' },
  price: { uz: 'Narxi', ru: 'Цена', en: 'Price' },
  aboutBook: { uz: 'Kitob haqida', ru: 'О книге', en: 'About Book' },
  categories: { uz: 'Kategoriyalar', ru: 'Категории', en: 'Categories' },
  downloadPdf: { uz: 'PDF yuklab olish', ru: 'Скачать PDF', en: 'Download PDF' },
  buy: { uz: 'Sotib olish', ru: 'Купить', en: 'Buy' },
  mustRead: { uz: "Albatta o'qiyman", ru: 'Обязательно прочитаю', en: 'Must Read' },
  alreadySaved: { uz: 'Saqlanganlarda bor', ru: 'Уже сохранено', en: 'Already Saved' },
  welcome: { uz: 'Xush kelibsiz', ru: 'Добро пожаловать', en: 'Welcome' },
  guest: { uz: 'Mehmon', ru: 'Гость', en: 'Guest' },
  searchPlaceholder: { uz: 'Kitob yoki muallifni qidiring...', ru: 'Поиск книги или автора...', en: 'Search book or author...' },
  noBooksYet: { uz: 'Hozircha kitoblar mavjud emas', ru: 'Пока нет книг', en: 'No books available yet' },
  unknownAuthor: { uz: "Noma'lum muallif", ru: 'Неизвестный автор', en: 'Unknown Author' },
  systemManagement: { uz: 'Tizim boshqaruvi', ru: 'Управление системой', en: 'System Management' },
  editAndDelete: { uz: "Tahrirlash va o'chirish", ru: 'Редактировать и удалять', en: 'Edit and Delete' },
  categoryName: { uz: 'Kategoriya nomi', ru: 'Название категории', en: 'Category Name' },
  newCategoryName: { uz: 'Yangi kategoriya nomi', ru: 'Новое название категории', en: 'New Category Name' },
  save: { uz: 'Saqlash', ru: 'Сохранить', en: 'Save' },
  attention: { uz: 'Diqqat!', ru: 'Внимание!', en: 'Attention!' },
  categoryWarning: { uz: "Kategoriya nomi to'g'riligiga ishonch komil qiling. Aks holda uni o'chirish yoki o'zgartirish ilojsiz.", ru: 'Убедитесь в правильности названия категории. Иначе ее невозможно удалить или изменить.', en: 'Ensure the category name is correct. Otherwise, it cannot be deleted or changed.' },
  enteredName: { uz: 'Kiritilgan nom: ', ru: 'Введенное имя: ', en: 'Entered name: ' },
  cancel: { uz: 'Rad etish', ru: 'Отмена', en: 'Cancel' },
  confirm: { uz: 'Tasdiqlash', ru: 'Подтвердить', en: 'Confirm' },
  manageBooks: { uz: 'Kitoblarni boshqarish', ru: 'Управление книгами', en: 'Manage Books' },
  noBooksYetAdmin: { uz: 'Kitoblar mavjud emas', ru: 'Нет доступных книг', en: 'No books available' },
  addBookFirst: { uz: "Avval kitob qo'shing", ru: 'Сначала добавьте книгу', en: 'Add a book first' },
  editBook: { uz: 'Kitobni tahrirlash', ru: 'Редактировать книгу', en: 'Edit Book' },
  editing: { uz: 'Tahrirlash:', ru: 'Редактирование:', en: 'Editing:' },
  bookNameReq: { uz: 'Kitob nomi *', ru: 'Название книги *', en: 'Book Name *' },
  bookNamePlace: { uz: 'Kitob nomini kiriting', ru: 'Введите название книги', en: 'Enter book name' },
  authorReq: { uz: 'Muallif *', ru: 'Автор *', en: 'Author *' },
  authorPlace: { uz: 'Muallif ismi', ru: 'Имя автора', en: 'Author name' },
  description: { uz: 'Tavsif', ru: 'Описание', en: 'Description' },
  descriptionPlace: { uz: 'Kitob haqida...', ru: 'О книге...', en: 'About the book...' },
  priceInSom: { uz: "Narxi (so'm)", ru: 'Цена (сум)', en: 'Price (som)' },
  ageLimit: { uz: 'Yosh chegarasi', ru: 'Возрастное ограничение', en: 'Age Limit' },
  editInfoNote: { uz: "Muqova rasm va PDF faylni o'zgartirish uchun yangi kitob yaratish lozim", ru: 'Чтобы изменить обложку и PDF-файл, нужно создать новую книгу', en: 'To change the cover image and PDF file, you need to create a new book' },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof TRANSLATIONS) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('uz');

  useEffect(() => {
    SecureStore.getItemAsync('app_language').then((savedLang) => {
      if (savedLang && ['uz', 'ru', 'en'].includes(savedLang)) {
        setLanguageState(savedLang as Language);
      }
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await SecureStore.setItemAsync('app_language', lang);
  };

  const t = (key: keyof typeof TRANSLATIONS) => {
    return TRANSLATIONS[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
