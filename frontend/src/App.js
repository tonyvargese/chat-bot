import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./app.css";
import image1 from "./img/IQVIA.png";
import "bootstrap/dist/css/bootstrap.min.css";
import DarkMode from "./components/DarkMode/DarkMode";
import './components/DarkMode/DarkMode.css'

function App() {
    const [userQuery, setUserQuery] = useState("");
    const [messages, setMessages] = useState([]); // To store chat messages
    const [response, setResponse] = useState([]); // API response
    const [error, setError] = useState("");
    const inputRef = useRef();
    const chatContainerRef = useRef(null); // Ref for auto-scrolling

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const records = response.slice(firstIndex, lastIndex);
    const npage = Math.ceil(response.length / recordsPerPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);

    const badWords = ["badword1", "badword2", "badword3"]; // Extend this list
    const welcomeWords = ["hi", "hello", "good morning", "good evening"];
    const farewellWords = ["bye", "goodbye", "see you later"];
    const thanksWords = ["thank you", "thanks"];

    // Scroll to the bottom when a new message is added
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleQuery = () => {
        const userInput = userQuery.toLowerCase();

        // Add user query to messages
        setMessages((prevMessages) => [...prevMessages, { type: "user", text: userQuery }]);

        // Check for bad words
        if (badWords.some((word) => userInput.includes(word))) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: "bot", text: "Please avoid using offensive language." },
            ]);
            setUserQuery("");
            return;
        }

        // Handle predefined responses
        if (welcomeWords.some((word) => userInput.includes(word))) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: "bot", text: "Hello! How can I assist you today?" },
            ]);
            setUserQuery("");
            return;
        } else if (farewellWords.some((word) => userInput.includes(word))) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: "bot", text: "Goodbye! Have a great day!" },
            ]);
            setUserQuery("");
            return;
        } else if (thanksWords.some((word) => userInput.includes(word))) {
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: "bot", text: "You're welcome!" },
            ]);
            setUserQuery("");
            return;
        }

        // API call for user query
        axios
            .post("http://localhost:8080/query", { query: userInput })
            .then((res) => {
                setResponse(res.data);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { type: "bot", text: "Here are your results. Scroll down for more details." },
                ]);
                setError("");
            })
            .catch((err) => {
                console.error("Error:", err);
                setError("Error fetching data. Please try again.");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { type: "bot", text: "Error fetching data. Please try again." },
                ]);
            });
        setUserQuery("");
    };

    const prePage = () => {
        if (currentPage !== 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const changeCPage = (id) => {
        setCurrentPage(id);
    };

    const nextPage = () => {
        if (currentPage !== numbers.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="App">
            <div className="wrapper">
                <div className="content">
                    <div className="header">
                        <div className="img">
                            <img src='https://support.iqvia.com/f57d809e1b2781582f3aa683604bcb83.iix'alt="logo" />
                        </div>
                        <div className="right">
                            <div className="name">ChatBot</div>
                            <div className="status">{error ? "Inactive" : "Active"}</div>
                            <DarkMode/>
                        </div>
                        
                    </div>
                    <hr className="line" />
                    <div className="main">
                        <div className="main_content">
                            <div className="messages scrollable" ref={chatContainerRef}>
                                {messages.map((message, index) => (
                                    <div
                                    key={index}
                                    className={`message ${
                                        message.type === "user" ? "user-message" : "bot-message"
                                    }`}
                                    >
                                    <span>{message.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Render table if response is available */}
                            {response.length > 0 && (
                                <div className="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Requirement ID</th>
                                                <th>Process Area</th>
                                                <th>Requirement Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {records.map((req, index) => (
                                                <tr key={index}>
                                                    <td>{req.requirement_id}</td>
                                                    <td>{req.process_area}</td>
                                                    <td>{req.requirement_description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <nav>
                                        <ul className="pagination justify-content-center" style={{ fontSize: "12px", margin: "0", padding: "0" }}>
                                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`} style={{ margin: "0 2px" }}>
                                                <button className="page-link" onClick={prePage} style={{ padding: "5px 10px" }}>
                                                    Prev
                                                </button>
                                            </li>
                                            {numbers.map((n, i) => (
                                                <li key={i} className={`page-item ${currentPage === n ? "active" : ""}`} style={{ margin: "0 2px" }}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => changeCPage(n)}
                                                        style={{ padding: "5px 10px" }}
                                                    >
                                                        {n}
                                                    </button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === numbers.length ? "disabled" : ""}`} style={{ margin: "0 2px" }}>
                                                <button className="page-link" onClick={nextPage} style={{ padding: "5px 10px" }}>
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bottom">
                        <div className="btm">
                            <div className="input">
                                <textarea
                                    rows="2"
                                    id="input"
                                    placeholder="Enter your query"
                                    ref={inputRef}
                                    value={userQuery}
                                    onChange={(e) => setUserQuery(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="btn">
                                <button onClick={handleQuery}>
                                    <i className="fas fa-paper-plane"></i>Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
