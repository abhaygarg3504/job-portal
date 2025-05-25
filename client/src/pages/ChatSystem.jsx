import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

const ChatSystem = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
        
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarWidth, setSidebarWidth] = useState(30); // in percentage
  const [isResizing, setIsResizing] = useState(false);
  const { user } = useUser();
  const { getToken } = useAuth();
  const { backendURL, companyData, isRecruiter, contacts, filteredContacts,
     setFilteredContacts, setContacts, socket
  } = useContext(AppContext);

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

    setFilteredContacts(filtered);
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  const handleBack = () => {
    setSelectedContact(null);
  };

const sendMessage = async ({ senderId, senderModel, receiverId, receiverModel, message, image }) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      `${backendURL}/api/messages/send/${senderId}?senderId=${senderId}&senderModel=${senderModel}&receiverId=${receiverId}&receiverModel=${receiverModel}`,
      { message, image },
      {
        headers: {
          Authorization: `Bearer ${token}`,
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

const handleSendMessage = async () => {
  if (!message.trim() || !selectedContact) return;

  const senderId = isRecruiter ? recruiterId : userId;
  const senderModel = isRecruiter ? "Company" : "User";
  const receiverId = isRecruiter
    ? selectedContact?.userId?._id
    : selectedContact?.recruiterId?._id;
  const receiverModel = isRecruiter ? "User" : "Company";

  const newMessage = await sendMessage({
    senderId,
    senderModel,
    receiverId,
    receiverModel,
    message,
    image: null,
  });

  if (newMessage) {
    socket.emit("sendMessage", newMessage);
    setMessages((prev) => [...prev, newMessage]);
  }

  setMessage("");
};

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File to upload:", file);
    }
  };

  console.log(selectedContact)

 const fetchMessages = async ({ senderId, senderModel, receiverId, receiverModel }) => {
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
      },
    });

    if (data.success) {
      setMessages(data.messages);
    } else {
      toast.error("Failed to load messages");
    }
  } catch (err) {
    console.error("Error fetching messages:", err);
    toast.error("Error fetching messages");
  }
};


useEffect(() => {
  if (!selectedContact) return;

  const senderId = isRecruiter ? recruiterId : userId;
  const senderModel = isRecruiter ? "Company" : "User";
  const receiverId = isRecruiter
    ? selectedContact?.userId?._id
    : selectedContact?.recruiterId?._id;
  const receiverModel = isRecruiter ? "User" : "Company";

  fetchMessages({
    senderId,
    senderModel,
    receiverId,
    receiverModel,
  });
}, [selectedContact, isRecruiter, recruiterId, userId]);

