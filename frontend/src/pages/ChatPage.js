import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Hash, Plus, Send, Image, Smile, Settings, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import io from 'socket.io-client';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatPage = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [directMessages, setDirectMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' or 'direct'
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // For demo purposes, using John Smith's ID. In real app, this would come from auth context
  const DEMO_USER_ID = '54bee40c-826f-4aa5-b770-2242e397086f';

  useEffect(() => {
    initializeChat();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, directMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      // Get current user data
      const userResponse = await axios.get(`${API}/users/${DEMO_USER_ID}`);
      const userData = userResponse.data;
      
      if (!userData.is_verified_alumni) {
        alert('Access denied. Verified alumni only.');
        navigate('/users');
        return;
      }

      setCurrentUser(userData);

      // Initialize WebSocket connection
      const newSocket = io(BACKEND_URL);
      setSocket(newSocket);

      // Socket event listeners
      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        setIsConnected(true);
        
        // Join user to chat system
        newSocket.emit('join_user', {
          user_id: userData.id,
          user_name: userData.name
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
      });

      newSocket.on('user_joined', (data) => {
        console.log('User joined:', data);
      });

      newSocket.on('joined_room', (data) => {
        console.log('Joined room:', data);
      });

      newSocket.on('new_message', (messageData) => {
        console.log('New message:', messageData);
        if (currentRoom && messageData.room_id === currentRoom.id) {
          setMessages(prev => [...prev, messageData]);
        }
      });

      newSocket.on('new_direct_message', (messageData) => {
        console.log('New direct message:', messageData);
        if (activeConversation) {
          const otherUserId = activeConversation.other_user_id;
          if (messageData.sender_id === otherUserId || messageData.receiver_id === otherUserId) {
            setDirectMessages(prev => [...prev, messageData]);
          }
        }
        // Update conversations list
        fetchConversations();
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        alert(error.message);
      });

      // Fetch initial data
      await fetchChatRooms(userData.id);
      await fetchConversations();

    } catch (err) {
      console.error('Error initializing chat:', err);
      alert('Failed to initialize chat. Please try again.');
    }
  };

  const fetchChatRooms = async (userId) => {
    try {
      const response = await axios.get(`${API}/chat-rooms?user_id=${userId}`);
      setChatRooms(response.data);
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API}/direct-messages/conversations?user_id=${DEMO_USER_ID}`);
      setConversations(response.data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const joinRoom = async (room) => {
    if (socket && room) {
      setCurrentRoom(room);
      setActiveConversation(null);
      setActiveTab('rooms');
      
      socket.emit('join_room', { room_id: room.id });
      
      // Fetch room messages
      try {
        const response = await axios.get(`${API}/chat-rooms/${room.id}/messages?user_id=${DEMO_USER_ID}`);
        setMessages(response.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    }
  };

  const openDirectMessage = async (conversation) => {
    setActiveConversation(conversation);
    setCurrentRoom(null);
    setActiveTab('direct');
    
    // Fetch direct messages
    try {
      const response = await axios.get(`${API}/direct-messages?user_id=${DEMO_USER_ID}&other_user_id=${conversation.other_user_id}`);
      setDirectMessages(response.data);
    } catch (err) {
      console.error('Error fetching direct messages:', err);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    if (currentRoom) {
      // Send room message
      socket.emit('send_message', {
        room_id: currentRoom.id,
        content: newMessage,
        message_type: 'text'
      });
    } else if (activeConversation) {
      // Send direct message
      socket.emit('send_direct_message', {
        receiver_id: activeConversation.other_user_id,
        content: newMessage,
        message_type: 'text'
      });
    }

    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/chat-images/upload?user_id=${currentUser.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const imageUrl = response.data.image_url;
      
      if (currentRoom && socket) {
        socket.emit('send_message', {
          room_id: currentRoom.id,
          content: 'Shared an image',
          message_type: 'image',
          image_url: imageUrl
        });
      } else if (activeConversation && socket) {
        socket.emit('send_direct_message', {
          receiver_id: activeConversation.other_user_id,
          content: 'Shared an image',
          message_type: 'image',
          image_url: imageUrl
        });
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image');
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoomTypeIcon = (roomType) => {
    switch (roomType) {
      case 'cohort': return <Hash className="w-4 h-4" />;
      case 'program_track': return <Users className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">ICAA Chat</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={currentUser.profile_photo_url ? `${BACKEND_URL}${currentUser.profile_photo_url}` : undefined} 
                alt={currentUser.name} 
              />
              <AvatarFallback className="bg-red-600 text-white">
                {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-sm text-gray-500">{currentUser.cohort} • {currentUser.program_track}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'rooms'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Hash className="w-4 h-4 inline-block mr-2" />
            Rooms
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'direct'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline-block mr-2" />
            Messages
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'rooms' ? (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Chat Rooms</h3>
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {chatRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => joinRoom(room)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 ${
                    currentRoom?.id === room.id ? 'bg-red-50 border border-red-200' : ''
                  }`}
                >
                  <div className="text-gray-500">
                    {getRoomTypeIcon(room.room_type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{room.name}</p>
                    <p className="text-sm text-gray-500">{room.description}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Direct Messages</h3>
              </div>
              
              {conversations.map((conv) => (
                <button
                  key={conv.other_user_id}
                  onClick={() => openDirectMessage(conv)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 ${
                    activeConversation?.other_user_id === conv.other_user_id ? 'bg-red-50 border border-red-200' : ''
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                      {conv.other_user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{conv.other_user_name}</p>
                      {conv.unread_count > 0 && (
                        <Badge className="bg-red-600 text-white text-xs">{conv.unread_count}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.latest_message?.content || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom || activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    {currentRoom ? getRoomTypeIcon(currentRoom.room_type) : <MessageCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {currentRoom ? currentRoom.name : activeConversation.other_user_name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {currentRoom ? currentRoom.description : 'Direct message'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(currentRoom ? messages : directMessages).map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex gap-3 ${
                    message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender_id !== currentUser.id && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                        {message.sender_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md ${
                    message.sender_id === currentUser.id ? 'order-first' : ''
                  }`}>
                    {message.sender_id !== currentUser.id && (
                      <p className="text-xs text-gray-500 mb-1">{message.sender_name}</p>
                    )}
                    
                    <div className={`rounded-lg p-3 ${
                      message.sender_id === currentUser.id
                        ? 'bg-red-600 text-white ml-auto'
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      {message.message_type === 'image' && message.image_url ? (
                        <div>
                          <img
                            src={`${BACKEND_URL}${message.image_url}`}
                            alt="Shared image"
                            className="max-w-full h-auto rounded mb-1"
                          />
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      
                      <p className={`text-xs mt-1 ${
                        message.sender_id === currentUser.id ? 'text-red-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>

                  {message.sender_id === currentUser.id && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={currentUser.profile_photo_url ? `${BACKEND_URL}${currentUser.profile_photo_url}` : undefined} 
                        alt={currentUser.name} 
                      />
                      <AvatarFallback className="bg-red-600 text-white text-xs">
                        {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Image className="w-5 h-5" />
                </Button>
                
                <div className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${currentRoom ? currentRoom.name : activeConversation?.other_user_name}...`}
                    className="resize-none"
                  />
                </div>
                
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to ICAA Chat</h3>
              <p className="text-gray-500">Select a room or conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;