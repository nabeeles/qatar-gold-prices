import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHistoricalPrices } from '../../hooks/useGoldPrices';
import { LineChart } from 'react-native-wagmi-charts';
import { LineChart as ChartIcon, Calendar } from 'lucide-react-native';

const TIMEFRAMES = [
  { label: '1W', value: '7d' },
  { label: '1M', value: '30d' },
  { label: '1Y', value: '365d' },
];

export default function Trends() {
  const { data, isLoading, error } = useHistoricalPrices(24);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red' }}>Error loading data: {(error as Error).message}</Text>
      </View>
    );
  }

  // Ensure data exists and is in the correct format for Wagmi Charts
  // [{ timestamp: number, value: number }]
  const chartData = data && Array.isArray(data) && data.length > 1 ? data : [
    { timestamp: Date.now() - 86400000 * 2, value: 560 },
    { timestamp: Date.now() - 86400000, value: 565 },
    { timestamp: Date.now(), value: 571 },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
          <Text style={{ color: '#A0A0A0', fontSize: 12, textTransform: 'uppercase', letterSpacing: 4, marginBottom: 4, fontWeight: '600' }}>
            Market Analytics
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: 'bold', marginBottom: 32 }}>Trends</Text>

          {/* Chart Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <ChartIcon size={14} color="#D4AF37" />
              <Text style={{ color: '#F1E5AC', fontSize: 12, fontWeight: 'bold', marginLeft: 8 }}>24K GOLD RATE</Text>
            </View>
            
            <View style={{ flexDirection: 'row', backgroundColor: '#1A1A1A', padding: 4, borderRadius: 12, borderWidth: 1, borderColor: '#333' }}>
              {TIMEFRAMES.map((tf) => (
                <TouchableOpacity
                  key={tf.value}
                  onPress={() => setSelectedTimeframe(tf.value)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: selectedTimeframe === tf.value ? '#D4AF37' : 'transparent'
                  }}
                >
                  <Text style={{ 
                    fontSize: 10, 
                    fontWeight: 'bold', 
                    color: selectedTimeframe === tf.value ? '#000000' : '#A0A0A0'
                  }}>
                    {tf.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interactive Chart - Wrapped in a View for stability */}
          <View style={{ backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333', borderRadius: 24, padding: 16, height: 350, justifyContent: 'center' }}>
            {chartData.length > 0 ? (
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
            ) : (
              <Text style={{ color: '#A0A0A0', textAlign: 'center' }}>Insufficient data for chart</Text>
            )}
            
            <View style={{ position: 'absolute', bottom: 24, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 }}>
               <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>PREVIOUS CLOSE</Text>
               <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>MARKET OPEN</Text>
            </View>
          </View>

          {/* Insight Box */}
          <View style={{ marginTop: 32, padding: 24, backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Calendar size={18} color="#D4AF37" />
              <Text style={{ color: '#D4AF37', fontWeight: 'bold', marginLeft: 8 }}>Market Insight</Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 20 }}>
              The market is showing a bullish trend over the last week. 
              Prices have stabilized near the 570 QAR resistance level.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