console.log(selectedContact)
useEffect(() => {
  if (!socket) return;

  const handleIncomingMessage = (newMessage) => {
    const senderId = isRecruiter ? recruiterId : userId;
    const receiverId = isRecruiter
      ? selectedContact?.userId?._id
      : selectedContact?.recruiterId?._id;

    const isRelated =
      (newMessage.senderId === senderId && newMessage.receiverId === receiverId) ||
      (newMessage.senderId === receiverId && newMessage.receiverId === senderId);

    if (isRelated) {
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  socket.on("receiveMessage", handleIncomingMessage);
  return () => socket.off("receiveMessage", handleIncomingMessage);
}, [socket, selectedContact, isRecruiter, recruiterId, userId]);


  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`w-full md:w-[30%] bg-gray-100 border-r overflow-y-auto p-4 ${
          isMobile && selectedContact ? "hidden" : "block"
        }`}
        style={{
      width: isMobile ? "100%" : `${sidebarWidth}%`,
      minWidth: isMobile ? "100%" : "20%",
      maxWidth: isMobile ? "100%" : "50%",
    }}
      >
        <h2 className="text-xl font-bold mb-4">
          {isRecruiter ? "Applicants" : "Companies"}
        </h2>

        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-2 mb-4 border rounded"
        />

        {filteredContacts.length === 0 && <div>No contacts found.</div>}

        {filteredContacts.map((contact) => {
          const displayName = isRecruiter
            ? contact?.userId?.name || "Unknown User"
            : contact?.recruiterId?.name || "Unknown Company";

          const displayJob = contact?.jobTitle || "No job title";
          const image = isRecruiter
            ? contact?.userId?.image
            : contact?.recruiterId?.image;

          const isOnline = isRecruiter
            ? contact?.isUserOnline
            : contact?.isRecruiterOnline;

          return (
            <div
              key={contact._id}
              className={`p-3 bg-white shadow mb-3 rounded cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                selectedContact?._id === contact._id ? "bg-blue-100" : ""
              }`}
              onClick={() => handleSelectContact(contact)}
            >
              <div>
                <div className="font-semibold">{displayName}</div>
                <div className="text-sm text-gray-500">{displayJob}</div>
              </div>
              <div
                className={`ml-2 w-3 h-3 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
                title={isOnline ? "Online" : "Offline"}
              />
            </div>
          );
        })}
      </div>

      {/* Resizer */}
  {!isMobile && (
    <div
      className="w-1 bg-gray-300 hover:bg-gray-500 cursor-col-resize"
      onMouseDown={() => setIsResizing(true)}
      style={{ zIndex: 10 }}
    />
  )}


      {/* Chat Area */}
      <div
        className={`w-full md:w-[70%] flex flex-col border-l ${
          isMobile && !selectedContact ? "hidden" : "block"
        }`}
      >
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="flex items-center border-b p-4">
              {isMobile && (
                <button
                  onClick={handleBack}
                  className="mr-4 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Back
                </button>
              )}
              <img
                src={
                  isRecruiter
                    ? selectedContact.userId?.image || "/default-user.png"
                    : selectedContact.recruiterId?.image ||
                      "/default-company.png"
                }
                alt="Contact"
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <div className="font-semibold text-lg">
                  {isRecruiter
                    ? selectedContact.userId?.name || "Unknown User"
                    : selectedContact.recruiterId?.name || "Unknown Company"}
                </div>
                <marquee className="text-sm text-gray-600">
                  {selectedContact.jobTitle || "No job title"}
                </marquee>
              </div>
            </div>

            {/* Messages */}
<div className="flex-grow p-4 overflow-y-auto bg-white flex flex-col gap-2">
  {messages.length === 0 && (
    <div className="text-center text-gray-500">No messages yet.</div>
  )}

  {messages.map((msg) => {
    const isSender = isRecruiter
      ? msg.senderId === recruiterId
      : msg.senderId === userId;

    return (
      <div
        key={msg._id}
        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`px-4 py-2 rounded-lg max-w-xs ${
            isSender ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
        >
          {msg.message}
        </div>
      </div>
    );
  })}
</div>

{/* Input Area */}
<div className="border-t p-4 flex gap-2 items-center">
  <input
    type="text"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleSendMessage();
    }}
    placeholder="Type your message..."
    className="flex-grow border rounded p-2"
  />
  <input
    type="file"
    accept="image/*"
    className="hidden"
    id="file-upload"
    onChange={handleFileUpload}
  />
  <label htmlFor="file-upload" className="cursor-pointer px-2 py-1 rounded bg-gray-300 hover:bg-gray-400">
    📎
  </label>
  <button
    onClick={handleSendMessage}
    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    Send
  </button>
</div>

          </>
        ) : (
          <div className="space-y-2">
  {messages.map((msg) => {
    const isOwnMessage = isRecruiter
      ? msg.senderId === recruiterId
      : msg.senderId === userId;

    return (
      <div
        key={msg._id}
        className={`max-w-[70%] p-2 rounded-lg text-sm shadow ${
          isOwnMessage
            ? "bg-blue-500 text-white ml-auto"
            : "bg-gray-200 text-gray-800 mr-auto"
        }`}
      >
        {msg.text}
      </div>
    );
  })}
</div>

        )}
      </div>
    </div>
  );
};

export default ChatSystem;
