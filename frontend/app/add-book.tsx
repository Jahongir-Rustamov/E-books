import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/auth-context";
import { BASE_URL, API_ENDPOINTS } from "../constants/api";
import Toast from "react-native-toast-message";

type Category = { id: number; name: string };

const MAX_CATEGORIES = 5;

export default function AddBookScreen() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const { token } = useAuth();
  const isDark = colorScheme === "dark";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [ageLimit, setAgeLimit] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [coverImage, setCoverImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [pdfFile, setPdfFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}${API_ENDPOINTS.CATEGORY_GET_ALL}`);
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {
      Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "Kategoriyalar yuklanmadi",
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((c) => c !== id);
      }
      if (prev.length >= MAX_CATEGORIES) {
        Toast.show({
          type: "info",
          text1: "Limit",
          text2: `Maksimum ${MAX_CATEGORIES} ta kategoriya tanlash mumkin`,
        });
        return prev;
      }
      return [...prev, id];
    });
  };

  const removeCategory = (id: number) => {
    setSelectedCategoryIds((prev) => prev.filter((c) => c !== id));
  };

  const pickCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Ruxsat kerak",
        text2: "Rasm tanlash uchun ruxsat bering",
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const filename = asset.uri.split("/").pop() || "cover.jpg";
      const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";
      setCoverImage({ uri: asset.uri, name: filename, type: mimeType });
    }
  };

  const pickPdfFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPdfFile({ uri: asset.uri, name: asset.name, type: "application/pdf" });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim())
      return Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "Kitob nomini kiriting",
      });
    if (!description.trim())
      return Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "Tavsif kiriting",
      });
    if (!authorName.trim())
      return Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "Muallif ismini kiriting",
      });
    if (!price.trim() || isNaN(Number(price)))
      return Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "To'g'ri narx kiriting",
      });
    const numPrice = Number(price);

    if (!(numPrice === 0 || numPrice > 6000)) {
      return Toast.show({
        type: "error",
        text1: "Noto‘g‘ri narx",
        text2: "Narx 0 yoki 6000 so‘mdan katta bo‘lishi kerak",
      });
    }
    if (selectedCategoryIds.length === 0)
      return Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "Kamida 1 ta kategoriya tanlang",
      });
    if (!coverImage)
      return Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "Muqova rasm tanlang",
      });
    if (!pdfFile)
      return Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "PDF fayl tanlang",
      });

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("price", price.trim());
      formData.append("author_name", authorName.trim());
      selectedCategoryIds.forEach((id) =>
        formData.append("categoryIds[]", String(id)),
      );
      if (ageLimit.trim()) formData.append("age_limit", ageLimit.trim());

      formData.append("cover_image", {
        uri:
          Platform.OS === "android"
            ? coverImage.uri
            : coverImage.uri.replace("file://", ""),
        name: coverImage.name,
        type: coverImage.type,
      } as any);

      formData.append("pdf_file", {
        uri:
          Platform.OS === "android"
            ? pdfFile.uri
            : pdfFile.uri.replace("file://", ""),
        name: pdfFile.name,
        type: "application/pdf",
      } as any);

      const res = await fetch(`${BASE_URL}${API_ENDPOINTS.BOOK_CREATE}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Xatolik yuz berdi",
        );
      }

      router.back();
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Muvaffaqiyatli!",
          text2: `"${title}" kitobi qo'shildi ✅`,
        });
      }, 350);
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Xatolik", text2: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: isDark ? "#1c1c1e" : "#f9fafb",
    borderColor: isDark ? "#333" : "#e5e7eb",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: isDark ? "#fff" : "#111827",
    fontSize: 15,
    marginBottom: 16,
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: "600" as const,
    color: isDark ? "#a1a1aa" : "#374151",
    marginBottom: 6,
  };

  const selectedCategoryObjects = categories.filter((c) =>
    selectedCategoryIds.includes(c.id),
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#f3f4f6" }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: isDark ? "#1c1c1e" : "#fff",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#333" : "#e5e7eb",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 8, marginLeft: -8 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: isDark ? "#fff" : "#111827",
          }}
        >
          Kitob qo'shish
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cover Image Picker */}
        <Text style={labelStyle}>Muqova rasmi *</Text>
        <TouchableOpacity
          onPress={pickCoverImage}
          style={{
            height: 180,
            borderRadius: 16,
            marginBottom: 20,
            backgroundColor: isDark ? "#1c1c1e" : "#f9fafb",
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: isDark ? "#444" : "#d1d5db",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {coverImage ? (
            <Image
              source={{ uri: coverImage.uri }}
              style={{ width: "100%", height: "100%", borderRadius: 14 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  marginBottom: 12,
                  backgroundColor: isDark ? "#2c2c2e" : "#f0f0f0",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="image-outline"
                  size={28}
                  color={isDark ? "#71717a" : "#9ca3af"}
                />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: isDark ? "#71717a" : "#6b7280",
                  marginBottom: 4,
                }}
              >
                Rasm tanlang
              </Text>
              <Text
                style={{ fontSize: 12, color: isDark ? "#52525b" : "#9ca3af" }}
              >
                JPG, PNG (Max 10MB)
              </Text>
            </View>
          )}
          {coverImage && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0,0,0,0.55)",
                borderRadius: 20,
                padding: 6,
              }}
            >
              <Ionicons name="pencil" size={14} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* PDF Picker */}
        <Text style={labelStyle}>PDF fayl *</Text>
        <TouchableOpacity
          onPress={pickPdfFile}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#1c1c1e" : "#f9fafb",
            borderRadius: 14,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: pdfFile ? "#f97316" : isDark ? "#333" : "#e5e7eb",
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              marginRight: 14,
              backgroundColor: pdfFile
                ? "#fff7ed"
                : isDark
                  ? "#2c2c2e"
                  : "#f0f0f0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={pdfFile ? "document-text" : "document-text-outline"}
              size={24}
              color={pdfFile ? "#f97316" : isDark ? "#71717a" : "#9ca3af"}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark ? "#fff" : "#111827",
                marginBottom: 2,
              }}
            >
              {pdfFile ? pdfFile.name : "PDF fayl tanlang"}
            </Text>
            <Text
              style={{ fontSize: 12, color: isDark ? "#71717a" : "#9ca3af" }}
            >
              {pdfFile ? "Tanlangan ✓" : "Faqat PDF formatida"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? "#555" : "#ccc"}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={labelStyle}>Kitob nomi *</Text>
        <TextInput
          style={inputStyle}
          placeholder="Kitob nomini kiriting"
          placeholderTextColor={isDark ? "#52525b" : "#9ca3af"}
          value={title}
          onChangeText={setTitle}
        />

        {/* Author */}
        <Text style={labelStyle}>Muallif ismi *</Text>
        <TextInput
          style={inputStyle}
          placeholder="Muallif ismi"
          placeholderTextColor={isDark ? "#52525b" : "#9ca3af"}
          value={authorName}
          onChangeText={setAuthorName}
        />

        {/* Description */}
        <Text style={labelStyle}>Tavsif *</Text>
        <TextInput
          style={[
            inputStyle,
            { height: 100, textAlignVertical: "top", paddingTop: 13 },
          ]}
          placeholder="Kitob haqida qisqacha..."
          placeholderTextColor={isDark ? "#52525b" : "#9ca3af"}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* Price & Age Limit row */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Narxi (so'm) *</Text>
            <TextInput
              style={inputStyle}
              placeholder="Min: 6,000"
              placeholderTextColor={isDark ? "#52525b" : "#9ca3af"}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <Text
              style={{
                fontSize: 11,
                color: "#f97316",
                marginTop: -10,
                marginBottom: 10,
              }}
            >
              ⚠ Minimal narx: 6,000 so'm
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>Yosh chegarasi</Text>
            <TextInput
              style={inputStyle}
              placeholder="Masalan: 12"
              placeholderTextColor={isDark ? "#52525b" : "#9ca3af"}
              value={ageLimit}
              onChangeText={setAgeLimit}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* ── Category Picker ── */}
        <Text style={labelStyle}>
          Kategoriya *{" "}
          <Text
            style={{
              color:
                selectedCategoryIds.length === MAX_CATEGORIES
                  ? "#ef4444"
                  : "#a1a1aa",
              fontWeight: "400",
            }}
          >
            ({selectedCategoryIds.length}/{MAX_CATEGORIES})
          </Text>
        </Text>

        {/* Selected category chips */}
        {selectedCategoryObjects.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 10,
            }}
          >
            {selectedCategoryObjects.map((cat) => (
              <View
                key={cat.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isDark ? "#1e1b4b" : "#eef2ff",
                  borderRadius: 20,
                  paddingVertical: 6,
                  paddingLeft: 12,
                  paddingRight: 8,
                  borderWidth: 1,
                  borderColor: "#6366f1",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#6366f1",
                    textTransform: "capitalize",
                    marginRight: 6,
                  }}
                >
                  {cat.name}
                </Text>
                <TouchableOpacity
                  onPress={() => removeCategory(cat.id)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="close-circle" size={16} color="#6366f1" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Dropdown trigger */}
        <TouchableOpacity
          onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#1c1c1e" : "#f9fafb",
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
            marginBottom: 8,
            borderWidth: 1,
            borderColor:
              selectedCategoryIds.length > 0
                ? "#6366f1"
                : isDark
                  ? "#333"
                  : "#e5e7eb",
          }}
        >
          <Ionicons
            name="layers-outline"
            size={20}
            color={
              selectedCategoryIds.length > 0
                ? "#6366f1"
                : isDark
                  ? "#71717a"
                  : "#9ca3af"
            }
            style={{ marginRight: 10 }}
          />
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              color:
                selectedCategoryIds.length > 0
                  ? isDark
                    ? "#a5b4fc"
                    : "#4f46e5"
                  : isDark
                    ? "#52525b"
                    : "#9ca3af",
            }}
          >
            {selectedCategoryIds.length > 0
              ? `${selectedCategoryIds.length} ta kategoriya tanlandi`
              : "Kategoriya tanlang"}
          </Text>
          <Ionicons
            name={showCategoryPicker ? "chevron-up" : "chevron-down"}
            size={20}
            color={isDark ? "#555" : "#ccc"}
          />
        </TouchableOpacity>

        {/* Category dropdown with scroll if > 5 */}
        {showCategoryPicker && (
          <View
            style={{
              backgroundColor: isDark ? "#1c1c1e" : "#fff",
              borderRadius: 14,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#e5e7eb",
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.25 : 0.08,
              shadowRadius: 12,
              elevation: 6,
              maxHeight: 5 * 52, // 5 items visible, rest scrollable
            }}
          >
            {loadingCategories ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator color="#6366f1" />
              </View>
            ) : categories.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text
                  style={{
                    color: isDark ? "#71717a" : "#9ca3af",
                    fontSize: 14,
                  }}
                >
                  Kategoriyalar topilmadi
                </Text>
              </View>
            ) : (
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={categories.length > 5}
                bounces={false}
              >
                {categories.map((cat, index) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  const isDisabled =
                    !isSelected && selectedCategoryIds.length >= MAX_CATEGORIES;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => toggleCategory(cat.id)}
                      activeOpacity={isDisabled ? 1 : 0.7}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderBottomWidth:
                          index < categories.length - 1 ? 1 : 0,
                        borderBottomColor: isDark ? "#2c2c2e" : "#f3f4f6",
                        backgroundColor: isSelected
                          ? isDark
                            ? "#1e1b4b"
                            : "#eef2ff"
                          : "transparent",
                        opacity: isDisabled ? 0.4 : 1,
                      }}
                    >
                      {/* Checkbox */}
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          borderWidth: 2,
                          borderColor: isSelected
                            ? "#6366f1"
                            : isDark
                              ? "#444"
                              : "#d1d5db",
                          backgroundColor: isSelected
                            ? "#6366f1"
                            : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={13} color="#fff" />
                        )}
                      </View>

                      <Text
                        style={{
                          flex: 1,
                          fontSize: 15,
                          color: isSelected
                            ? "#6366f1"
                            : isDark
                              ? "#fff"
                              : "#111827",
                          fontWeight: isSelected ? "600" : "400",
                          textTransform: "capitalize",
                        }}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={{
            backgroundColor: isSubmitting
              ? isDark
                ? "#374151"
                : "#d1d5db"
              : "#f97316",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            marginTop: 8,
            shadowColor: "#f97316",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isSubmitting ? 0 : 0.35,
            shadowRadius: 12,
            elevation: isSubmitting ? 0 : 8,
          }}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator
                color={isDark ? "#9ca3af" : "#6b7280"}
                style={{ marginRight: 10 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: isDark ? "#9ca3af" : "#6b7280",
                }}
              >
                Yuklanmoqda...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
                Kitobni saqlash
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
