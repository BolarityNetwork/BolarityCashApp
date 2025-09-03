import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// 线条图标组件
const LineIcon = ({
  name,
  isActive,
  size = 20,
}: {
  name: string;
  isActive: boolean;
  size?: number;
}) => {
  const iconColor = isActive ? '#fff' : '#6b7280';

  switch (name) {
    case 'home':
      return (
        <View
          className="items-center justify-center"
          style={{ width: size, height: size }}
        >
          <View className="relative items-center justify-center">
            {/* 三角形屋顶 */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderLeftWidth: size * 0.35,
                borderRightWidth: size * 0.35,
                borderBottomWidth: size * 0.3,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: iconColor,
              }}
            />
            {/* 房子主体 */}
            <View
              style={{
                marginTop: size * 0.25,
                width: size * 0.55,
                height: size * 0.45,
                borderColor: iconColor,
                borderWidth: 1.5,
                borderTopWidth: 0,
              }}
            />
            {/* 门 */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                width: size * 0.18,
                height: size * 0.25,
                borderColor: iconColor,
                borderWidth: 1.5,
                borderTopWidth: 0,
              }}
            />
          </View>
        </View>
      );

    case 'actions':
      return (
        <View
          className="items-center justify-center"
          style={{ width: size, height: size }}
        >
          <View className="relative items-center justify-center">
            {/* 上半部分闪电 */}
            <View
              style={{
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderTopWidth: size * 0.35,
                borderBottomWidth: 0,
                borderLeftWidth: size * 0.15,
                borderRightWidth: size * 0.25,
                borderTopColor: iconColor,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                marginBottom: -1,
              }}
            />
            {/* 下半部分闪电 */}
            <View
              style={{
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderTopWidth: 0,
                borderBottomWidth: size * 0.35,
                borderLeftWidth: size * 0.25,
                borderRightWidth: size * 0.15,
                borderBottomColor: iconColor,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                marginLeft: size * 0.1,
              }}
            />
          </View>
        </View>
      );

    case 'profile':
      return (
        <View
          className="items-center justify-center"
          style={{ width: size, height: size }}
        >
          <View className="items-center justify-center">
            {/* 头部 */}
            <View
              style={{
                width: size * 0.35,
                height: size * 0.35,
                borderRadius: size * 0.175,
                borderColor: iconColor,
                borderWidth: 1.5,
                marginBottom: 2,
              }}
            />
            {/* 身体 */}
            <View
              style={{
                width: size * 0.65,
                height: size * 0.35,
                borderTopLeftRadius: size * 0.325,
                borderTopRightRadius: size * 0.325,
                borderColor: iconColor,
                borderWidth: 1.5,
                borderBottomWidth: 0,
              }}
            />
          </View>
        </View>
      );

    default:
      return <View style={{ width: size, height: size }} />;
  }
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 16,
          right: 16,
          height: 80,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
            className="flex-1 rounded-2xl shadow-lg border border-white/20"
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 16,
          marginHorizontal: 4,
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View
              className={`w-7 h-7 rounded-full items-center justify-center ${
                focused ? 'bg-indigo-500 scale-110' : 'bg-slate-100'
              }`}
            >
              <LineIcon name="home" isActive={focused} size={16} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="actions"
        options={{
          title: 'Actions',
          tabBarIcon: ({ focused }) => (
            <View className="items-center justify-center">
              <LinearGradient
                colors={
                  focused ? ['#667eea', '#764ba2'] : ['#f3f4f6', '#e5e7eb']
                }
                className="w-9 h-9 rounded-full items-center justify-center shadow-md"
              >
                <LineIcon name="actions" isActive={focused} size={20} />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View
              className={`w-7 h-7 rounded-full items-center justify-center ${
                focused ? 'bg-indigo-500 scale-110' : 'bg-slate-100'
              }`}
            >
              <LineIcon name="profile" isActive={focused} size={16} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
