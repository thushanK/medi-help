import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View, TextInput } from "react-native";
import { Text } from "react-native";
import { Link, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  Smile, Droplet, Activity, Thermometer, Settings,
  Search, Phone, Pill, Home, User
} from 'lucide-react-native';
import motivationQuotes from './motivationTalks';

export default function Screen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [currentQuote, setCurrentQuote] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        await db.runAsync(`CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fullName TEXT,
          contact TEXT,
          bloodType TEXT,
          email TEXT,
          dob TEXT
        )`);

        const existing = await db.getAllAsync<{ fullName: string }>('SELECT * FROM user_profile LIMIT 1');
        if (existing.length > 0 && existing[0]?.fullName) {
          setUserName(existing[0].fullName);
        } else {
          setUserName("Guest");
        }
      } catch (error) {
        console.error("Failed to fetch user full name:", error);
        setUserName("Guest");
      }
    };
    fetchUserName();
  }, []);

  useEffect(() => {
    const updateQuote = () => {
      const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
      setCurrentQuote(motivationQuotes[randomIndex]);
    };

    updateQuote();
    const intervalId = setInterval(updateQuote, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>Hello, {userName}!</Text>
        <View style={styles.headerIcons}>
        {/* <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/profile")}> */}
          <TouchableOpacity style={styles.iconButton}><Search size={22} color="#2196F3" onPress={() => router.replace("/settings")} /></TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}><Settings size={22} color="#2196F3"  onPress={() => router.replace("/settings")}/></TouchableOpacity>
        </View>
      </View>

      <TextInput style={styles.searchBar} placeholder="Search..." placeholderTextColor="#999" />

      <View style={styles.motivationPanel}>
        <Smile size={24} color="#2196F3" />
        <Text style={styles.motivationText}>{currentQuote}</Text>
      </View>

      <View style={styles.tilesContainer}>
        <Link href="/(tabs)/moods" asChild>
          <TouchableOpacity style={styles.tile}>
            <Smile size={32} color="white" />
            <Text style={styles.tileText}>Mood Tracking</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/fluid" asChild>
          <TouchableOpacity style={styles.tile}>
            <Droplet size={32} color="white" />
            <Text style={styles.tileText}>Fluid Tracking</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/weights" asChild>
          <TouchableOpacity style={styles.tile}>
            <Activity size={32} color="white" />
            <Text style={styles.tileText}>Weight Report</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/symptoms" asChild>
          <TouchableOpacity style={styles.tile}>
            <Thermometer size={32} color="white" />
            <Text style={styles.tileText}>Symptoms</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/contacts" asChild>
          <TouchableOpacity style={styles.tile}>
            <Phone size={32} color="white" />
            <Text style={styles.tileText}>Contacts</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/medications" asChild>
          <TouchableOpacity style={styles.tile}>
            <Pill size={32} color="white" />
            <Text style={styles.tileText}>Medication</Text>
          </TouchableOpacity>
        </Link>
      </View>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/home")}>
            <Home size={24} color="white" /><Text style={styles.navText}>Home</Text></TouchableOpacity>
  
          <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/contacts")}>
            <Phone size={24} color="white" /><Text style={styles.navText}>Contacts</Text></TouchableOpacity>
  
          <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/medications")}>
            <Pill size={24} color="white" /><Text style={styles.navText}>Meds</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/profile")}>
            <User size={24} color="white" /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
         </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 16, paddingBottom: 80, paddingTop: "15%"},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  userName: { flex: 1, fontSize: 18, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconButton: { padding: 6 },
  searchBar: {
    height: 40, backgroundColor: 'white', borderRadius: 10,
    paddingHorizontal: 16, fontSize: 14, marginBottom: 16,
    borderColor: '#ddd', borderWidth: 1,
  },
  motivationPanel: {
    backgroundColor: '#e0f2ff', borderRadius: 10, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  motivationText: {
    marginLeft: 12, fontSize: 14, color: '#1e40af', fontWeight: '500',
    flex: 1,
  },
  tilesContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 12,
  },
  tile: {
    backgroundColor: '#2196F3', width: '48%', padding: 20,
    borderRadius: 12, alignItems: 'center', marginBottom: 12,
  },
  tileText: {
    color: 'white', marginTop: 8, fontSize: 14, textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#2196F3', flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    color: 'white', fontSize: 12, marginTop: 4,
  }
});
