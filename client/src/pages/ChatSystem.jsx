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
  if (!message.trim() && !file) return;
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
    socket.emit("sendMessage", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setFile(null); // reset file after sending
  }
};


  console.log(selectedContact)

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
  const jobTitle = selectedContact?.jobTitle;

  fetchMessages({
    senderId,
    senderModel,
    receiverId,
    receiverModel,
    jobTitle,
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

    const jobTitle = selectedContact?.jobTitle;

    const senderKey = `${newMessage.senderId}_${newMessage.senderModel}_${newMessage.jobTitle}`;
    const receiverKey = `${receiverId}_${isRecruiter ? "User" : "Company"}_${jobTitle}`;
    const myKey = `${senderId}_${isRecruiter ? "Company" : "User"}_${jobTitle}`;

    const isRelated =
      senderKey === myKey || senderKey === receiverKey;

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
                <div className="text-sm text-gray-500">
                  {selectedContact?.jobTitle || "No job title"}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
              {messages.map((msg, index) => {
                const isMine = (isRecruiter && msg.senderModel === "Company") ||
                               (!isRecruiter && msg.senderModel === "User");

                return (
                  <div
                    key={index}
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      isMine
                        ? "bg-blue-500 text-white self-end ml-auto"
                        : "bg-gray-200 text-black self-start mr-auto"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="sent file"
                        className="mb-2 max-w-full max-h-60 rounded"
                      />
                    )}
                    <div>{msg.message}</div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-3 py-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400"
              >
                📎
              </label>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a contact to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;
