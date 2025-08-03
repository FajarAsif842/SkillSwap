import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen({ navigation, route }) {
  const { userID } = route.params;
  console.log('DashboardScreen: Received userID:', userID);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [followRequests, setFollowRequests] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [requestSent, setRequestSent] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch current user's data
        const userResponse = await fetch(
          `https://matchmatchingsystem-default-rtdb.firebaseio.com/Users/${userID}.json`
        );
        const userData = await userResponse.json();
        if (!userData || !userData.skillsLearn) {
          setError('No desired skills found for this user.');
          setCurrentUser(null);
          return;
        }
        console.log('DashboardScreen: Fetched skillsLearn for userID:', userID, userData.skillsLearn);
        setCurrentUser(userData);

        // Fetch all users
        const usersResponse = await fetch(
          'https://matchmatchingsystem-default-rtdb.firebaseio.com/Users.json'
        );
        const usersData = await usersResponse.json();
        if (!usersData) {
          setError('No users found in the database.');
          setUsers([]);
          return;
        }
        const userArray = Object.keys(usersData).map((key) => ({
          id: key,
          ...usersData[key],
        }));
        setUsers(userArray);

        // Fetch follow requests for the current user
        const followRequestsResponse = await fetch(
          `https://matchmatchingsystem-default-rtdb.firebaseio.com/FollowRequests/${userID}.json`
        );
        const followRequestsData = await followRequestsResponse.json();
        const followRequestsArray = followRequestsData
          ? Object.keys(followRequestsData).map((key) => ({
              id: key,
              ...followRequestsData[key],
            }))
          : [];
        setFollowRequests(followRequestsArray);

        // Fetch following list for the current user
        const followingResponse = await fetch(
          `https://matchmatchingsystem-default-rtdb.firebaseio.com/FollowRelationships/${userID}/following.json`
        );
        const followingData = await followingResponse.json();
        const followingArray = followingData ? Object.keys(followingData) : [];
        setFollowing(followingArray);

        // Fetch followers list for the current user
        const followersResponse = await fetch(
          `https://matchmatchingsystem-default-rtdb.firebaseio.com/FollowRelationships/${userID}/followers.json`
        );
        const followersData = await followersResponse.json();
        setFollowers(followersData ? Object.keys(followersData) : []);

        // Clear requestSent for users already followed
        setRequestSent((prev) => {
          const updatedRequestSent = { ...prev };
          followingArray.forEach((followedUserID) => {
            if (updatedRequestSent[followedUserID]) {
              delete updatedRequestSent[followedUserID];
            }
          });
          return updatedRequestSent;
        });

        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      }
    }

    fetchData();
  }, [userID]);

  const handleFollow = async (recipientID) => {
    try {
      await fetch(
        `https://matchmatchingsystem-default-rtdb.firebaseio.com/FollowRequests/${recipientID}/${userID}.json`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderID: userID,
            senderName: currentUser.name,
            timestamp: new Date().toISOString(),
          }),
        }
      );
      setRequestSent((prev) => ({ ...prev, [recipientID]: true }));
      console.log(`Follow request sent from ${userID} to ${recipientID}`);
    } catch (err) {
      console.error('Error sending follow request:', err);
      setError('Failed to send follow request.');
    }
  };

  const handleAcceptRequest = async (senderID) => {
    try {
      // Add to follow relationships for both users
      await fetch(
        `https://matchmatchingsystem-default-rtdb.firebaseio.com/FollowRelationships/${userID}/following/${senderID}.json`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ followedAt: new Date().toISOString() }),
        }
      );
      await fetch(
        `https://matchmatchingsystem-default-rtdb.firebaseio.com/FollowRelationships/${senderID}/followers/${userID}.json`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ followedAt: new Date().toISOString() }),
        }
      );
      // Remove the follow request
      await fetch(
        `https://matchmatchingsystem-default-rtdb.firebaseio.com/FollowRequests/${userID}/${senderID}.json`,
        {
          method: 'DELETE',
        }
      );
      // Update local state
      setFollowRequests((prev) => prev.filter((req) => req.id !== senderID));
      setFollowing((prev) => [...prev, senderID]);
      console.log(`Follow request from ${senderID} accepted by ${userID}`);
    } catch (err) {
      console.error('Error accepting follow request:', err);
      setError('Failed to accept follow request.');
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!user.skillsHave || user.id === userID || followers.includes(user.id)) {
      return false;
    }
    const userSkillsHave = user.skillsHave.map((skill) => skill.toLowerCase());
    const matchesSearchQuery =
      searchQuery === '' ||
      userSkillsHave.some((skill) => skill.includes(searchQuery.toLowerCase()));
    if (matchesSearchQuery && searchQuery !== '') {
      console.log(
        `DashboardScreen: Matched user ${user.name} with skillsHave:`,
        userSkillsHave,
        'for searchQuery:',
        searchQuery
      );
    }
    return matchesSearchQuery;
  });

  const followersData = users.filter((user) => followers.includes(user.id));

  const renderFollower = ({ item }) => (
    <View style={styles.userCard}>
      <Image
        source={item.image ? { uri: item.image } : require('../../assets/images/favicon.png')}
        style={styles.userImage}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <View style={styles.userDetailRow}>
          <MaterialIcons name="location-pin" size={14} color="#6B7280" style={styles.userIcon} />
          <Text style={styles.userCity}>{item.location || 'N/A'} | {item.rating || 'N/A'} ★</Text>
        </View>
        <View style={styles.userDetailRow}>
          <MaterialIcons name="email" size={14} color="#6B7280" style={styles.userIcon} />
          <Text style={styles.userDetail}>{item.email || 'N/A'}</Text>
        </View>
        <View style={styles.userDetailRow}>
          <MaterialIcons name="phone" size={14} color="#6B7280" style={styles.userIcon} />
          <Text style={styles.userDetail}>{item.contact || 'N/A'}</Text>
        </View>
        <View style={styles.userDetailRow}>
          <MaterialIcons name="schedule" size={14} color="#6B7280" style={styles.userIcon} />
          <Text style={styles.userDetail}>{item.availability || 'N/A'}</Text>
        </View>
        <View style={styles.userDetailRow}>
          <MaterialIcons name="build" size={14} color="#6B7280" style={styles.userIcon} />
          <Text style={styles.userSkills}>Skills: {item.skillsHave.join(', ') || 'N/A'}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('ChatScreen', { userID, recipientID: item.id })}
          >
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderUser = ({ item }) => {
    const isFollowing = following.includes(item.id);
    const isFollower = followers.includes(item.id);
    const isRequestSent = requestSent[item.id];
    return (
      <View style={styles.userCard}>
        <Image
          source={item.image ? { uri: item.image } : require('../../assets/images/favicon.png')}
          style={styles.userImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={styles.userDetailRow}>
            <MaterialIcons name="location-pin" size={14} color="#6B7280" style={styles.userIcon} />
            <Text style={styles.userCity}>{item.location || 'N/A'} | {item.rating || 'N/A'} ★</Text>
          </View>
          <View style={styles.userDetailRow}>
            <MaterialIcons name="email" size={14} color="#6B7280" style={styles.userIcon} />
            <Text style={styles.userDetail}>{item.email || 'N/A'}</Text>
          </View>
          <View style={styles.userDetailRow}>
            <MaterialIcons name="phone" size={14} color="#6B7280" style={styles.userIcon} />
            <Text style={styles.userDetail}>{item.contact || 'N/A'}</Text>
          </View>
          <View style={styles.userDetailRow}>
            <MaterialIcons name="schedule" size={14} color="#6B7280" style={styles.userIcon} />
            <Text style={styles.userDetail}>{item.availability || 'N/A'}</Text>
          </View>
          <View style={styles.userDetailRow}>
            <MaterialIcons name="build" size={14} color="#6B7280" style={styles.userIcon} />
            <Text style={styles.userSkills}>Skills: {item.skillsHave.join(', ') || 'N/A'}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.followButton, isFollowing || isRequestSent ? styles.disabledButton : null]}
              onPress={() => handleFollow(item.id)}
              disabled={isFollowing || isRequestSent}
            >
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Followed' : isRequestSent ? 'Request Sent' : 'Follow'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => navigation.navigate('ChatScreen', { userID, recipientID: item.id })}
            >
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderFollowRequest = ({ item }) => (
    <View style={styles.requestCard}>
      <Text style={styles.requestText}>
        Follow request from {item.senderName || 'Unknown'}
      </Text>
      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAcceptRequest(item.id)}
      >
        <Text style={styles.acceptButtonText}>Accept</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#F0F4F8', '#D1DAE0']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {currentUser && (
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#4CAF50', '#2196F3']}
              style={styles.profileCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image
                source={currentUser.image ? { uri: currentUser.image } : require('../../assets/images/favicon.png')}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{currentUser.name || 'N/A'}</Text>
                <View style={styles.profileDetailRow}>
                  <MaterialIcons name="email" size={16} color="#fff" style={styles.profileIcon} />
                  <Text style={styles.profileDetail}>{currentUser.email || 'N/A'}</Text>
                </View>
                <View style={styles.profileDetailRow}>
                  <MaterialIcons name="build" size={16} color="#fff" style={styles.profileIcon} />
                  <Text style={styles.profileDetail}>
                    Skills: {currentUser.skillsHave ? currentUser.skillsHave.join(', ') : 'N/A'}
                  </Text>
                </View>
                <View style={styles.profileDetailRow}>
                  <MaterialIcons name="location-pin" size={16} color="#fff" style={styles.profileIcon} />
                  <Text style={styles.profileDetail}>{currentUser.location || 'N/A'}</Text>
                </View>
                <View style={styles.profileDetailRow}>
                  <MaterialIcons name="schedule" size={16} color="#fff" style={styles.profileIcon} />
                  <Text style={styles.profileDetail}>{currentUser.availability || 'N/A'}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {followRequests.length > 0 && (
          <View style={styles.requestsSection}>
            <Text style={styles.requestsTitle}>Follow Requests</Text>
            <FlatList
              data={followRequests}
              renderItem={renderFollowRequest}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.requestList}
              scrollEnabled={false}
            />
          </View>
        )}

        {currentUser && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>
              Skills I Want to Learn: {currentUser.skillsLearn.join(', ')}
            </Text>
          </View>
        )}

        {followersData.length > 0 && (
          <View style={styles.followersSection}>
            <Text style={styles.followersTitle}>My Followers</Text>
            <FlatList
              data={followersData}
              renderItem={renderFollower}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.followersList}
              scrollEnabled={false}
            />
          </View>
        )}

        {error !== '' && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search skills..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6B7280"
          />
        </View>

        <Text style={styles.usersTitle}>Matching Users</Text>
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.userList}
          ListEmptyComponent={<Text style={styles.noResults}>No users found with matching skills.</Text>}
          scrollEnabled={false}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  profileCardGradient: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  profileDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileIcon: {
    marginRight: 8,
  },
  profileDetail: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  requestsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requestsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  requestList: {
    gap: 10,
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  requestText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  followersSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  followersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  followersList: {
    gap: 15,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  searchIcon: {
    marginRight: 10,
  },
  usersTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A8A',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  userList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 15,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5,
  },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  userIcon: {
    marginRight: 8,
  },
  userCity: {
    fontSize: 14,
    color: '#6B7280',
  },
  userDetail: {
    fontSize: 14,
    color: '#374151',
  },
  userSkills: {
    fontSize: 14,
    color: '#374151',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  followButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noResults: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#FF0000',
    textAlign: 'center',
    marginVertical: 10,
    fontWeight: '500',
  },
});