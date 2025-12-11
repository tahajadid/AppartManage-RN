import { spacingY } from '@/constants/theme';
import useThemeColors from '@/contexts/useThemeColors';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import {
  Buildings,
  CreditCard,
  Gear,
  House,
  Plus
} from 'phosphor-react-native';
import React from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Typo from './Typo';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const tabIcons = {
    index: House,
    payments: CreditCard,
    'add-action': Plus,
    apartments: Buildings,
    settings: Gear,
  };

  const tabLabels = {
    index: 'Home',
    payments: 'Payments',
    'add-action': '',
    apartments: 'Apartment',
    settings: 'Settings',
  };

  const bottomInset = Math.max(insets.bottom, spacingY._10);
  const tabBarHeight = 60 + bottomInset;

  return (
    <View 
      style={[
        styles.tabBar,
        { 
          backgroundColor: colors.neutral900,
          paddingTop: spacingY._12,
          paddingBottom: bottomInset,
          height: tabBarHeight,
          borderTopColor: colors.neutral700,
        }
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const isAddButton = route.name === 'add-action';

        const Icon = tabIcons[route.name as keyof typeof tabIcons] || House;
        const label = tabLabels[route.name as keyof typeof tabLabels] || route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            if (isAddButton) {
              // Navigate to add action screen
              router.push('/(home)/add-action' as any);
            } else {
              navigation.navigate(route.name, route.params);
            }
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Render the floating "+" button
        if (isAddButton) {
          return (
            <View key={route.key} style={styles.addButtonContainer}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[
                  styles.addButton,
                  {
                    backgroundColor: colors.primary,
                  }
                ]}
              >
                <Plus size={28} color="#FFFFFF" weight="bold" />
              </TouchableOpacity>
            </View>
          );
        }

        // Render regular tab buttons
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <Icon 
              size={24} 
              color={isFocused ? colors.primary : colors.neutral400} 
              weight={isFocused ? 'fill' : 'regular'}
            />
            <Typo 
              size={12} 
              color={isFocused ? colors.primary : colors.neutral400}
              fontWeight={isFocused ? '600' : '400'}
              style={styles.tabLabel}
            >
              {label}
            </Typo>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 50,
  },
  tabLabel: {
    marginTop: spacingY._5,
  },
  addButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    paddingTop: spacingY._5,
    minHeight: 50,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -40,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

