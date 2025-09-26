import React from 'react';
import { View } from 'react-native';
import Skeleton from './Skeleton';

const VaultSkeleton: React.FC = () => {
  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-200 mb-3">
      {/* Header Section */}
      <View className="flex-row items-center mb-3">
        <View className="flex-row items-center flex-1">
          {/* Protocol Logo Skeleton */}
          <Skeleton width={40} height={40} borderRadius={20} />

          {/* Protocol Info Skeleton */}
          <View className="ml-3 flex-1">
            <View className="flex-row items-center mb-2 gap-2">
              <Skeleton width={80} height={16} borderRadius={4} />
              <Skeleton width={40} height={16} borderRadius={4} />
            </View>
            <Skeleton width={120} height={14} borderRadius={4} />
          </View>
        </View>

        {/* APY Section Skeleton */}
        <View className="items-end">
          <Skeleton width={60} height={18} borderRadius={4} />
          <Skeleton width={30} height={12} borderRadius={4} />
        </View>
      </View>

      {/* Bottom Section */}
      <View className="flex-row justify-between">
        <Skeleton width={80} height={14} borderRadius={4} />
        <Skeleton width={60} height={14} borderRadius={4} />
      </View>
    </View>
  );
};

export default VaultSkeleton;
