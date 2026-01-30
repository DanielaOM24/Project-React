import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface NumberSelectorProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onValueChange: (value: number) => void;
}

export default function NumberSelector({
  label,
  value,
  min,
  max,
  unit,
  onValueChange,
}: NumberSelectorProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleDecrease = () => {
    if (value > min) {
      const newValue = value - 1;
      onValueChange(newValue);
      setInputValue(newValue.toString());
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      const newValue = value + 1;
      onValueChange(newValue);
      setInputValue(newValue.toString());
    }
  };

  const handleInputChange = (text: string) => {
    // Solo permitir números, permitir campo vacío mientras escribe
    const numericValue = text.replace(/[^0-9]/g, '');
    setInputValue(numericValue);
    
    // No validar mientras está escribiendo, solo actualizar el texto
    // La validación se hará en onBlur
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    
    // Validar y ajustar el valor cuando termina de editar
    if (inputValue === '' || inputValue === null || inputValue === undefined) {
      // Si está vacío, usar el valor mínimo
      setInputValue(min.toString());
      onValueChange(min);
      return;
    }
    
    const numValue = parseInt(inputValue, 10);
    
    if (isNaN(numValue)) {
      // Si no es un número válido, usar el valor mínimo
      setInputValue(min.toString());
      onValueChange(min);
    } else if (numValue < min) {
      // Si es menor al mínimo, ajustar al mínimo
      setInputValue(min.toString());
      onValueChange(min);
    } else if (numValue > max) {
      // Si es mayor al máximo, ajustar al máximo
      setInputValue(max.toString());
      onValueChange(max);
    } else {
      // Valor válido, actualizar
      setInputValue(numValue.toString());
      onValueChange(numValue);
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    setInputValue(value.toString());
  };

  // Sincronizar el input cuando cambia el valor externamente (botones + -)
  React.useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.selectorContainer}>
        {/* Botón disminuir */}
        <TouchableOpacity
          onPress={handleDecrease}
          disabled={value <= min}
          style={[styles.button, value <= min && styles.buttonDisabled]}
          activeOpacity={0.7}>
            <Ionicons
              name="remove"
              size={24}
              color={value <= min ? '#D1D5DB' : '#000000'}
            />
        </TouchableOpacity>

        {/* Valor central - Editable */}
        <View style={styles.valueContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.valueInput}
              value={inputValue}
              onChangeText={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              keyboardType="number-pad"
              selectTextOnFocus
              maxLength={3}
              returnKeyType="done"
              blurOnSubmit={true}
            />
            <Text style={styles.unit}>{unit}</Text>
          </View>
        </View>

        {/* Botón aumentar */}
        <TouchableOpacity
          onPress={handleIncrease}
          disabled={value >= max}
          style={[styles.button, value >= max && styles.buttonDisabled]}
          activeOpacity={0.7}>
            <Ionicons
              name="add"
              size={24}
              color={value >= max ? '#D1D5DB' : '#000000'}
            />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  inputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueInput: {
    fontSize: 42,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    padding: 0,
    minWidth: 70,
  },
  unit: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
});

