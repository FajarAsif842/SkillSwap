import React, { useEffect, useState, useRef } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import EventSource from 'react-native-sse'; // Import react-native-sse
import 'react-native-url-polyfill/auto'; // Import URL polyfill

const ChatScreen = ({ route, navigation }) => {
  const { userID, recipientID } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const flatListRef = useRef(null);

  // Generate a consistent chat ID for both users
  const chatID = [userID, recipientID].sort().join('_');
  const messagesRef = `https://matchmatchingsystem-default-rtdb.firebaseio.com/Chats/${chatID}/messages.json`;

  useEffect(() => {
    // Fetch initial messages from Firebase
    const fetchMessages = async () => {
      try {
        const response = await fetch(messagesRef);
        const data = await response.json();
        if (data) {
          const messagesArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          // Sort messages by timestamp
          messagesArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setMessages(messagesArray);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages.');
      }
    };

    fetchMessages();

    // Set up real-time listener with react-native-sse
    const eventSource = new EventSource(messagesRef, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Event listener for SSE messages
    const listener = (event) => {
      if (event.type === 'open') {
        console.log('Open SSE connection.');
      } else if (event.type === 'message') {
        try {
          const data = JSON.parse(event.data);
          if (data) {
            const messagesArray = Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }));
            messagesArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(messagesArray);
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        } catch (err) {
          console.error('Error parsing SSE message:', err);
          setError('Failed to process message.');
        }
      } else if (event.type === 'error') {
        console.error('SSE error:', event.message);
        setError('Connection error. Please try again.');
      } else if (event.type === 'exception') {
        console.error('SSE exception:', event.message, event.error);
        setError('Unexpected error occurred.');
      }
    };

    eventSource.addEventListener('open', listener);
    eventSource.addEventListener('message', listener);
    eventSource.addEventListener('error', listener);

    // Cleanup on unmount
    return () => {
      eventSource.removeAllEventListeners();
      eventSource.close();
    };
  }, [chatID]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      setError('Message cannot be empty.');
      return;
    }

    try {
      const messageData = {
        senderID: userID,
        recipientID: recipientID,
        text: newMessage,
        timestamp: new Date().toISOString(),
      };

      await fetch(messagesRef, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      setNewMessage('');
      setError('');
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message.');
    }
  };

  const renderMessage = ({ item }) => {
    const isSentByCurrentUser = item.senderID === userID;
    return (
      <View
        style={[
          styles.messageContainer,
          isSentByCurrentUser ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#F0F4F8', '#D1DAE0']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>
      {error !== '' && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={<Text style={styles.noMessages}>No messages yet.</Text>}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          placeholderTextColor="#6B7280"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <MaterialIcons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  messageList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 5,
  },
  sentMessage: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    color: '#E5E7EB',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  messageInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 25,
    marginLeft: 10,
  },
  noMessages: {
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
  },
});

export default ChatScreen;