import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { registerForPushNotificationsAsync } from '../../lib/notifications';
import { Bell, BellRing, Trash2 } from 'lucide-react-native';

export default function Alerts() {
  const [targetPrice, setTargetPrice] = useState('');
  const [karat, setKarat] = useState(24);
  const [condition, setCondition] = useState<'above' | 'below'>('below');
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSaveAlert = async () => {
    if (!targetPrice) {
      Alert.alert('Error', 'Please enter a target price.');
      return;
    }

    setIsSettingUp(true);
    try {
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        Alert.alert('Permission Required', 'Please enable notifications to use this feature.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('price_alerts').insert({
        user_id: user?.id,
        karat,
        target_price: parseFloat(targetPrice),
        condition,
        expo_push_token: token,
      });

      if (error) throw error;

      Alert.alert('Success', `Alert set for ${karat}K gold ${condition} ${targetPrice} QAR.`);
      setTargetPrice('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-8">
        <Text className="text-muted text-xs uppercase tracking-[4px] mb-1 font-semibold">
          Price Monitor
        </Text>
        <Text className="text-white text-4xl font-bold mb-8">Alerts</Text>

        {/* Setup Card */}
        <View className="bg-[#1A1A1A] border border-[#333] rounded-3xl p-6 mb-8 shadow-2xl">
          <View className="flex-row items-center mb-6">
            <View className="bg-primary/20 p-2 rounded-lg mr-3">
              <Bell size={20} color="#D4AF37" />
            </View>
            <Text className="text-white font-bold text-lg">Create New Alert</Text>
          </View>

          <View className="mb-6">
            <Text className="text-muted text-xs font-bold uppercase mb-3">Notify me when price is</Text>
            <View className="flex-row bg-black/30 p-1 rounded-2xl border border-white/5">
              <TouchableOpacity 
                onPress={() => setCondition('below')}
                className={`flex-1 py-3 rounded-xl items-center ${condition === 'below' ? 'bg-primary' : ''}`}
              >
                <Text className={`font-bold text-xs ${condition === 'below' ? 'text-black' : 'text-muted'}`}>BELOW</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setCondition('above')}
                className={`flex-1 py-3 rounded-xl items-center ${condition === 'above' ? 'bg-primary' : ''}`}
              >
                <Text className={`font-bold text-xs ${condition === 'above' ? 'text-black' : 'text-muted'}`}>ABOVE</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6 flex-row">
            <View className="flex-1 mr-2">
                <Text className="text-muted text-xs font-bold uppercase mb-3">Karat</Text>
                <View className="bg-black/30 border border-white/5 rounded-2xl p-4">
                    <TextInput 
                        className="text-white font-bold text-lg"
                        keyboardType="numeric"
                        value={karat.toString()}
                        onChangeText={(v) => setKarat(parseInt(v) || 24)}
                    />
                </View>
            </View>
            <View className="flex-[2] ml-2">
                <Text className="text-muted text-xs font-bold uppercase mb-3">Price (QAR)</Text>
                <View className="bg-black/30 border border-white/5 rounded-2xl p-4">
                    <TextInput 
                        className="text-white font-bold text-lg"
                        placeholder="0.00"
                        placeholderTextColor="#444"
                        keyboardType="numeric"
                        value={targetPrice}
                        onChangeText={setTargetPrice}
                    />
                </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSaveAlert}
            disabled={isSettingUp}
            className="bg-primary py-5 rounded-2xl items-center shadow-lg shadow-primary/20"
          >
            <Text className="text-black font-black text-xs uppercase tracking-widest">
              {isSettingUp ? 'SETTING UP...' : 'ACTIVATE ALERT'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View className="p-6 bg-white/5 rounded-3xl border border-white/5">
           <Text className="text-white/60 text-xs leading-5 italic text-center">
             Alerts are sent via Push Notifications when the hourly market scan detects your target price.
           </Text>
        </View>

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
