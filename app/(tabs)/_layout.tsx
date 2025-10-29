import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: 'blue', headerShown: false }}
      tabBar={props => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('navigation.home'),
          tabBarStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <Tabs.Screen
        name="actions"
        options={{
          title: t('navigation.actions'),
          tabBarStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('navigation.profile'),
          tabBarStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
    </Tabs>
  );
}
