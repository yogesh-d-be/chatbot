import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {IoArrowBack,IoHardwareChipSharp,IoPhoneLandscape,IoPhonePortrait,IoSend, IoSparklesSharp,} from "react-icons/io5"; // Import icons
import { BsRobot } from "react-icons/bs";
import { FaCheck, FaCheckDouble, FaClock } from "react-icons/fa";
import { assets } from "./assets/assets"; // Replace with your assets path
import {getChatRoom,getSendMessageChatRoom,joinChat,sendMessageToChatRoom,userChatRegister,} from "./Services/chat.services";
import { message, Modal, Spin } from "antd";
import { DateTime } from "luxon";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { LuMessagesSquare } from "react-icons/lu";
import { RxCross1 } from "react-icons/rx";
import { IoChatbubble } from "react-icons/io5";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import {v4 as uuidv4} from "uuid";
import { toast } from "react-toastify";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [isFullChatVisible, setIsFullChatVisible] = useState(false); // State to toggle full chat UI
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChat, setShowChat] = useState(false); // State to toggle chat UI
  const [showPopupForm, setShowPopupForm] = useState(false); // State for form visibility
  const [socket, setSocket] = useState(null);
  const [join, setJoin] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [acceptChat, setAcceptChat] = useState(false);
  const [showCloseChatModal, setShowCloseChatModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [acceptChatRequest, setAcceptChatRequest] = useState([]);
  const [waitMessage, setWaitMessage] = useState(false);
  const [supportMember, setSupportMember] = useState(null);
  const [listMessages, setListmessages] = useState([]);
  const [recievedMessage, setRecievedMessage] = useState([]);
  const [showClosingTimeModal, setShowClosingTimeModal] = useState(false);
  const [isClickChat, setIsClickChat] = useState(false);
  const [isSupportTeam, setIsSupportTeam] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  let isAccepted;

  const storedRoomId = localStorage.getItem("roomId");
  const storedUserId = localStorage.getItem("userId");
  const storedEndChat = localStorage.getItem("end");
  const storedFullChat = localStorage.getItem("fullRefer");
  const storedChatCurrentTime = localStorage.getItem("RefererTime");
  const chatPreference = localStorage.getItem("prefer") 
  let roomId; // to register chatroomid
  let userId; // to register userid

  const TypingIndicator = () => {
    return (
      <div className="flex items-center space-x-2 mt-2 ml-10">
        <div className="w-fit bg-gray-100 rounded-lg px-3 py-2 shadow text-sm text-gray-600">
          Typing<span className="animate-dots" />
        </div>
      </div>
    );
  };

  const indianTime = (time) => {
    let date;

    if (DateTime.fromISO(time).isValid) {
      date = DateTime.fromISO(time, { zone: "utc" });
    } else {
      date = DateTime.fromFormat(time, "hh:mm a");
    }

    if (date.isValid) {
      const istTime = date.setZone("Asia/Kolkata").toFormat("hh:mm a");
      return istTime;
    }

    return time;
  };


  const messageData = (messageContent,role,currentTime,messageId) => (
    {
    content:messageContent,
    role:role,
    time:currentTime,
    _id:uuidv4(),
    messageId,
    isPending:true
  })


  const mergeMessages = (existingMessages, newMessages) => {
    const merged = [...existingMessages, ...newMessages];
    const uniqueMessages = Array.from(
      new Map(merged.map((msg) => [msg._id, msg])).values()
    );
    return uniqueMessages;
  };

  const filterPendingMessage = (prevMessages, formattedMessage) => {
    // Skip if the incoming one is pending
    if (formattedMessage.isPending) return prevMessages;
  
    // Always remove all messages (pending or not) with the same messageId
    const cleanedMessages = prevMessages.filter(
      msg => msg.messageId !== formattedMessage.messageId
    );
  
    return [...cleanedMessages, formattedMessage];
  };
  
      
  
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);


  //to register userid, chatroomid
  const userChatRoomRegister = async () => {
    try {
      const chatResponse = await userChatRegister();
      console.log("chatresponse in", chatResponse);
      if (chatResponse.data.status === true) {
        userId = chatResponse.data.data.newUser._id;
        roomId = chatResponse.data.data.chatRoom._id;
        localStorage.setItem("userId", userId);
        localStorage.setItem("roomId", roomId);
        setChatRoomId(roomId);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to register your chat. Try again later")
    }
  }
  const userJoinChatToSupportTeam = async () => {
    setIsConnecting(true);
    try {
      const joinReferId = uuidv4();
      const joinResponse = await joinChat({ userId: storedUserId, joinReferId });
  
      if (joinResponse.data.status === true) {
        localStorage.setItem("prefer", "support");
        setIsSupportTeam(true);
      }
  
      console.log("join in", joinResponse);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to connect with support team. Try again later"
      );
    }finally{
      setIsConnecting(false);
    }
  };
  

  // Function to send a message
  const handleSendMessage = async () => {
    try {
      if (!input.trim()) return; // Avoid empty messages

      const currentTime = new Date().toISOString();

      if (input.trim()) {
        console.log("tttt",input);
        // Display full chat UI when a message is sent
        setIsFullChatVisible(true);
        // setInput(""); // Clear input after sending

        if (JSON.parse(storedFullChat) === false || !storedFullChat) {
          console.log("eeee");
          localStorage.setItem("fullRefer", true);
          // if (JSON.parse(storedEndChat) === true) {
          //   localStorage.setItem("end", false);
          // }
        }
      }

      if (storedRoomId && storedUserId) {
        // setMessages((prev) => [...prev]);
        // setInput("");
        const data = {
          chatRoomId: storedRoomId,
          message: input,
          senderId: storedUserId,
          senderType: "user",
          createdAt: currentTime,
          messageId:uuidv4() ,// this id to find unique messages when send message data from frontend and update state with messageid.
          //  it goes to backend after it received from socket then it update to the state. to avoid same message duplication. to use message id to filter and remove duplicate message
          preference:chatPreference === "support" ? "support" : "ai"
        };
      console.log("chatpreference", chatPreference)
          // direct state update for immediate ui response
        const newMessage = messageData(input, "user", currentTime, data.messageId);
        setMessages((prev) => [...prev, newMessage]);
        setInput("");
        const response = await sendMessageToChatRoom(data, storedRoomId);
        console.log("send mess", response)
        socket.emit("sendMessage", data);
    
      

        console.log("resssssss", response);
        // getChatMessagesByChatRoomId(storedRoomId);
        console.log("res in send message", response);
      }
    } catch (error) {
      console.error("Error in sending message:", error);
    }
  };

  const handleSendQuickMessages = async (selectedMessage) => {
    try {

      console.log("seee", selectedMessage)
      const messageContent = selectedMessage || input.trim();
      if (!messageContent) return;

      console.log("Sending quick message:", messageContent);
      const currentTime = new Date().toISOString();

      setIsFullChatVisible(prev=>!prev);

      if (JSON.parse(storedFullChat) === false || !storedFullChat) {
        console.log("Initializing chat...");
        localStorage.setItem("fullRefer", true);
        // if (JSON.parse(storedEndChat) === true) {
        //   localStorage.setItem("end", false);
        // }
      }

      // Ensure `storedUserId` and `roomId` are initialized
    

      if (!userId || !roomId) {
        await userChatRoomRegister();
      }
      console.log("storeduser in", userId)
  

      if (!socket) {
        console.error("Socket is not initialized.");
        return;
      }

      socket.emit("joinRoom", { roomId });
      socket.on("joinRoom", (data) => {
        console.log("Successfully joined room:", data);
      });
// this data send to backend for send message service and socket
      const data = {
        chatRoomId: roomId || storedRoomId,
        message: messageContent,
        senderId: userId || storedUserId ,
        senderType: "user",
        createdAt: currentTime,
        messageId:uuidv4(), // this id to find unique messages when send message data from frontend and update state with messageid.
        //  it goes to backend after it received from socket then it update to the state. to avoid same message duplication. to use message id to filter and remove duplicate message
        preference:chatPreference === "support" ? "support" : "ai"
      };

      //update immediate state message
      const newMessage = messageData(input, "user", currentTime, data.messageId);
      setMessages((prev) => [...prev, newMessage]);
      setInput("");
      const response = await sendMessageToChatRoom(data, roomId);
      console.log("res", response)
        socket.emit("sendMessage", data);
      
       
   
      console.log("rooms", roomId);
      // getChatMessagesByChatRoomId(roomId);
    } catch (error) {
      console.error("Error in sending message:", error);
    }
  };



  const getChatRoomStatusByChatRoomId = async () => {
    try {
      const response = await getChatRoom(storedRoomId);
      if (response.data.status) {
        const chatStatus = response.data.data.status;
        setAcceptChat(chatStatus === "accepted");
        setWaitMessage(chatStatus === "pending");
      } else {
        setAcceptChat(false);
        setWaitMessage(true);
      }
    } catch (error) {
      setAcceptChat(false);
      setWaitMessage(false);
      console.error("Error fetching chat room status:", error);
    }
  };


  const getChatMessagesByChatRoomId = async (roomId) => {
    console.log("triggering", roomId);
    try {
      const response = await getSendMessageChatRoom(roomId);
      // console.log("stt", roomId);
      if (response?.data?.status) {
        const formattedMessages = response.data.data.map((chat) => ({
          _id: chat._id,
          role: chat.senderType,
          content: chat.message,
          time: chat.createdAt,
        }));
        setListmessages((prevMessages) => mergeMessages(prevMessages,formattedMessages));
      } else {
        console.error("Failed to retrieve messages");
      }
    } catch (error) {
      console.error(
        error?.response?.data?.message || "Failed to get chat messages"
      );
    }
  };


  const handleCloseChatModal = (data) => {
    // localStorage.setItem("end", true);
    setShowCloseChatModal(true);
    setModalData(data);
    setShowChat(false);

  };

  const handleCloseChat = () => {
    setShowChat(false);
    setIsFullChatVisible(false);
    localStorage.setItem("fullRefer", false);
    setIsClickChat(false);
    setShowChat(false); // Hide the chat UI
    // localStorage.setItem("end", true);
  };


  const groupMessagesByDate = (messages) => {
    return messages.reduce((groups, message) => {
      const date = DateTime.fromISO(message.time).toFormat("yyyy-MM-dd"); // Format as a simple date
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});
  };

  const handleChatClick = () => {
    setIsClickChat(true);
  
    if (storedRoomId && storedUserId) {
      setIsFullChatVisible(true);
      localStorage.setItem("fullRefer", true);
      showChat(false);
    }
  
  };


  useEffect(() => {
    if (JSON.parse(storedEndChat) === true) {
      setShowChat(false);
      setIsFullChatVisible(false);
      // localStorage.setItem("fullRefer",false)
    } else if (storedRoomId) {
      setChatRoomId(storedRoomId);
      setJoin(false);
      setShowChat(true);
      getChatMessagesByChatRoomId(storedRoomId);
    } else if (join === false) {
      setWaitMessage(true);
    }
  }, [storedRoomId, storedEndChat]);

  useEffect(() => {
    if (JSON.parse(storedFullChat) === true) {
      setIsFullChatVisible(true);
      setIsClickChat(true);
    } else if (JSON.parse(storedFullChat) === false) {
      setIsFullChatVisible(false);
      setIsClickChat(false);
    }
  }, [storedFullChat]);

  useEffect(()=>{
    if(chatPreference === "support"){
      setIsSupportTeam(true);
    }
  },[chatPreference])

  // useEffect(() => {
  //   getChatMessagesByChatRoomId(storedRoomId);
  // }, [isFullChatVisible]);

 

  useEffect(()=>{
    console.log("messages", messages)
  },[messages])




 
  useEffect(() => {
    // if (isFullChatVisible) {
    const newSocket = io(
      "http://localhost:9001"
      // "http://localhost:3040"
    );
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to the server");
      const roomId = localStorage.getItem("roomId");
      if (roomId) {
        newSocket.emit("joinRoom", { roomId });
       
      }
    });

    newSocket.on("acceptChatRequest", (data) => {
      setWaitMessage(false);
      getChatRoomStatusByChatRoomId(storedRoomId);
      message.success(data.message);
    });

    newSocket.on("recievedMessage", (data) => {
      console.log("recieve message", data);
      setRecievedMessage(data);
      if (data.senderType === "ai") {
        setIsTyping(false); // Hide typing animation when AI response is received
      }
    });

    newSocket.on("typing", (data) => {
      console.log("Typing event", data, storedRoomId, chatRoomId);
      const chatRoom = storedRoomId || chatRoomId || localStorage.getItem("roomId")
      console.log("roooo", chatRoom)
      if(data.senderType === "ai" && data.chatRoomId === chatRoom){
        setIsTyping(true)
      }
      // if(data.senderType === "ai"){
      //   setIsTyping(true)
      // }
    })
    newSocket.on("chatExpired", (data) => {
      console.log("support member close message", data);
      getChatMessagesByChatRoomId(storedRoomId);
      handleCloseChatModal(data);
      localStorage.setItem("prefer","ai");
      toast.info("chat expired with support team")
      setIsSupportTeam(false)
      setJoin(false);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from the server");
    });

    return () => {
      newSocket.disconnect();
      newSocket.off();
    };
    // }
  }, []);

  useEffect(()=>{
    console.log("setistyping", isTyping)
  },[isTyping])


  useEffect(() => {
    if (recievedMessage && Object.keys(recievedMessage).length > 0) {
      console.log("ya received")
      const formattedMessage = {
        _id: recievedMessage._id,
        messageId:recievedMessage.messageId || uuidv4(), //when ai response from receive messages sometimes it disappear because it doesnt have messageid, so i add it to manage filterPendingMessage function's functionality.
        role: recievedMessage.senderType,
        content: recievedMessage.message,
        time: recievedMessage?.createdAt || new Date().toISOString(),
      };

      // Check for _id existence before updating
      if (!formattedMessage._id) {
        console.error("Received message has no _id:", recievedMessage);
        return;
      }

      setMessages((prevMessages) =>{
        return filterPendingMessage(prevMessages,formattedMessage)
        // const filtered = prevMessages.filter(m => !(m.isPending && m.content === formattedMessage.content));
        // return [...filtered, formattedMessage];
      }
        // mergeMessages(prevMessages, [formattedMessage])
      );
    }

    console.log("recieved", recievedMessage)
  }, [recievedMessage]);


  useEffect(() => {
    if (socket) {
      console.log("Socket initialized:", socket);
    }
  }, [socket]);

  // Add this utility function to merge messages and avoid duplicates
 

 

  useEffect(() => {
    console.log("list", listMessages);
    setMessages((prevMessages) => mergeMessages(prevMessages, listMessages));
  }, [listMessages]);

  useEffect(() => {
    console.log("Updated messages:", messages);
  }, [messages]);

  const renderMessages = () => {
    const groupedMessages = groupMessagesByDate(messages);
    const today = DateTime.now().toFormat("yyyy-MM-dd");
    const yesterday = DateTime.now().minus({ days: 1 }).toFormat("yyyy-MM-dd");

    return Object.keys(groupedMessages).map((date) => (
      <div key={date}>
        {/* Render Date Header */}
        <div className="text-center   text-gray-500 text-sm my-2">
          {date === today
            ? "Today"
            : date === yesterday
            ? "Yesterday"
            : DateTime.fromISO(date).toFormat("MMMM dd, yyyy")}
        </div>

        {/* Render Messages for the Date */}
        {groupedMessages[date].map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex items-start ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
          {
  msg.role === "supportMember" && (
    <div className="rounded-full p-1.5 bg-gray-100 mr-1">
      <IoChatbubbleEllipsesSharp className="size-7 text-primaryColor" />
    </div>
  )
}

{
  msg.role === "ai" && (
    <div className="rounded-full p-1.5 bg-gray-100 mr-1">
      <BsRobot className="size-7 text-primaryColor" />
    </div>
  )
}

            <div className="flex flex-col ">
              <div
                className={`p-2 rounded-lg px-3  shadow-md flex items-start  ${
                  msg.role === "user"
                    ? "bg-primaryColor  text-white w-fit  ml-10 "
                    : "bg-gray-100 mr-10"
                }`}
              >
                <p>{msg.content}</p>
              </div>
              <div
    className={`flex items-center gap-1 text-xs mt-1 text-gray-400 ${
      msg.role === "user" ? "justify-end pr-2" : "justify-start pl-2"
    }`}
  >
             <span>{indianTime(msg.time)}</span>
    {msg.isPending ? (
      <FaClock className="w-3.5 h-3.5" />
    ) : (
      <FaCheck className="w-2.7 h-2.7" />
    )}
  </div>
            </div>
            
          </div>
          
        ))}
          
          {isTyping && (
  <div className="flex items-center gap-2 text-sm text-gray-500 pl-3 mb-2">
    <span><BsRobot/>typing</span>
    <span className="flex space-x-1">
      <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></span>
      <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </span>
  </div>
)}
<div ref={messageEndRef} />

      
      </div>
    ));
  };

  // Handle form submission

  return (
    <div className="flex relative items-center justify-center bg-gray-100">
      {/* Floating Button for Chat */}
      <div className="fixed md:bottom-3 bottom-3  z-50 md:right-5 right-3 flex flex-col items-center">
        <div className="flex flex-row gap-2 justify-center items-center">
          {!isClickChat ? (
            <div className="ring-animation">
              {" "}
              <button
                className="bg-[#21a9b7] shadow-md rounded-full shadow-white text-white p-2 hover:bg-primaryColor hover:text-white border-white border transform transition-transform duration-300 "
                onClick={handleChatClick}
              >
                <LuMessagesSquare className="size-8 md:size-9 p-1" />
              </button>
            </div>
          ) : (
            <button
              className="bg-[#21a9b7] rounded-full text-white p-2 hover:bg-[#21a9b7] hover:text-white border-white border transform transition-transform duration-300"
              onClick={handleCloseChat}
            >
              <RxCross1 className="size-8  md:size-9  font-bold p-1" />
            </button>
          )}
        </div>
      </div>

      {/* Chat UI with Smooth Slide-Up Animation */}
      {isClickChat && !isFullChatVisible && (
        <div
        className={`fixed lg:bottom-20 z-50  bottom-[13%] md:bottom-[10%]  w-[80%] right-6 md:right-10 lg:right-8 md:w-[45%] lg:w-[28%] lg:h-auto bg-white border-t-8 border-t-primaryColor rounded-lg shadow-lg md:p-3 p-1.5 transition-transform duration-500 transform`}
        >
          {/* Header */}
          <div className="flex absolute -top-6 items-center mb-4">
            {/* <img
              src={assets.whyLogoo}
              alt="Profile"
              className="w-14 h-14 rounded-full"
            /> */}
          </div>

          {/* Chat Body */}
          <div className="text-sm text-justify md:mt-8 mt-7 px-2 ">
            <h2 className="md:text-xl font-semibold text-gray-800 mt-3 md:mt-0 md:my-3">
              👋 <strong>Hi!</strong>
            </h2>
            <div className="md:py-2 py-1 ">
              <p className="text-primaryColor font-medium md:text-base mb-2">
              🚀 Are you a jobseeker? Still struggling to get into IT?
              </p>
              <ul className="pl-4 space-y-2 text-gray-700">
                {[
                  "👨‍💻 Learn Full Stack Development | 📢 Digital Marketing",
                  "💸 Earn a Stipend While You Learn!",
                  "📞 Book a FREE Career Consultation",
                ].map((item, index) => (
                  <>
                    <li
                      key={index}
                      className="p-1 px-3 block text-[12px] md:text-[14px] rounded-md hover:shadow-lg hover:scale-105 transform transition-transform duration-200 w-fit bg-primaryColor text-white cursor-pointer"
                      onClick={() => handleSendQuickMessages(item)}
                    >
                      {item}
                    </li>
                  </>
                ))}
                <li
                  //  key={index}
                  className="p-1 px-3 block text-[12px] md:text-[14px] rounded-md hover:shadow-lg hover:scale-105 transform transition-transform duration-200 w-fit bg-primaryColor text-white cursor-pointer"
                  onClick={() => inputRef.current && inputRef.current.focus()}
                >
                  💬 Just ask—We are here to help! 🎓
                </li>
              </ul>
              <p className="text-gray-700 md:mt-4 mt-2 text-[12px] md:text-base">
                Just type your question, and I’ll be happy to assist you! 🎓
              </p>
            </div>
          </div>

          {/* Input Section */}
          <div className="py-1 w-full flex items-center">
            <input
              type="text"
              ref={inputRef}
              placeholder="Write a reply..."
              className={`flex-1 border border-gray-300 w-20 rounded-md px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primaryColor focus:border-primaryColor`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevent default form submission
                  handleSendQuickMessages();
                }
              }}
            />
            <button
              className="ml-2 border border-gray-300 rounded-md px-4 py-2  text-primaryColor text-lg"
              onClick={handleSendQuickMessages}
            >
              <IoSend className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Full Chat UI */}
      {isFullChatVisible && (
        <div
        className="fixed lg:bottom-20 bottom-0   md:bottom-[10%] lg:right-10  z-50 md:right-10  right-0 h-full   md:h-[60vh] lg:h-[76vh]  lg:w-[26%] md:w-[45%] w-full overflow-hidden md:rounded-md shadow-lg bg-white flex flex-col transition-transform duration-500 transform"
        style={{
            overflowX: "hidden", // Add this
          }}
        >
          {/* Header */}
          <div className="bg-primaryColor flex items-center justify-center">
            <div className="w-full flex items-center py-1 justify-between bg-primaryColor mr-5 text-white cursor-pointer">
              {/* <img src={assets.whitelogo} alt="Logo" className="pl-4 w-28" /> */}
              <p
                onClick={() => {
                  console.log("click"),
                    setShowChat(true),
                    setIsFullChatVisible(false);
                }}
              >
                <span className=""></span>Back
              </p>
            </div>

            <div className="md:hidden block">
              <button
                className=" text-white p-2 hover:bg-primaryColor hover:text-white transform transition-transform duration-300"
                onClick={handleCloseChat}
              >
                <RxCross1 className="size-11 font-bold p-2" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 bg-white hide-scrollbar p-4 overflow-y-auto text-sm">
            {renderMessages()}
            {/* <div className="text-gray-500 text-left flex items-center">
              {input && <span className="ml-2">typing...</span>}
            </div> */}
            <div ref={messageEndRef} />
          </div>

          {/* Input Section */}
          <div className="bg-white p-4 flex-col items-center overflow-hidden rounded-b-lg">
        {
          !isSupportTeam &&(

            <button disabled={isConnecting} className=" bg-primaryColor mb-2 py-2 text-center w-full text-white rounded-lg hover:border hover:border-primaryColor hover:bg-white hover:text-primaryColor hover:cursor-pointer" onClick={userJoinChatToSupportTeam}>{isConnecting ? "Connecting..." : "Connect with why tap support team"}</button>
          )
        
        } 
        

            <div className="flex items-center w-full border border-gray-500 h-10 rounded-md overflow-hidden">
              <input
                type="text"
                disabled={isConnecting}
                placeholder="Type a message..."
                className="flex-1 p-2 px-3 text-xs outline-none h-full rounded-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                className="text-primaryColor px-4 p-2 h-full flex items-center justify-end"
                onClick={handleSendMessage}
              >
                <IoSend size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;

