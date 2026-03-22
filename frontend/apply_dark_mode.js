const fs = require('fs');
const path = require('path');

const targetFiles = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/books.tsx',
  'app/(tabs)/saved.tsx',
  'app/book-detail.tsx',
];

const classMap = {
  'bg-white': 'bg-white dark:bg-black',
  'bg-gray-50': 'bg-gray-50 dark:bg-[#121212]',
  'bg-gray-100': 'bg-gray-100 dark:bg-[#1c1c1e]',
  'bg-gray-200': 'bg-gray-200 dark:bg-[#2c2c2e]',
  'text-gray-900': 'text-gray-900 dark:text-white',
  'text-gray-800': 'text-gray-800 dark:text-gray-100',
  'text-gray-700': 'text-gray-700 dark:text-gray-200',
  'text-gray-600': 'text-gray-600 dark:text-gray-300',
  'text-gray-500': 'text-gray-500 dark:text-gray-400',
  'border-gray-200': 'border-gray-200 dark:border-[#333]',
  'border-gray-100': 'border-gray-100 dark:border-[#222]',
};

// Hardcoded text replacements for Translations
const textMap = [
  { search: />Siz uchun</g, replace: '>{t("forYou")}<' },
  { search: />Yangi qo\'shilganlar</g, replace: '>{t("newlyAdded")}<' },
  { search: />Kutubxona</g, replace: '>{t("books")}<' },
  { search: />Barchasi</g, replace: '>{t("seeAll")}<' },
  { search: />Saqlanganlar</g, replace: '>{t("saved")}<' },
  { search: />Premium kitoblar</g, replace: '>{t("premium")} {t("books").toLowerCase()}<' },
  { search: />Noma\'lum muallif</g, replace: '>{t("unknownAuthor")}<' },
  { search: />Narxi</g, replace: '>{t("price")}<' },
  { search: />Bepul</g, replace: '>{t("free")}<' },
  { search: />Kitob topilmadi</g, replace: '>{t("noBooksYet")}<' },
  { search: />PDF yuklab olish</g, replace: '>{t("downloadPdf")}<' },
  { search: />Albatta o\'qiyman</g, replace: '>{t("mustRead")}<' },
  { search: />Saqlanganlarda bor</g, replace: '>{t("alreadySaved")}<' },
];

targetFiles.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Insert translation hook if needed
  if (!content.includes('useLanguage')) {
    content = content.replace(
      'import { useAuth } from',
      "import { useLanguage } from '../../context/language-context';\nimport { useAuth } from"
    );
    // Also might be a level up
    content = content.replace(
      "import { useAuth } from '../context/auth-context';",
      "import { useLanguage } from '../context/language-context';\nimport { useAuth } from '../context/auth-context';"
    );
  }

  // Insert useColorScheme
  if (!content.includes('useColorScheme')) {
    content = content.replace(
      "import { useFocusEffect",
      "import { useColorScheme } from 'nativewind';\nimport { useFocusEffect"
    );
    content = content.replace(
      "import { useLocalSearchParams",
      "import { useColorScheme } from 'nativewind';\nimport { useLocalSearchParams"
    );
  }

  // Inside the component, add hook calls
  const compRegex = /export default function [a-zA-Z]+\(\) \{/;
  if (compRegex.test(content) && !content.includes('const { t } = useLanguage()')) {
    content = content.replace(compRegex, (match) => {
      return `${match}\n  const { t } = useLanguage();\n  const { colorScheme } = useColorScheme();\n  const isDark = colorScheme === 'dark';`;
    });
  }

  // Apply dark mode classes
  // We look for className="..." and inject if not present
  Object.keys(classMap).forEach(key => {
    // Note: this is rudimentary. It will replace it if the key is inside className
    const val = classMap[key];
    const regex = new RegExp(`className="([^"]*?\\b${key}\\b[^"]*?)"`, 'g');
    content = content.replace(regex, (match, p1) => {
      if (p1.includes(val)) return match; // Already there
      return `className="${p1.replace(key, val)}"`;
    });
  });

  // Also replace color in style props conditionally, e.g., color="#3b82f6" -> color={isDark ? '#60a5fa' : '#3b82f6'} if needed, but Tailwind is better.

  // Apply translation mappings
  textMap.forEach(tm => {
    content = content.replace(tm.search, tm.replace);
  });

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Processed', relPath);
});
