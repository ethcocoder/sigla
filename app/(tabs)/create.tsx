import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@/components/ionicons";

const cities = [
  "Addis Ababa",
  "Adama - Bishoftu",
  "Bahir Dar",
  "Dessie - Kombolcha",
  "Dire Dawa - Harar",
  "Gondar",
  "Hawassa - Shashemene",
  "Jijiga",
  "Jimma",
  "Mekele",
];

export default function CreateScreen() {
  const [city, setCity] = useState("");
  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <Text style={styles.topbarTitle}>POST</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Where are you posting from?</Text>
        <Text style={styles.subtitle}>
          Select your city so nearby farmers and suppliers can find your
          agricultural listing.
        </Text>
        <View style={styles.cityCard}>
          {cities.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCity(item)}
              style={styles.cityRow}
            >
              <View style={[styles.radio, city === item && styles.radioActive]}>
                {city === item ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={styles.cityText}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          disabled={!city}
          onPress={() =>
            router.push({ pathname: "/post/new", params: { city } })
          }
          style={[styles.next, !city && styles.nextDisabled]}
        >
          <Text style={styles.nextText}>NEXT</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  topbar: {
    height: 74,
    backgroundColor: "#4F8B2A",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 15,
  },
  topbarTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  content: { padding: 20, paddingBottom: 40 },
  title: {
    color: "#222222",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
  },
  subtitle: {
    color: "#6A7177",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  cityCard: { borderTopWidth: 1, borderTopColor: "#ECEFF1" },
  cityRow: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  radio: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#80868B",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: "#4F8B2A" },
  radioDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#4F8B2A",
  },
  cityText: { color: "#2C3135", fontSize: 16 },
  next: {
    alignSelf: "center",
    minWidth: 132,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: "#4F8B2A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 25,
  },
  nextDisabled: { backgroundColor: "#BFC6CC" },
  nextText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
});
