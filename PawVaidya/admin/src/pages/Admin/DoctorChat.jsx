import React, { useContext, useEffect, useState, useRef } from 'react';
import { AdminContext } from '../../context/AdminContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const DoctorChat = () => {
    const { atoken, backendurl } = useContext(AdminContext);
    const [conversations, setConversations] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [socket, setSocket] = useState(null);
    const [adminId, setAdminId] = useState(null);
    const messagesEndRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Initialize socket and fetch admin ID
    useEffect(() => {
        if (atoken) {
            const newSocket = io(backendurl);
            setSocket(newSocket);
            const fetchAdminId = async () => {
                try {
                    const profileRes = await axios.get(`${backendurl}/api/admin/profile`, { headers: { atoken } });
                    if (profileRes.data.success) {
                        const id = profileRes.data.admin._id;
                        setAdminId(id);
                        newSocket.emit('join-direct-chat', id);
                    }
                } catch (err) {
                    console.error('Failed to fetch admin profile:', err);
                }
            };
            fetchAdminId();
        }
        return () => socket?.disconnect();
    }, [atoken, backendurl]);

    // Manage file preview URL
    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setFilePreview(objectUrl);
            console.log('File selected:', file.name, file.type);

            // Cleanup
            return () => {
                URL.revokeObjectURL(objectUrl);
            };
        } else {
            setFilePreview(null);
        }
    }, [file]);

    // Fetch Conversations
    useEffect(() => {
        if (atoken) {
            fetchConversations();
        }
    }, [atoken]);

    const fetchConversations = async () => {
        try {
            const { data } = await axios.post(`${backendurl}/api/chat/direct/admin-conversations`, {}, {
                headers: { atoken }
            });
            if (data.success) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch Messages when doctor selected
    useEffect(() => {
        if (selectedDoctor && atoken && adminId) {
            fetchMessages();
            // Mark as read
            markAsRead();
        }
    }, [selectedDoctor, atoken, adminId]);

    const fetchMessages = async () => {
        try {
            // Ensure adminId and selectedDoctor are available
            if (!adminId || !selectedDoctor) return;
            // Join socket room (if not already joined)
            socket?.emit('join-direct-chat', adminId);

            // Set up listener (avoid duplicate listeners)
            socket?.off('receive-direct-message');
            socket?.on('receive-direct-message', (message) => {
                if (message.senderId === selectedDoctor._id || message.receiverId === selectedDoctor._id) {
                    setMessages((prev) => [...prev, message]);
                    scrollToBottom();
                }
                fetchConversations();
            });

            const { data } = await axios.get(
                `${backendurl}/api/chat/direct/history/${adminId}/${selectedDoctor._id}`,
                { headers: { atoken } }
            );
            if (data.success) {
                setMessages(data.messages);
                scrollToBottom();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const markAsRead = async () => {
        try {
            if (!adminId || !selectedDoctor) return;
            await axios.post(`${backendurl}/api/chat/direct/mark-read`, {
                senderId: selectedDoctor._id,
                receiverId: adminId
            }, { headers: { atoken } });
            fetchConversations();
        } catch (error) {
            console.error(error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !file) return;
        if (!adminId || !selectedDoctor) return;

        try {
            let fileUrl = null;
            let fileType = null;
            let fileName = null;

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await axios.post(`${backendurl}/api/chat/upload-file`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data.success) {
                    fileUrl = uploadRes.data.fileUrl;
                    fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
                    fileName = file.name;
                }
            }

            const messageData = {
                senderId: adminId,
                senderModel: 'Admin',
                receiverId: selectedDoctor._id,
                receiverModel: 'Doctor',
                message: newMessage,
                fileUrl,
                fileType,
                fileName
            };

            const { data } = await axios.post(`${backendurl}/api/chat/direct/send`, messageData, {
                headers: { atoken }
            });

            if (data.success) {
                setMessages([...messages, data.data]);
                setNewMessage('');
                setFile(null);
                scrollToBottom();
                fetchConversations();
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const filteredConversations = conversations.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
            <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-lg overflow-hidden m-5">
                {/* Sidebar */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">💬 Doctor Chat</h2>
                        <input
                            type="text"
                            placeholder="Search doctors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.map((doc) => (
                            <div
                                key={doc._id}
                                onClick={() => setSelectedDoctor(doc)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedDoctor?._id === doc._id ? 'bg-green-50 border-l-4 border-green-500' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={doc.image} alt={doc.name} className="w-12 h-12 rounded-full object-cover" />
                                        {doc.available && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-semibold text-gray-800 truncate">{doc.name}</h3>
                                            {doc.lastMessageTime && (
                                                <span className="text-xs text-gray-500">
                                                    {new Date(doc.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-sm text-gray-600 truncate w-3/4">
                                                {doc.lastMessage || <span className="italic text-gray-400">No messages yet</span>}
                                            </p>
                                            {doc.unreadCount > 0 && (
                                                <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                    {doc.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {selectedDoctor ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-4 shadow-sm">
                                <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <h3 className="font-bold text-gray-800">{selectedDoctor.name}</h3>
                                    <p className="text-xs text-green-600 font-medium">{selectedDoctor.available ? 'Online' : 'Offline'}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${msg.senderModel === 'Admin' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <div className={`max-w-[70%] rounded-2xl p-4 shadow-md transition-all hover:shadow-lg ${msg.senderModel === 'Admin' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                                            {msg.fileUrl && (
                                                <div className="mb-2">
                                                    {msg.fileType === 'image' ? (
                                                        <img src={msg.fileUrl} alt="attachment" className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition" />
                                                    ) : msg.fileType === 'video' ? (
                                                        <video src={msg.fileUrl} controls className="max-w-full rounded-lg" />
                                                    ) : (
                                                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/10 p-2 rounded-lg hover:bg-black/20 transition">
                                                            <span>📄</span> {msg.fileName}
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {msg.message && <p className="text-sm leading-relaxed">{msg.message}</p>}
                                            <p className={`text-[10px] mt-1 text-right ${msg.senderModel === 'Admin' ? 'text-green-100' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                                {file && filePreview && (
                                    <div className="mb-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 animate-slideIn">
                                        <div className="flex items-start gap-3">
                                            {/* Preview */}
                                            <div className="flex-shrink-0">
                                                {file.type.startsWith('image/') ? (
                                                    <img
                                                        src={filePreview}
                                                        alt="preview"
                                                        className="w-20 h-20 object-cover rounded-lg border-2 border-green-300 shadow-sm"
                                                    />
                                                ) : file.type.startsWith('video/') ? (
                                                    <video
                                                        src={filePreview}
                                                        className="w-20 h-20 object-cover rounded-lg border-2 border-green-300 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center text-3xl border-2 border-green-300 shadow-sm">
                                                        📄
                                                    </div>
                                                )}
                                            </div>
                                            {/* File info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {(file.size / 1024).toFixed(2)} KB • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                                </p>
                                            </div>
                                            {/* Remove button */}
                                            <button
                                                type="button"
                                                onClick={() => setFile(null)}
                                                className="flex-shrink-0 text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-full transition-all duration-200 transform hover:scale-110"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <label className="cursor-pointer p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setFile(e.target.files[0]);
                                                }
                                            }}
                                            accept="image/*,video/*,application/*"
                                        />
                                        📎
                                    </label>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 border border-gray-300 rounded-full px-4 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() && !file}
                                        className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <div className="text-6xl mb-4">💬</div>
                            <p className="text-xl font-medium">Select a doctor to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DoctorChat;
