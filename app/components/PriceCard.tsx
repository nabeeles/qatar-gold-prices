import React from 'react';
import { View, Text } from 'react-native';
import { GoldPrice } from '../hooks/useGoldPrices';

interface PriceCardProps {
  item: GoldPrice;
}

export function PriceCard({ item }: PriceCardProps) {
  const formattedDate = new Date(item.scraped_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <View className="bg-[#1A1A1A] border border-[#333] rounded-2xl p-5 mb-4 shadow-lg shadow-black">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-muted text-xs uppercase tracking-widest font-medium">
          {item.provider.name}
        </Text>
        <Text className="text-muted text-[10px]">
          {formattedDate}
        </Text>
      </View>
      
      <View className="flex-row justify-between items-end">
        <View>
          <Text className="text-champagne text-3xl font-bold tracking-tighter">
            {item.karat}K
          </Text>
          <Text className="text-white opacity-60 text-xs">Purity</Text>
        </View>
        
        <View className="items-end">
          <View className="flex-row items-baseline">
            <Text className="text-primary text-4xl font-bold">
              {item.price}
            </Text>
            <Text className="text-primary text-sm font-medium ml-1">
              QAR
            </Text>
          </View>
          <Text className="text-white opacity-60 text-xs">Per Gram</Text>
        </View>
      </View>
    </View>
  );
}
