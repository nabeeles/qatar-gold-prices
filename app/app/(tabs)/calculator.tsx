import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useLatestPrices } from '../../hooks/useGoldPrices';
import { Calculator as CalcIcon, ChevronRight } from 'lucide-react-native';

const PURITIES = [
  { label: '24K', value: 24 },
  { label: '22K', value: 22 },
  { label: '18K', value: 18 },
];

export default function Calculator() {
  const { data } = useLatestPrices();
  const [weight, setWeight] = useState('10');
  const [selectedPurity, setSelectedPurity] = useState(24);

  // Calculate market average for the selected purity
  const currentRate = useMemo(() => {
    if (!data) return 0;
    const rates = data.filter(i => i.karat === selectedPurity);
    if (rates.length === 0) return 0;
    return rates.reduce((acc, curr) => acc + curr.price, 0) / rates.length;
  }, [data, selectedPurity]);

  const totalValue = useMemo(() => {
    const w = parseFloat(weight) || 0;
    return (w * currentRate).toFixed(2);
  }, [weight, currentRate]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-8">
        <Text className="text-muted text-xs uppercase tracking-[4px] mb-1 font-semibold">
          Estimation Tool
        </Text>
        <Text className="text-white text-4xl font-bold mb-8">Calculator</Text>

        {/* Display Card */}
        <View className="bg-[#1A1A1A] border border-[#333] rounded-3xl p-8 mb-8 items-center shadow-2xl">
          <Text className="text-muted text-xs uppercase font-bold tracking-widest mb-2">
            Estimated Value
          </Text>
          <View className="flex-row items-baseline mb-1">
            <Text className="text-primary text-5xl font-black">{totalValue}</Text>
            <Text className="text-primary text-lg font-bold ml-2">QAR</Text>
          </View>
          <Text className="text-white/40 text-[10px]">Based on current market average</Text>
        </View>

        {/* Input Section */}
        <View className="space-y-6">
          <View>
            <Text className="text-white/60 text-xs font-bold uppercase mb-3 ml-1">
              Gold Weight (Grams)
            </Text>
            <View className="bg-[#1A1A1A] border border-[#333] rounded-2xl p-4 flex-row items-center">
              <TextInput
                className="flex-1 text-white text-2xl font-bold"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholder="0.00"
                placeholderTextColor="#444"
              />
              <Text className="text-primary font-bold ml-2">g</Text>
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-white/60 text-xs font-bold uppercase mb-3 ml-1">
              Select Purity
            </Text>
            <View className="flex-row justify-between">
              {PURITIES.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => setSelectedPurity(p.value)}
                  className={`flex-1 mx-1 py-4 rounded-2xl items-center border ${
                    selectedPurity === p.value 
                      ? 'bg-primary border-primary' 
                      : 'bg-[#1A1A1A] border-[#333]'
                  }`}
                >
                  <Text className={`font-bold text-lg ${
                    selectedPurity === p.value ? 'text-black' : 'text-white'
                  }`}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/5 flex-row items-center">
          <View className="bg-primary/20 p-2 rounded-lg mr-4">
            <CalcIcon size={20} color="#D4AF37" />
          </View>
          <View className="flex-1">
            <Text className="text-white/80 text-xs leading-5">
              Current rate used: <Text className="text-primary font-bold">{currentRate.toFixed(2)} QAR/g</Text> for {selectedPurity}K gold.
            </Text>
          </View>
        </View>
        
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
