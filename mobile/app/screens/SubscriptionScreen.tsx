import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';
import type { SubscriptionPlan, UserSubscription } from '../types';

export default function SubscriptionScreen() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansRes, subRes] = await Promise.all([
        api.getSubscriptionPlans(),
        api.getMySubscription(),
      ]);
      setPlans(plansRes.data || []);
      setSubscription(subRes.data || null);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPayment = async (planId: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) return;

      setUploading(true);
      const uri = result.assets[0].uri;
      // TODO: Upload to S3 and get URL
      // For now, use URI directly
      await api.uploadPaymentScreenshot(planId, uri);

      Alert.alert('Success', 'Payment screenshot uploaded. Awaiting admin approval.');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload payment screenshot');
    } finally {
      setUploading(false);
    }
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
      <Text style={styles.title}>Choose Your Plan</Text>

      {subscription && subscription.status === 'active' && (
        <View style={styles.activeSubscription}>
          <Text style={styles.activeText}>✓ You have an active subscription</Text>
          <Text style={styles.expiryText}>
            Expires: {new Date(subscription.expiresAt!).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDuration}>{plan.durationDays} days</Text>
            <Text style={styles.planPrice}>${plan.price}</Text>

            {plan.description && (
              <Text style={styles.planDescription}>{plan.description}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                uploading && styles.buttonDisabled,
              ]}
              onPress={() => handleUploadPayment(plan.id)}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Upload Payment Proof</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>
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
  activeSubscription: {
    backgroundColor: '#1a3a1a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  activeText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  expiryText: {
    color: '#aaa',
    fontSize: 14,
  },
  plansContainer: {
    gap: 15,
  },
  planCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  planDuration: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  planDescription: {
    fontSize: 13,
    color: '#999',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
