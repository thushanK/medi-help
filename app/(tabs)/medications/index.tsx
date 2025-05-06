// import React, { useEffect, useState } from 'react';
// import {
//   SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Modal,
//   TextInput, ScrollView, FlatList, Alert
// } from 'react-native';
// import { useSQLiteContext } from 'expo-sqlite';
// import * as Print from 'expo-print';
// import * as Sharing from 'expo-sharing';
// import { Calendar } from 'react-native-calendars';

// export default function MedicationScreen() {
//   const db = useSQLiteContext();
//   const [medications, setMedications] = useState<any[]>([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [name, setName] = useState('');
//   const [amount, setAmount] = useState('');
//   const [newTime, setNewTime] = useState('');
//   const [times, setTimes] = useState<string[]>([]);
//   const [period, setPeriod] = useState('');
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [selectedDateRange, setSelectedDateRange] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [selectedColor, setSelectedColor] = useState('#2196F3');
//   const colorOptions = ['#2196F3', '#E91E63', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#FFEB3B', '#795548', '#607D8B'];

//   useEffect(() => {
//     db.runAsync(`
//       CREATE TABLE IF NOT EXISTS medications (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT,
//         amount TEXT,
//         times TEXT,
//         period TEXT,
//         color TEXT
//       )
//     `).then(fetchMedications);
//   }, []);

//   const fetchMedications = async () => {
//     const result = await db.getAllAsync('SELECT * FROM medications');
//     setMedications(result);
//   };

//   const resetForm = () => {
//     setName('');
//     setAmount('');
//     setNewTime('');
//     setTimes([]);
//     setPeriod('');
//     setEditingId(null);
//     setSelectedColor('#2196F3');
//     setSelectedDateRange({ start: null, end: null });
//   };

//   const saveMedication = async () => {
//     if (!name || !amount || times.length === 0 || !period) {
//       Alert.alert('Please fill all fields');
//       return;
//     }
//     const timeStr = times.join(', ');
//     if (editingId !== null) {
//       await db.runAsync(
//         'UPDATE medications SET name=?, amount=?, times=?, period=?, color=? WHERE id=?',
//         name, amount, timeStr, period, selectedColor, editingId
//       );
//     } else {
//       await db.runAsync(
//         'INSERT INTO medications (name, amount, times, period, color) VALUES (?, ?, ?, ?, ?)',
//         name, amount, timeStr, period, selectedColor
//       );
//     }
//     resetForm();
//     setModalVisible(false);
//     fetchMedications();
//   };

//   const editMedication = (item: any) => {
//     setName(item.name);
//     setAmount(item.amount);
//     setTimes(item.times.split(', '));
//     setPeriod(item.period);
//     setSelectedColor(item.color);
//     setEditingId(item.id);
//     setModalVisible(true);
//   };

//   const deleteMedication = async (id: number) => {
//     Alert.alert('Delete', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete', style: 'destructive', onPress: async () => {
//           await db.runAsync('DELETE FROM medications WHERE id = ?', id);
//           fetchMedications();
//         }
//       }
//     ]);
//   };

//   const addTimeManually = () => {
//     if (newTime.trim()) {
//       setTimes([...times, newTime.trim()]);
//       setNewTime('');
//     }
//   };

//   const handleCalendarSelect = (day: any) => {
//     const date = day.dateString;
//     if (!selectedDateRange.start || (selectedDateRange.start && selectedDateRange.end)) {
//       setSelectedDateRange({ start: date, end: null });
//     } else {
//       const start = selectedDateRange.start;
//       const end = date;
//       setSelectedDateRange({ start, end });
//       setPeriod(`${start} to ${end}`);
//       setShowCalendar(false);
//     }
//   };

//   const getMarkedDates = () => {
//     const marked: any = {};
//     const start = selectedDateRange.start;
//     const end = selectedDateRange.end;
//     if (start && !end) {
//       marked[start] = { startingDay: true, color: '#2196F3', textColor: 'white' };
//     } else if (start && end) {
//       const startDate = new Date(start);
//       const endDate = new Date(end);
//       for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//         const dateStr = d.toISOString().split('T')[0];
//         marked[dateStr] = {
//           color: '#2196F3',
//           textColor: 'white',
//           startingDay: dateStr === start,
//           endingDay: dateStr === end,
//         };
//       }
//     }
//     return marked;
//   };

//   const generatePDF = async () => {
//     const rows = medications.map((entry, i) => `
//       <tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
//         <td>${entry.name}</td>
//         <td>${entry.amount}</td>
//         <td>${entry.times}</td>
//         <td>${entry.period}</td>
//       </tr>
//     `).join('');

//     const html = `
//       <html><head><style>
//         h1 { text-align: center; color: #2196F3; }
//         table { width: 100%; border-collapse: collapse; }
//         th, td { border: 1px solid #ddd; padding: 8px; }
//         th { background-color: #2196F3; color: white; }
//       </style></head><body>
//       <h1>Medication Report</h1>
//       <table><thead><tr><th>Name</th><th>Amount</th><th>Times</th><th>Period</th></tr></thead>
//       <tbody>${rows}</tbody></table></body></html>
//     `;
//     const { uri } = await Print.printToFileAsync({ html });
//     await Sharing.shareAsync(uri);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>All Medications</Text>

//       <FlatList
//         data={medications}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View style={[styles.medItem, { borderLeftColor: item.color }]}>...</View>
//         )}
//         ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No medications found.</Text>}
//       />

