import React, { useRef } from 'react';
import { Animated, StyleSheet, View, Text, TouchableOpacity, Pressable } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Pencil, Trash2 } from 'lucide-react-native';

const ACTION_WIDTH = 160; // İki buton için toplam genişlik

interface CustomerSwipeableRowProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CustomerSwipeableRow({ children, onEdit, onDelete }: CustomerSwipeableRowProps) {
  const swipeableRef = useRef<Swipeable | null>(null);

  // Sağ taraftaki butonları render et
  const renderRightActions = () => {
    return (
      <View style={styles.rightActionsContainer}>
        <Pressable
          style={({pressed}) => [
            styles.rightAction, 
            styles.editAction,
            pressed && styles.buttonPressed
          ]}
          onPress={() => {
            swipeableRef.current?.close();
            onEdit();
          }}
        >
          <Pencil size={22} color="white" />
          <Text style={styles.actionText}>Düzenle</Text>
        </Pressable>
        
        <Pressable
          style={({pressed}) => [
            styles.rightAction, 
            styles.deleteAction,
            pressed && styles.buttonPressed
          ]}
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
        >
          <Trash2 size={22} color="white" />
          <Text style={styles.actionText}>Sil</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={1}
      overshootRight={false}
      renderRightActions={renderRightActions}
      rightThreshold={40}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => swipeableRef.current?.openRight()}
        style={styles.contentContainer}
      >
        {children}
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    backgroundColor: 'white',
  },
  rightActionsContainer: {
    width: ACTION_WIDTH,
    flexDirection: 'row',
  },
  rightAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  editAction: {
    backgroundColor: '#3b82f6',
  },
  deleteAction: {
    backgroundColor: '#dc2626',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4
  }
});