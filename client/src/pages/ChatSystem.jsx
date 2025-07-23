import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { useRef } from "react";
import { format, isToday, isYesterday } from "date-fns";
import Navbar from "../components/Navbar";

const ChatSystem = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);     
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarWidth, setSidebarWidth] = useState(30);
  const [isResizing, setIsResizing] = useState(false);
  const [isSending, setIsSending] = useState(false); // Prevent multiple sends
  const { user } = useUser();
  const { getToken } = useAuth();
  const { 
    backendURL, 
    companyData, 
    isRecruiter, 
    contacts, 
    filteredContacts,
    setFilteredContacts, 
    setContacts, 
    socket 
  } = useContext(AppContext);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({}); // Store last message for each contact

  const userId = user?.id;
  const recruiterId = companyData?._id;
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || isMobile) return;

      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth >= 20 && newWidth <= 50) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = contacts.filter((contact) => {
      const name = isRecruiter
        ? contact?.userId?.name
        : contact?.recruiterId?.name;
      return name?.toLowerCase().includes(query);
    });

    // Sort filtered contacts by last message time
    const sortedFiltered = sortContactsByLastMessage(filtered);
    setFilteredContacts(sortedFiltered);
  };

  // Function to sort contacts by last message time
  const sortContactsByLastMessage = (contactsToSort) => {
    return contactsToSort.sort((a, b) => {
      const keyA = getContactKey(a);
      const keyB = getContactKey(b);
      
      const lastMsgA = lastMessages[keyA];
      const lastMsgB = lastMessages[keyB];
      
      // If both have messages, sort by timestamp (newest first)
      if (lastMsgA && lastMsgB) {
        return new Date(lastMsgB.timestamp) - new Date(lastMsgA.timestamp);
      }
      
      // If only one has messages, prioritize it
      if (lastMsgA && !lastMsgB) return -1;
      if (!lastMsgA && lastMsgB) return 1;
      
      // If neither has messages, maintain original order
      return 0;
    });
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  const msgRef = useRef(null);

  const handleBack = () => {
    setSelectedContact(null);
  };

  const sendMessage = async ({
    senderId,
    senderModel,
    receiverId,
    receiverModel,
    jobTitle,
    message,
    image,
  }) => {
    try {
      const token = await getToken();
      
      const formData = new FormData();
      formData.append("message", message);
      if (image) formData.append("image", image);
      formData.append("jobTitle", jobTitle);

      const response = await axios.post(
        `${backendURL}/api/messages/send/${senderId}?senderId=${senderId}&senderModel=${senderModel}&receiverId=${receiverId}&receiverModel=${receiverModel}&jobTitle=${jobTitle}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        return response.data.newMessage;
      } else {
        toast.error("Failed to send message");
        return null;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");
      return null;
    }
  };

  const [file, setFile] = useState(null);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !file) || isSending) return;
    
    setIsSending(true); // Prevent multiple sends
    
    const senderId = isRecruiter ? recruiterId : userId;
    const senderModel = isRecruiter ? "Company" : "User";
    const receiverId = isRecruiter
      ? selectedContact?.userId?._id
      : selectedContact?.recruiterId?._id;
    const receiverModel = isRecruiter ? "User" : "Company";
    const jobTitle = selectedContact?.jobTitle;

    const newMessage = await sendMessage({
      senderId,
      senderModel,
      receiverId,
      receiverModel,
      jobTitle,
      message,
      image: file,
    });

    if (newMessage) {
      socket?.emit("sendMessage", newMessage);
      setMessages((prev) => [...prev, newMessage]);
      
      // Update last message for contact sorting
      const contactKey = getContactKey(selectedContact);
      setLastMessages(prev => ({
        ...prev,
        [contactKey]: {
          message: message || "📎 File attachment",
          timestamp: new Date().toISOString(),
          isUnread: false // Since it's our message
        }
      }));
      
      setMessage("");
      setFile(null);
      
      // Resort contacts after sending message
      const sortedContacts = sortContactsByLastMessage([...filteredContacts]);
      setFilteredContacts(sortedContacts);
    }
    
    setIsSending(false); // Re-enable sending
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const fetchMessages = async ({
    senderId,
    senderModel,
    receiverId,
    receiverModel,
    jobTitle,
  }) => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendURL}/api/messages/${senderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          role: senderModel,
          withId: receiverId,
          withModel: receiverModel,
          jobTitle,
        },
      });

      if (data.success) {
        setMessages(data.messages);

        const unreadMessages = data.messages.filter((msg) => !msg.isRead && msg.receiverId === (isRecruiter ? recruiterId : userId));
        unreadMessages.forEach((msg) => markMessageAsRead(msg._id));

        const key = `${receiverId}_${receiverModel}_${jobTitle}`;
        setUnreadCounts((prev) => ({ ...prev, [key]: 0 }));
      } else {
        toast.error("Failed to load messages");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Error fetching messages");
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      let label;
      if (isToday(date)) {
        label = "Today";
      } else if (isYesterday(date)) {
        label = "Yesterday";
      } else {
        label = format(date, "dd MMM yyyy");
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(msg);
    });
    return Object.entries(groups).map(([label, msgs]) => ({ label, messages: msgs }));
  };

  const fetchUnreadCounts = async () => {
    try {
      const token = await getToken();
      const receiverId = isRecruiter ? recruiterId : userId;
      const receiverModel = isRecruiter ? "Company" : "User";

      const { data } = await axios.get(
        `${backendURL}/api/messages/unread-count/${receiverId}?receiverModel=${receiverModel}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        const counts = {};
        const lastMsgs = {};
        
        data.counts.forEach((item) => {
          const key = `${item.senderId}_${item.senderModel}_${item.jobTitle}`;
          counts[key] = item.unreadCount;
          
          // Store last message info if available
          if (item.lastMessage) {
            lastMsgs[key] = {
              message: item.lastMessage.message || "📎 File attachment",
              timestamp: item.lastMessage.createdAt,
              isUnread: item.unreadCount > 0
            };
          }
        });
        
        setUnreadCounts(counts);
        setLastMessages(lastMsgs);
        
        // Resort contacts when data loads
        if (contacts.length > 0) {
          const sortedContacts = sortContactsByLastMessage([...contacts]);
          setFilteredContacts(sortedContacts);
        }
      }
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  };

  const getContactKey = (contact) => {
    const senderId = isRecruiter ? contact?.userId?._id : contact?.recruiterId?._id;
    const senderModel = isRecruiter ? "User" : "Company";
    const jobTitle = contact?.jobTitle;
    return `${senderId}_${senderModel}_${jobTitle}`;
  };

  useEffect(() => {
    if (contacts.length > 0) {
      fetchUnreadCounts();
    }
  }, [contacts, isRecruiter, recruiterId, userId]);

  useEffect(() => {
    if (!selectedContact) return;

    const senderId = isRecruiter ? recruiterId : userId;
    const senderModel = isRecruiter ? "Company" : "User";
    const receiverId = isRecruiter
      ? selectedContact?.userId?._id
      : selectedContact?.recruiterId?._id;
    const receiverModel = isRecruiter ? "User" : "Company";
    const jobTitle = selectedContact?.jobTitle;

    fetchMessages({
      senderId,
      senderModel,
      receiverId,
      receiverModel,
      jobTitle,
    });
  }, [selectedContact, isRecruiter, recruiterId, userId]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (newMessage) => {
      const senderId = isRecruiter ? recruiterId : userId;
      const receiverId = isRecruiter
        ? selectedContact?.userId?._id
        : selectedContact?.recruiterId?._id;

      const jobTitle = selectedContact?.jobTitle;

      const senderKey = `${newMessage.senderId}_${newMessage.senderModel}_${newMessage.jobTitle}`;
      const receiverKey = `${receiverId}_${isRecruiter ? "User" : "Company"}_${jobTitle}`;
      const myKey = `${senderId}_${isRecruiter ? "Company" : "User"}_${jobTitle}`;

      const isRelated = senderKey === myKey || senderKey === receiverKey;

      if (isRelated) {
        setMessages((prev) => [...prev, newMessage]);
      }

      // Update last message for any contact (even if not currently selected)
      const contactKey = senderKey;
      setLastMessages(prev => ({
        ...prev,
        [contactKey]: {
          message: newMessage.message || "📎 File attachment",
          timestamp: newMessage.createdAt,
          isUnread: newMessage.receiverId === (isRecruiter ? recruiterId : userId)
        }
      }));

      // Resort contacts when new message arrives
      setTimeout(() => {
        const sortedContacts = sortContactsByLastMessage([...filteredContacts]);
        setFilteredContacts(sortedContacts);
      }, 100);
    };

    socket.on("receiveMessage", handleIncomingMessage);
    return () => socket.off("receiveMessage", handleIncomingMessage);
  }, [socket, selectedContact, isRecruiter, recruiterId, userId, filteredContacts]);

  const markMessageAsRead = async (messageId) => {
    try {
      const token = await getToken();
      await axios.get(`${backendURL}/api/messages/mark/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to mark message as read", error);
    }
  };

  const scrollToBottom = () => {
    if (msgRef.current) {
      msgRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50">
      {!isRecruiter && <Navbar />}
      
      <div className="flex h-screen bg-white shadow-xl rounded-lg overflow-hidden mx-4 my-4">
        
        {/* Sidebar */}
        <div
          className={`bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 ${
            isMobile && selectedContact ? "hidden" : "block"
          }`}
          style={{
            width: isMobile ? "100%" : `${sidebarWidth}%`,
            minWidth: isMobile ? "100%" : "20%",
            maxWidth: isMobile ? "100%" : "50%",
          }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {isRecruiter ? "💼 Applicants" : "🏢 Companies"}
            </h2>
            
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Search contacts..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="overflow-y-auto h-full pb-20">
            {filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No contacts found</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredContacts.map((contact) => {
                  const displayName = isRecruiter
                    ? contact?.userId?.name || "Unknown User"
                    : contact?.recruiterId?.name || "Unknown Company";
                  
                  const contactKey = getContactKey(contact);
                  const unreadCount = unreadCounts[contactKey] || 0;
                  const displayJob = contact?.jobTitle || "No job title";
                  const image = isRecruiter
                    ? contact?.userId?.image
                    : contact?.recruiterId?.image;

                  const lastMessage = lastMessages[contactKey];

                  return (
                    <div
                      key={contact._id}
                      className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                        selectedContact?._id === contact._id 
                          ? "bg-blue-100 border-2 border-blue-300 shadow-md" 
                          : "bg-white hover:bg-gray-50 border border-gray-100"
                      }`}
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="relative">
                          <img
                            src={image || "/default-avatar.png"}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        </div>
                        
                        {/* Contact Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">
                            {displayName}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {displayJob}
                          </div>
                          {/* Last Message Preview */}
                          {lastMessage && (
                            <div className={`text-xs mt-1 truncate ${
                              lastMessage.isUnread ? 'text-blue-600 font-medium' : 'text-gray-400'
                            }`}>
                              {lastMessage.message}
                            </div>
                          )}
                        </div>
                        
                        {/* Right side - Time and Unread count */}
                        <div className="flex flex-col items-end space-y-1">
                          {/* Time */}
                          {lastMessage && (
                            <div className="text-xs text-gray-400">
                              {format(new Date(lastMessage.timestamp), 
                                isToday(new Date(lastMessage.timestamp)) ? 'HH:mm' : 'dd/MM'
                              )}
                            </div>
                          )}
                          
                          {/* Unread Badge */}
                          {unreadCount > 0 && (
                            <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Resizer */}
        {!isMobile && (
          <div
            className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors duration-200"
            onMouseDown={() => setIsResizing(true)}
            style={{ zIndex: 10 }}
          />
        )}

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-white ${
            isMobile && !selectedContact ? "hidden" : "block"
          }`}
        >
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-4">
                  {isMobile && (
                    <button
                      onClick={handleBack}
                      className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      ← Back
                    </button>
                  )}
                  
                  <img
                    src={
                      isRecruiter
                        ? selectedContact.userId?.image || "/default-user.png"
                        : selectedContact.recruiterId?.image || "/default-company.png"
                    }
                    alt="Contact"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      {isRecruiter
                        ? selectedContact.userId?.name || "Unknown User"
                        : selectedContact.recruiterId?.name || "Unknown Company"}
                    </div>
                    <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                      💼 {selectedContact?.jobTitle || "No job title"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white" style={{ minHeight: 'calc(100vh - 200px)' }}>
                <div className="space-y-4 pb-4">
                  {groupMessagesByDate(messages).map((group, idx) => (
                    <div key={group.label + idx}>
                      {/* Date Separator */}
                      <div className="flex justify-center my-6">
                        <span className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-xs font-semibold shadow-sm">
                          {group.label}
                        </span>
                      </div>
                      
                      {/* Messages */}
                      {group.messages.map((msg, index) => {
                        const isMine = (isRecruiter && msg.senderModel === "Company") ||
                                       (!isRecruiter && msg.senderModel === "User");
                        return (
                          <div
                            key={msg._id || index}
                            className={`flex ${isMine ? "justify-end" : "justify-start"} mb-4`}
                          >
                            <div
                              className={`max-w-md px-4 py-3 rounded-2xl shadow-md ${
                                isMine
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                  : "bg-white text-gray-800 border border-gray-200"
                              }`}
                            >
                              {msg.image && (
                                <img
                                  src={msg.image}
                                  alt="attachment"
                                  className="mb-2 max-w-full max-h-60 rounded-lg"
                                />
                              )}
                              <div className="whitespace-pre-wrap">{msg.message}</div>
                              
                              {/* Message Footer */}
                              <div className={`flex items-center justify-end space-x-2 mt-2 text-xs ${
                                isMine ? "text-blue-100" : "text-gray-500"
                              }`}>
                                <span>
                                  {format(new Date(msg.createdAt), "hh:mm a")}
                                </span>
                                
                                {/* Read Status */}
                                {isMine && (
                                  <span className={`${msg.isRead ? "text-blue-200" : "text-gray-300"}`}>
                                    {msg.isRead ? "✓✓" : "✓"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={msgRef}></div>
                </div>
              </div>

              {/* Message Input - Fixed at bottom */}
              <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-white shadow-lg">
                {file && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">📎 {file.name}</span>
                      <button
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-end space-x-4">
                  <div className="flex-1 relative">
                    <textarea
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 transition-all duration-200 shadow-sm"
                      rows="1"
                      style={{ minHeight: '52px' }}
                    />
                  </div>
                  
                  {/* File Upload */}
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="p-4 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer transition-colors duration-200 border border-gray-300 shadow-sm hover:shadow-md"
                  >
                    📎
                  </label>
                  
                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || (!message.trim() && !file)}
                    className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-200 ${
                      isSending || (!message.trim() && !file)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                    }`}
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-b from-gray-50 to-white">
              <div className="text-8xl mb-4">💬</div>
              <h3 className="text-2xl font-semibold mb-2">Welcome to Chat</h3>
              <p className="text-lg">Select a contact to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
