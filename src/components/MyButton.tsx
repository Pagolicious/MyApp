import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React, {FC} from 'react';

interface Props {
  title: string;
  onPress: () => void;
}

const MyButton: FC<Props> = ({title, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

export default MyButton;

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#C41E3A',
    marginTop: 10,
  },
  title: {
    color: 'white',
    fontSize: 20,
  },
});
