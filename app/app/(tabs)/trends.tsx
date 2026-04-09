import React, { useState } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useHistoricalPrices } from '../../hooks/useGoldPrices';
import { LineChart } from 'react-native-wagmi-charts';
import { LineChart as ChartIcon, Calendar } from 'lucide-react-native';

const TIMEFRAMES = [
  { label: '1W', value: '7d' },
  { label: '1M', value: '30d' },
  { label: '1Y', value: '365d' },
];

export default function Trends() {
  const { data, isLoading } = useHistoricalPrices(24);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  // Sample data if none exists yet
  const chartData = data && data.length > 1 ? data : [
    { timestamp: Date.now() - 86400000 * 2, value: 560 },
    { timestamp: Date.now() - 86400000, value: 565 },
    { timestamp: Date.now(), value: 571 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 pt-8">
        <Text className="text-muted text-xs uppercase tracking-[4px] mb-1 font-semibold">
          Market Analytics
        </Text>
        <Text className="text-white text-4xl font-bold mb-8">Trends</Text>

        {/* Chart Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <ChartIcon size={14} color="#D4AF37" className="mr-2" />
            <Text className="text-champagne text-xs font-bold ml-2">24K GOLD RATE</Text>
          </View>
          
          <View className="flex-row bg-[#1A1A1A] p-1 rounded-xl border border-[#333]">
            {TIMEFRAMES.map((tf) => (
              <TouchableOpacity
                key={tf.value}
                onPress={() => setSelectedTimeframe(tf.value)}
                className={`px-4 py-2 rounded-lg ${
                  selectedTimeframe === tf.value ? 'bg-primary' : ''
                }`}
              >
                <Text className={`text-[10px] font-bold ${
                  selectedTimeframe === tf.value ? 'text-black' : 'text-muted'
                }`}>
                  {tf.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interactive Chart */}
        <View className="bg-[#1A1A1A] border border-[#333] rounded-3xl p-4 h-[350px] justify-center shadow-2xl">
          <LineChart.Provider data={chartData}>
            <LineChart height={280} width={Dimensions.get('window').width - 80}>
              <LineChart.Path color="#D4AF37" width={3}>
                <LineChart.Gradient color="#D4AF37" opacity={0.2} />
              </LineChart.Path>
              <LineChart.CursorCrosshair color="#D4AF37">
                <LineChart.Tooltip textStyle={{ color: 'white', fontWeight: 'bold' }} />
              </LineChart.CursorCrosshair>
            </LineChart>
          </LineChart.Provider>
          
          <View className="absolute bottom-6 left-6 right-6 flex-row justify-between border-t border-white/5 pt-4">
             <Text className="text-white/30 text-[10px]">PREVIOUS CLOSE</Text>
             <Text className="text-white/30 text-[10px]">MARKET OPEN</Text>
          </View>
        </View>

        {/* Insight Box */}
        <View className="mt-8 p-6 bg-primary/10 rounded-3xl border border-primary/20">
          <View className="flex-row items-center mb-2">
            <Calendar size={18} color="#D4AF37" />
            <Text className="text-primary font-bold ml-2">Market Insight</Text>
          </View>
          <Text className="text-white/70 text-xs leading-5">
            The market is showing a <Text className="text-green-400 font-bold">bullish trend</Text> over the last week. 
            Prices have stabilized near the 570 QAR resistance level.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
