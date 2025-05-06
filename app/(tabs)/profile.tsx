import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Modal, TextInput, Image, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import {
  Smile, Droplet, Activity, Thermometer, Settings,
  Search, Phone, Pill, Home, User
} from 'lucide-react-native';
import { Link, useRouter } from "expo-router";

export default function ProfileScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [profile, setProfile] = useState({
    fullName: '',
    contact: '',
    bloodType: '',
    email: '',
    dob: ''
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    db.runAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT,
        contact TEXT,
        bloodType TEXT,
        email TEXT,
        dob TEXT
      )
    `).then(loadProfile);
  }, []);

  const loadProfile = async () => {
    const result = await db.getAllAsync<{ fullName: string; contact: string; bloodType: string; email: string; dob: string; }>('SELECT * FROM user_profile LIMIT 1');
    if (result.length > 0) setProfile(result[0]);
  };

  const saveField = async () => {
    const updated = { ...profile, [editingField]: inputValue };
    setProfile(updated);
    const existing = await db.getAllAsync('SELECT * FROM user_profile LIMIT 1') as Array<{ id: number }>;

    if (existing.length > 0) {
      await db.runAsync(`
        UPDATE user_profile SET fullName=?, contact=?, bloodType=?, email=?, dob=? WHERE id=?
      `, [updated.fullName, updated.contact, updated.bloodType, updated.email, updated.dob, existing[0].id]);
    } else {
      await db.runAsync(`
        INSERT INTO user_profile (fullName, contact, bloodType, email, dob) VALUES (?, ?, ?, ?, ?)
      `, [updated.fullName, updated.contact, updated.bloodType, updated.email, updated.dob]);
    }

    setModalVisible(false);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Enable media permissions to upload photo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const renderField = (label: string, key: keyof typeof profile) => (
    <TouchableOpacity
      style={styles.fieldBox}
      onPress={() => {
        setEditingField(key);
        setInputValue(profile[key]);
        setModalVisible(true);
      }}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{profile[key] || 'Insert Data'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Profile</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}><Text style={{ color: '#555' }}>Add Photo</Text></View>
        )}
      </TouchableOpacity>

      {renderField('Full Name', 'fullName')}
      {renderField('Contact', 'contact')}
      {renderField('Blood Type', 'bloodType')}
      {renderField('Email', 'email')}
      {renderField('Date of Birth', 'dob')}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {editingField}</Text>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={`Enter ${editingField}`}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveField}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2196F3',
    textAlign: 'center',
    marginVertical: 16,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100, height: 100, borderRadius: 50,
  },
  placeholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  label: {
    color: '#666', fontSize: 14, fontWeight: '500',
  },
  value: {
    fontSize: 16, marginTop: 4, color: '#111',
  },
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    width: '100%', padding: 10, marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: { color: 'white', fontWeight: '600' },
  cancelText: { color: '#999', marginTop: 8 },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#2196F3', flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  navButton: { alignItems: 'center' },
  navText: { color: 'white', fontSize: 12, marginTop: 4 },
});
