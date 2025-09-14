import { useState, useEffect, useRef } from 'react';

// A simple function to simulate a bot response
const getBotResponse = (userInput) => {
  const text = userInput.toLowerCase().trim();
  if (text.includes("hello") || text.includes("hi")) {
    return "Hello there! How can I help you today?";
  }
  if (text.includes("dashboard")) {
    return "The dashboard provides an overview of Forest Rights Act claims, showing statistics and key metrics.";
  }
  if (text.includes("map") || text.includes("gis")) {
    return "The WebGIS Map allows you to visualize claim areas, forest boundaries, and other spatial data interactively.";
  }
  if (text.includes("dss")) {
    return "The Decision Support System (DSS) helps in analyzing data to make informed decisions regarding land claims.";
  }
  if (text.includes("ocr")) {
    return "The OCR Processor is an admin tool to digitize physical documents by extracting text from images.";
  }
  if (text.includes("support") || text.includes("help")) {
    return "You can find help documentation on the Support page or contact us through the Feedback form. What do you need help with?";
  }
  return "I'm sorry, I don't understand that. You can ask me about the Dashboard, Map, DSS, or OCR features.";
};


const Chatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Effect to add a welcome message when the chatbot is opened
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 1,
          text: "Welcome to the FRA Atlas Assistant! How can I help you navigate the system today?",
          sender: "bot",
        },
      ]);
    }
  }, [isOpen]);
  
  // Effect to scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    
    // Simulate bot thinking and then respond
    setTimeout(() => {
        const botResponseText = getBotResponse(input);
        const botMessage = { id: Date.now() + 1, text: botResponseText, sender: "bot"};
        setMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[32rem] bg-white rounded-xl shadow-2xl flex flex-col z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 flex justify-between items-center rounded-t-xl">
        <h3 className="text-lg font-semibold">FRA Atlas Assistant</h3>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="flex flex-col space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
           <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            disabled={!input.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;