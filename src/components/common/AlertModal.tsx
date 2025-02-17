import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Pressable,
} from 'react-native';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  style?: ViewStyle & {
    titleColor?: string;
    icon?: string;
  };
  confirmButtonColor?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
  showCancel = false,
  style,
  confirmButtonColor,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.modalContent}>
        {style?.icon && (
          <Text style={[styles.icon, { color: style.titleColor }]}>
            {style.icon}
          </Text>
        )}
        <Text style={[styles.title, style?.titleColor && { color: style.titleColor }]}>
          {title}
        </Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttonContainer}>
          {showCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
          )}
          <Pressable
            style={[
              styles.button, 
              styles.confirmButton,
              confirmButtonColor && { backgroundColor: confirmButtonColor }
            ]}
            onPress={onConfirm}
          >
            <Text style={styles.buttonText}>
              {confirmText}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    position: 'relative',
    zIndex: 3000,
    pointerEvents: 'auto',
  },
  modalContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  cancelButtonText: {
    color: '#495057',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
}); 