import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getOrder, updateOrder, updateOrderStatus, deleteOrder } from '../../src/api';
import { COLORS, SHADOWS } from '../../src/theme';

const STATUS_STEPS = [
  { key: 'material_collected', label: 'Material Collected', icon: '🧵' },
  { key: 'cutting', label: 'Taken for Cutting', icon: '✂️' },
  { key: 'stitching_in_progress', label: 'Stitching in Progress', icon: '🪡' },
  { key: 'ready_to_collect', label: 'Ready to Collect', icon: '👜' },
  { key: 'collected', label: 'Collected', icon: '✅' },
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await getOrder(id);
      setOrder(res.data.order);
      setEditData({
        customerName: res.data.order.customerName,
        phoneNumber: res.data.order.phoneNumber,
        notes: res.data.order.notes || '',
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to load order');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await updateOrder(id, editData);
      setOrder(res.data.order);
      setEditing(false);
      Alert.alert('Success', 'Order updated');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStatusChange = async (status) => {
    const stepObj = STATUS_STEPS.find((s) => s.key === status);
    const label = stepObj ? stepObj.label : status;

    let title = 'Change Status?';
    let msg = `Update order status to "${label}"?`;

    if (status === 'collected') {
      title = 'Mark as Collected?';
      msg = 'Order auto-deletes in 2 days after collection.';
    }

    Alert.alert(
      title,
      msg,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => performStatusUpdate(status),
          style: status === 'collected' ? 'destructive' : 'default',
        },
      ]
    );
  };

  const performStatusUpdate = async (status) => {
    setUpdatingStatus(true);
    try {
      const res = await updateOrderStatus(id, status);
      setOrder(res.data.order);
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to permanently delete this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteOrder(id);
              Alert.alert('Deleted', 'Order has been removed');
              router.back();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete order');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ flex: 1 }} />
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)} activeOpacity={0.7}>
              <Text style={{ fontSize: 22 }}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main card */}
        <View style={styles.detailCard}>
          {/* Photo */}
          {order.clothPhoto ? (
            <Image source={{ uri: order.clothPhoto }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={{ fontSize: 48 }}>👗</Text>
            </View>
          )}

          {/* Info */}
          {editing ? (
            <>
              <Text style={styles.editLabel}>Customer Name:</Text>
              <TextInput
                style={styles.editInput}
                value={editData.customerName}
                onChangeText={(t) => setEditData({ ...editData, customerName: t })}
              />
              <Text style={styles.editLabel}>Phone:</Text>
              <TextInput
                style={styles.editInput}
                value={editData.phoneNumber}
                onChangeText={(t) => setEditData({ ...editData, phoneNumber: t })}
                keyboardType="phone-pad"
              />
              <Text style={styles.editLabel}>Notes:</Text>
              <TextInput
                style={[styles.editInput, { minHeight: 60 }]}
                value={editData.notes}
                onChangeText={(t) => setEditData({ ...editData, notes: t })}
                multiline
                textAlignVertical="top"
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setEditing(false);
                    setEditData({
                      customerName: order.customerName,
                      phoneNumber: order.phoneNumber,
                      notes: order.notes || '',
                    });
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveEditBtn, savingEdit && { opacity: 0.7 }]}
                  onPress={handleSaveEdit}
                  disabled={savingEdit}
                >
                  <Text style={styles.saveEditBtnText}>
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.serialNo}>Serial: {order.serialNumber}</Text>
              <Text style={styles.phoneNo}>📱 {order.phoneNumber}</Text>

              <View style={styles.dateRow}>
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>DATE GIVEN</Text>
                  <Text style={styles.dateValue}>{formatDate(order.dateGiven)}</Text>
                </View>
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>DUE DATE</Text>
                  <Text style={styles.dateValue}>{formatDate(order.deliveryDueDate)}</Text>
                </View>
              </View>

              {order.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>NOTES</Text>
                  <Text style={styles.notesText}>{order.notes}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>

        {/* Status section */}
        {!editing && (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>ORDER STATUS</Text>
            {updatingStatus && (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ marginBottom: 8 }}
              />
            )}
            {STATUS_STEPS.map((step) => {
              const isActive = order.status === step.key;
              return (
                <TouchableOpacity
                  key={step.key}
                  style={[
                    styles.statusButton,
                    isActive && styles.statusButtonActive,
                  ]}
                  onPress={() => handleStatusChange(step.key)}
                  disabled={updatingStatus}
                  activeOpacity={0.8}
                >
                  <Text style={styles.statusIcon}>{step.icon}</Text>
                  <Text style={styles.statusLabel}>{step.label}</Text>
                  {isActive && (
                    <Text style={styles.currentBadge}>CURRENT</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Delete button */}
        {order.status === 'collected' && !editing && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete Order</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    gap: 16,
  },
  backButton: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  backArrow: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '800',
  },
  headerTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 22,
    color: COLORS.textMain,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    ...SHADOWS.card,
    marginHorizontal: 20,
    padding: 18,
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: 312,
    borderRadius: 16,
    ...SHADOWS.card,
    marginBottom: 18,
  },
  photoPlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  customerName: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 28,
    color: COLORS.textMain,
    marginBottom: 6,
  },
  serialNo: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: COLORS.textSub,
    marginBottom: 2,
  },
  phoneNo: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: COLORS.textSub,
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0ebe6',
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValue: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.textMain,
  },
  notesBox: {
    backgroundColor: '#faf5ef',
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
  },
  notesLabel: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  notesText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: COLORS.textSub,
    lineHeight: 20,
  },
  // Edit mode
  editLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: COLORS.textMain,
    marginBottom: 6,
    marginTop: 12,
  },
  editInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.textMain,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  cancelBtnText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: COLORS.textSub,
  },
  saveEditBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    ...SHADOWS.btn,
  },
  saveEditBtnText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
    color: COLORS.white,
  },
  // Status section
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    ...SHADOWS.card,
    marginHorizontal: 20,
    padding: 18,
    marginBottom: 16,
  },
  statusTitle: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 12,
    color: COLORS.textSub,
    letterSpacing: 1,
    marginBottom: 16,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    ...SHADOWS.btn,
    gap: 10,
  },
  statusButtonActive: {
    backgroundColor: COLORS.primaryDark,
  },
  statusIcon: {
    fontSize: 18,
  },
  statusLabel: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 12,
    color: COLORS.white,
    flex: 1,
  },
  currentBadge: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 8,
    color: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  deleteButton: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  deleteButtonText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
    color: COLORS.danger,
  },
});