//       <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setModalVisible(true); }}>
//         <Text style={styles.addButtonText}>Add Medication</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
//         <Text style={styles.pdfButtonText}>Download PDF</Text>
//       </TouchableOpacity>

//       <Modal visible={modalVisible} animationType="slide" transparent>
//         <View style={styles.modalContainer}>
//           <ScrollView contentContainerStyle={{ backgroundColor: '#fff', padding: 20, borderRadius: 10 }}>
//             <TextInput placeholder="Medication Name" value={name} onChangeText={setName} style={styles.input} />
//             <TextInput placeholder="Amount (mg)" value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" />

//             <View style={{ flexDirection: 'row' }}>
//               <TextInput
//                 placeholder="Enter time (HH:mm)"
//                 value={newTime}
//                 onChangeText={setNewTime}
//                 style={[styles.input, { flex: 1 }]}
//               />
//               <TouchableOpacity style={[styles.addButton, { paddingHorizontal: 10, marginLeft: 10 }]} onPress={addTimeManually}>
//                 <Text style={styles.addButtonText}>+</Text>
//               </TouchableOpacity>
//             </View>
//             {times.map((t, i) => <Text key={i} style={{ marginVertical: 2 }}>• {t}</Text>)}

//             <Text style={{ marginVertical: 10, fontWeight: 'bold' }}>Select Color</Text>
//             <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
//               {colorOptions.map((color) => (
//                 <TouchableOpacity
//                   key={color}
//                   onPress={() => setSelectedColor(color)}
//                   style={{
//                     backgroundColor: color,
//                     width: 30,
//                     height: 30,
//                     borderRadius: 15,
//                     margin: 5,
//                     borderWidth: selectedColor === color ? 3 : 1,
//                     borderColor: selectedColor === color ? '#000' : '#ccc',
//                   }}
//                 />
//               ))}
//             </View>

//             <TouchableOpacity style={styles.addButton} onPress={() => setShowCalendar(true)}>
//               <Text style={styles.addButtonText}>Select Period</Text>
//             </TouchableOpacity>
//             <Text style={{ marginBottom: 10 }}>Selected Period: {period}</Text>

//             <TouchableOpacity style={styles.saveButton} onPress={saveMedication}>
//               <Text style={styles.saveButtonText}>Save</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </View>
//       </Modal>

//       {showCalendar && (
//         <Modal visible={showCalendar} transparent>
//           <View style={styles.modalContainer}>
//             <View style={{ backgroundColor: '#fff', margin: 20, padding: 10, borderRadius: 10 }}>
//               <Calendar
//                 markingType="period"
//                 markedDates={getMarkedDates()}
//                 onDayPress={handleCalendarSelect}
//               />
//               <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.cancelButton}>
//                 <Text style={styles.cancelButtonText}>Close Calendar</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}
//     </SafeAreaView>
//   );
// }
// // ...[existing component code above]...

// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       padding: 16,
//       backgroundColor: '#fff',
//     },
//     title: {
//       fontSize: 22,
//       fontWeight: 'bold',
//       color: '#2196F3',
//       marginBottom: 16,
//       textAlign: 'center',
//     },
//     medItem: {
//       flexDirection: 'row',
//       borderLeftWidth: 5,
//       padding: 12,
//       marginVertical: 8,
//       backgroundColor: '#f0f4f8',
//       borderRadius: 8,
//       alignItems: 'center',
//     },
//     medName: {
//       fontWeight: 'bold',
//       fontSize: 16,
//       marginBottom: 4,
//     },
//     medDetail: {
//       fontSize: 14,
//       color: '#555',
//     },
//     edit: {
//       color: '#2196F3',
//       padding: 6,
//       fontWeight: 'bold',
//     },
//     delete: {
//       color: 'red',
//       padding: 6,
//       fontWeight: 'bold',
//     },
//     addButton: {
//       backgroundColor: '#2196F3',
//       padding: 14,
//       borderRadius: 8,
//       alignItems: 'center',
//       marginTop: 16,
//     },
//     addButtonText: {
//       color: '#fff',
//       fontWeight: 'bold',
//       fontSize: 16,
//     },
//     pdfButton: {
//       backgroundColor: '#E3F2FD',
//       padding: 14,
//       borderRadius: 8,
//       alignItems: 'center',
//       marginTop: 10,
//     },
//     pdfButtonText: {
//       color: '#2196F3',
//       fontWeight: '600',
//       fontSize: 15,
//     },
//     modalContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       backgroundColor: 'rgba(0,0,0,0.4)',
//       padding: 20,
//     },
//     input: {
//       borderBottomWidth: 1,
//       borderColor: '#ccc',
//       marginBottom: 16,
//       paddingVertical: 8,
//       fontSize: 16,
//     },
//     saveButton: {
//       backgroundColor: '#2196F3',
//       padding: 14,
//       borderRadius: 8,
//       alignItems: 'center',
//       marginTop: 20,
//     },
//     saveButtonText: {
//       color: '#fff',
//       fontWeight: 'bold',
//       fontSize: 16,
//     },
//     cancelButton: {
//       backgroundColor: '#ccc',
//       padding: 14,
//       borderRadius: 8,
//       alignItems: 'center',
//       marginTop: 10,
//     },
//     cancelButtonText: {
//       color: '#fff',
//       fontWeight: 'bold',
//       fontSize: 16,
//     },
//   });
  