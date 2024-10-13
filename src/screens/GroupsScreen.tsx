import { StyleSheet, Text, View, Alert, TextInput, Button, FlatList } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'

//Navigation
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from '../App'

//Components
import FooterNav from '../components/FooterNav'

//Firebase
import firestore from '@react-native-firebase/firestore'

// AuthContext
import { useAuth } from '../context/AuthContext'

type GroupsProps = NativeStackScreenProps<RootStackParamList, 'GroupsScreen'>


const GroupsScreen = ({ route }: GroupsProps) => {

  const { currentUser } = useAuth()

  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userHasGroup, setUserHasGroup] = useState(false)

  if (!currentUser) return // Ensure currentUser is defined

  const fetchGroups = async () => {
    try {
      const groupCollection = await firestore().collection('groups').get()
      const groupList = groupCollection.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGroups(groupList)

      const userGroup = await firestore()
        .collection('groups')
        .where('createdBy', '==', currentUser.uid)
        .get()

      setUserHasGroup(!userGroup.empty) // If the query returns results, set to true

    } catch (error) {
      const errorMessage = (error as { message?: string }).message || "An unknown error occurred"
      Alert.alert(errorMessage)
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchGroups()
  }, [])

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading groups...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Groups</Text>
      </View>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            {/* Card */}
            <View style={styles.card}>
              <View style={styles.column}>
                {/* Card Content: Activity & Location */}
                <View style={styles.cardContentActivity}>
                  <Text style={styles.cardText}>{item.activity}</Text>
                  <Text style={styles.cardText}>{item.location}</Text>
                </View>

                {/* Card Content: Date & Time */}
                <View style={styles.cardContentDate}>
                  <Text style={styles.cardText}>{item.fromDate}</Text>
                  <Text style={styles.cardText}>{item.fromTime} - {item.toTime}</Text>
                </View>

                {/* Card Content: People */}
                <View style={styles.cardContentPeople}>
                  <Text style={styles.cardTextPeople}>+2</Text>
                </View>
              </View>
            </View>
            <View style={styles.line}></View>
          </View>
        )}
      />
      {userHasGroup && (
        <FooterNav route={route} />
      )}
    </View>

  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 150,
    backgroundColor: "#EAD8B1",
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black"
  },
  card: {
    backgroundColor: "#6A9AB0",
    padding: 15
  },
  column: {
    flexDirection: 'row',
  },
  cardContentActivity: {
    flex: 1
  },
  cardContentDate: {
    flex: 1
  },
  cardContentPeople: {
    justifyContent: "center"
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black"

  },
  cardTextPeople: {
    fontSize: 24,
    fontWeight: "bold"
  },
  line: {
    height: 1,
    width: "100%",
    backgroundColor: "black"
  }
})

export default GroupsScreen
