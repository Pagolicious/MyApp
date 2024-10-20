// GroupCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Group {
  id: string;
  activity: string;
  location: string;
  fromDate: string;
  fromTime: string;
  toTime: string;
  createdBy: string;
}

interface GroupCardProps {
  group: Group;
  currentUserUid: string;
  onPress: () => void;
}

const GroupCard = ({ group, currentUserUid, onPress }: GroupCardProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[
        styles.card,
        group.createdBy === currentUserUid && { backgroundColor: 'lightblue' },
      ]}>
        <View style={styles.column}>
          <View style={styles.cardContentActivity}>
            <Text style={styles.cardText}>{group.activity}</Text>
            <Text style={styles.cardText}>{group.location}</Text>
          </View>
          <View style={styles.cardContentDate}>
            <Text style={styles.cardText}>{group.fromDate}</Text>
            <Text style={styles.cardText}>{group.fromTime} - {group.toTime}</Text>
          </View>
          <View style={styles.cardContentPeople}>
            <Text style={styles.cardTextPeople}>+2</Text>
          </View>
        </View>

      </View>
      <View style={styles.line}></View>

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#6A9AB0",
    padding: 15,
  },
  column: {
    flexDirection: 'row',
  },
  cardContentActivity: {
    flex: 1,
  },
  cardContentDate: {
    flex: 1,
  },
  cardContentPeople: {
    justifyContent: "center",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  cardTextPeople: {
    fontSize: 24,
    fontWeight: "bold",
  }, line: {
    height: 1,
    width: "100%",
    backgroundColor: "black"
  },
});

export default GroupCard;
