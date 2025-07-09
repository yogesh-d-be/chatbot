import React, { useState, useRef, useEffect } from "react";
import { IoChatbubbleEllipsesOutline, IoSend, IoClose } from "react-icons/io5";
import { BsRobot } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

const PortfolioChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);

  const quickReplies = [
    "Show me your portfolio 📁",
    "Share your resume 📄",
    "Tell me your skills 💡",
    "How to contact you? 📞",
  ];

  const getBotReply = (msg) => {
    if (msg.toLowerCase().includes("portfolio"))
      return "You can see my portfolio at https://yourportfolio.com";
    if (msg.toLowerCase().includes("resume"))
      return "Here’s my resume: [Download PDF]";
    if (msg.toLowerCase().includes("skills"))
      return "I'm a MERN Stack Developer, with strong React, Node.js, and UI/UX design skills.";
    if (msg.toLowerCase().includes("contact"))
      return "You can reach me at your.email@example.com or LinkedIn!";
    return `Thanks for asking! I’ll get back to you soon.`;
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { sender: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMsg = { sender: "bot", content: getBotReply(text) };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-xl"
          >
            <IoChatbubbleEllipsesOutline size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white flex justify-between items-center p-4">
              <div className="flex items-center gap-2">
                <BsRobot size={22} />
                <span className="font-semibold text-sm">
                  Yogesh’s Portfolio Assistant
                </span>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <IoClose size={22} />
              </button>
            </div>

            {/* Chat body */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } mb-2`}
                >
                  <div
                    className={`px-4 py-2 rounded-xl max-w-[70%] ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-white border"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <BsRobot /> Typing
                  <span className="animate-bounce">...</span>
                </div>
              )}

              <div ref={messageEndRef} />
            </div>

            {/* Quick replies */}
            <div className="flex flex-wrap gap-2 p-2">
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(qr)}
                  className="bg-blue-100 text-sm px-3 py-1 rounded-full hover:bg-blue-200 transition"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => sendMessage(input)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-full"
              >
                <IoSend size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioChatbot;
