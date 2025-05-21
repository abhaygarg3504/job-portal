import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useUser, useAuth } from "@clerk/clerk-react";

const ChatSystem = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const location = useLocation();
  const isRecruiter = location.pathname.includes("/dashboard");

  const { user } = useUser();
  const { getToken } = useAuth();
  const { backendURL, companyData } = useContext(AppContext);

  const userId = user?.id;
  const recruiterId = companyData?._id;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const params = isRecruiter ? { recruiterId } : { userId };
        const token = await getToken();
        const { data } = await axios.get(`${backendURL}/api/contacts`, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (data.success) {
          const sortedContacts = data.contacts.sort((a, b) => {
            const aOnline = isRecruiter ? a.isUserOnline : a.isRecruiterOnline;
            const bOnline = isRecruiter ? b.isUserOnline : b.isRecruiterOnline;
            return bOnline - aOnline;
          });
          setContacts(sortedContacts);
          setFilteredContacts(sortedContacts);
        }
      } catch (err) {
        console.error("Failed to fetch contacts", err);
        setContacts([]);
        setFilteredContacts([]);
      }
    };

    if ((isRecruiter && recruiterId) || (!isRecruiter && userId)) {
      fetchContacts();
    }
  }, [isRecruiter, userId, recruiterId, backendURL]);

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

  const handleSendMessage = () => {
    console.log("Send message:", message);
    setMessage("");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File to upload:", file);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`w-full md:w-[30%] bg-gray-100 border-r overflow-y-auto p-4 ${
          isMobile && selectedContact ? "hidden" : "block"
        }`}
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
            <div className="flex-grow p-4 overflow-y-auto bg-white">
              <div className="text-center text-gray-400 mt-10">
                💬 Chat messages will appear here.
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t flex items-center space-x-2 bg-gray-50">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow p-2 border rounded"
              />
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="fileUpload"
                className="cursor-pointer px-3 py-2 bg-gray-300 rounded hover:bg-gray-400"
                title="Upload document"
              >
                📎
              </label>
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-400 text-center p-4">
            💬 Select a contact to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;
