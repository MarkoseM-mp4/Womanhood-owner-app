import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createOrder, updateOrderWithImage } from '../src/api';
import { COLORS, SHADOWS } from '../src/theme';

export default function AddOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    Alert.alert('Add Photo', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera access is required');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.3,
          });
          if (!result.canceled) {
            setImage(result.assets[0]);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Gallery access is required');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.3,
          });
          if (!result.canceled) {
            setImage(result.assets[0]);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim() || !serialNo.trim() || !phoneNo.trim()) {
      Alert.alert('Missing Fields', 'Please fill in the Name, Serial No, and Phone Number.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dDate = new Date(dueDate);
    dDate.setHours(0, 0, 0, 0);
    if (dDate < today) {
      Alert.alert('Invalid Date', 'Delivery due date cannot be before the received date.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('customerName', name.trim());
      formData.append('serialNumber', serialNo.trim());
      formData.append('phoneNumber', phoneNo.trim());
      formData.append('deliveryDueDate', dueDate.toISOString());
      formData.append('notes', notes.trim());

      // 1. Instantly create the core order data (lightning fast)
      const res = await createOrder(formData);
      const newOrderId = res.data.order._id;

      // 2. Optimistically return to the Home screen for an instant UX feel
      router.back();

      // 3. Asynchronously upload the image in the background if selected
      if (image) {
        const ext = image.uri.split('.').pop() || 'jpg';
        const photoData = new FormData();
        photoData.append('clothPhoto', {
          uri: image.uri,
          type: `image/${ext}`,
          name: `cloth_${Date.now()}.${ext}`,
        });

        // Fire and forget: this continues in the background
        updateOrderWithImage(newOrderId, photoData).catch((err) => {
          console.error('Background image upload failed:', err);
          // Optional: we could alert the user here if we really wanted to, 
          // but silent failure is usually better for background tasks
        });
      }

    } catch (err) {
      setSaving(false);
      const msg = err.response?.data?.message || 'Failed to create order. Please try again.';
      Alert.alert('Error', msg);
    }
  };

  const formatDate = (date) =>
    date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Order</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <TouchableOpacity style={styles.photoArea} onPress={pickImage} activeOpacity={0.85}>
            {image ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: image.uri }} style={styles.photoPreview} />
                <View style={styles.photoOverlay}>
                  <Text style={styles.photoOverlayText}>Tap to change photo</Text>
                </View>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoText}>Upload Reference Photo</Text>
                <Text style={styles.photoSubText}>JPEG, PNG up to 10MB</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Serial Number</Text>
            <TextInput
              style={styles.input}
              value={serialNo}
              onChangeText={setSerialNo}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNo}
              onChangeText={setPhoneNo}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date Received</Text>
            <View style={[styles.input, styles.datePickerBtn]}>
              <Text style={styles.datePickerText}>{formatDate(new Date())}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Due Date</Text>
            <TouchableOpacity
              style={[styles.input, styles.datePickerBtn]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.datePickerText}>{formatDate(dueDate)}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) setDueDate(date);
              }}
            />
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

        </View>

      </ScrollView>

      <View style={[styles.fixedBottom, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <Text style={styles.saveButtonText}>Saving Order...</Text>
          ) : (
            <Text style={styles.saveButtonText}>Create Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  backArrow: {
    fontSize: 28,
    color: COLORS.primaryDark,
    fontWeight: '600',
    marginTop: -4,
  },
  headerTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 18,
    color: COLORS.textMain,
  },
  headerSpacer: {
    width: 48,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.card,
  },
  photoArea: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  photoPreviewContainer: {
    width: '100%',
    height: '100%',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  photoOverlayText: {
    fontFamily: 'Inter_400Regular',
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: '#F3E8E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E6D5C9',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  photoIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  photoText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 15,
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  photoSubText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: COLORS.textSub,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 11,
    color: COLORS.textSub,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  fixedBottom: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  datePickerBtn: {
    justifyContent: 'center',
  },
  datePickerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  notesInput: {
    height: 100,
    paddingTop: 14,
  },
  saveButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.btn,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 16,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
