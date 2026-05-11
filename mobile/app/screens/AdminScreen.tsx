import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { api } from '../services/api';

interface PendingPayment {
  id: number;
  userName: string;
  planName: string;
  amount: string;
  screenshotUrl: string;
  createdAt: string;
}

export default function AdminScreen() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, activeSubscriptions: 0, totalRevenue: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, statsRes] = await Promise.all([
        api.getPendingPayments(),
        api.getStats(),
      ]);
      setPayments(paymentsRes.data || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: number) => {
    try {
      await api.verifyPayment(paymentId);
      Alert.alert('Success', 'Payment approved');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve payment');
    }
  };

  const handleReject = async (paymentId: number) => {
    Alert.alert('Reject Payment', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Reject',
        onPress: async () => {
          try {
            await api.rejectPayment(paymentId);
            Alert.alert('Success', 'Payment rejected');
            loadData();
          } catch (error) {
            Alert.alert('Error', 'Failed to reject payment');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Admin Panel</Text>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeSubscriptions}</Text>
          <Text style={styles.statLabel}>Active Subscriptions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${stats.totalRevenue}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>

      {/* Pending Payments */}
      <Text style={styles.sectionTitle}>Pending Payments ({payments.length})</Text>

      {payments.length === 0 ? (
        <Text style={styles.emptyText}>No pending payments</Text>
      ) : (
        payments.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            {payment.screenshotUrl && (
              <Image
                source={{ uri: payment.screenshotUrl }}
                style={styles.screenshot}
              />
            )}
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentUser}>{payment.userName}</Text>
              <Text style={styles.paymentPlan}>{payment.planName}</Text>
              <Text style={styles.paymentAmount}>${payment.amount}</Text>
              <Text style={styles.paymentDate}>
                {new Date(payment.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.approveButton]}
                onPress={() => handleApprove(payment.id)}
              >
                <Text style={styles.buttonText}>✓ Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleReject(payment.id)}
              >
                <Text style={styles.buttonText}>✕ Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    padding: 20,
  },
  paymentCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  screenshot: {
    width: '100%',
    height: 200,
  },
  paymentInfo: {
    padding: 15,
  },
  paymentUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  paymentPlan: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 5,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
