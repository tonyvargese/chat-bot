import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./app.css";
import "bootstrap/dist/css/bootstrap.min.css";
// import DarkMode from "./components/DarkMode/DarkMode";
// import './components/DarkMode/DarkMode.css';

function App() {
    const [chatFlow, setChatFlow] = useState([]); 
    const [userQuery, setUserQuery] = useState("");
    const [error, setError] = useState("");
    const inputRef = useRef();
    const chatContainerRef = useRef(null);

    const badWords = ["badword1", "badword2", "badword3"];
    const welcomeWords = ["hi", "hello", "good morning", "good evening"];
    const farewellWords = ["bye", "goodbye", "see you later"];
    const thanksWords = ["thank you", "thanks"];

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatFlow]);

    const handleQuery = () => {
        const userInput = userQuery.toLowerCase();

        setChatFlow((prevFlow) => [...prevFlow, { type: "user", content: userQuery }]);

        if (badWords.some((word) => userInput.includes(word))) {
            setChatFlow((prevFlow) => [
                ...prevFlow,
                { type: "bot", content: "Please avoid using offensive language." },
            ]);
            setUserQuery("");
            return;
        }

        if (welcomeWords.some((word) => userInput.includes(word))) {
            setChatFlow((prevFlow) => [
                ...prevFlow,
                { type: "bot", content: "Hello! How can I assist you today?" },
            ]);
            setUserQuery("");
            return;
        } else if (farewellWords.some((word) => userInput.includes(word))) {
            setChatFlow((prevFlow) => [
                ...prevFlow,
                { type: "bot", content: "Goodbye! Have a great day!" },
            ]);
            setUserQuery("");
            return;
        } else if (thanksWords.some((word) => userInput.includes(word))) {
            setChatFlow((prevFlow) => [
                ...prevFlow,
                { type: "bot", content: "You're welcome!" },
            ]);
            setUserQuery("");
            return;
        }

        axios
            .post("http://localhost:8080/query", { query: userInput })
            .then((res) => {
                setChatFlow((prevFlow) => [
                    ...prevFlow,
                    { type: "bot", content: "Here are your results. Scroll down for more details." },
                    { type: "table", data: res.data, currentPage: 1 },
                ]);
                setError("");
            })
            .catch((err) => {
                console.error("Error:", err);
                setError("Error fetching data. Please try again.");
                setChatFlow((prevFlow) => [
                    ...prevFlow,
                    { type: "bot", content: "Error fetching data. Please try again." },
                ]);
            });
        setUserQuery("");
    };

    const changePage = (tableIndex, newPage) => {
        setChatFlow((prevFlow) => {
            const updatedFlow = [...prevFlow];
            if (updatedFlow[tableIndex].type === "table") {
                updatedFlow[tableIndex].currentPage = newPage;
            }
            return updatedFlow;
        });
    };

    return (
        <div className="App">
            <div className="wrapper">
                <div className="content">
                    <div className="header">
                        <div className="img">
                            <img src="https://support.iqvia.com/f57d809e1b2781582f3aa683604bcb83.iix" alt="logo" />
                        </div>
                        <div className="right">
                            <div className="name">ChatBot</div>
                            <div className="status">{error ? "Inactive" : "Active"}</div>
                            {/* <DarkMode /> */}
                        </div>
                    </div>
                    <hr className="line" />
                    <div className="main">
                        <div className="main_content">
                            <div className="messages scrollable" ref={chatContainerRef}>
                                {chatFlow.map((item, index) => {
                                    if (item.type === "user" || item.type === "bot") {
                                        return (
                                            <div
                                                key={index}
                                                className={`message ${item.type === "user" ? "user-message" : "bot-message"}`}
                                            >
                                                <span>{item.content}</span>
                                            </div>
                                        );
                                    } else if (item.type === "table") {
                                        const recordsPerPage = 5;
                                        const { data, currentPage } = item;
                                        const lastIndex = currentPage * recordsPerPage;
                                        const firstIndex = lastIndex - recordsPerPage;
                                        const records = data.slice(firstIndex, lastIndex);
                                        const totalPages = Math.ceil(data.length / recordsPerPage);

                                        return (
                                            <div key={index} className="table-container">
                                                <table className="table table-bordered table-striped">
                                                    <thead className="thead-dark">
                                                        <tr>
                                                            <th>Requirement ID</th>
                                                            <th>Process Area</th>
                                                            <th>Requirement Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {records.map((req, idx) => (
                                                            <tr key={idx}>
                                                                <td>{req.requirement_id}</td>
                                                                <td>{req.process_area}</td>
                                                                <td>{req.requirement_description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <nav aria-label="Page navigation">
                                                    <ul className="pagination justify-content-center">
                                                        {/* Previous Button */}
                                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => changePage(index, currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                                aria-label="Previous"
                                                            >
                                                                <span aria-hidden="true">&laquo;</span>
                                                                <span className="sr-only">Previous</span>
                                                            </button>
                                                        </li>

                                                        {/* Page Numbers */}
                                                        {Array.from({ length: totalPages }, (_, i) => (
                                                            <li
                                                                key={i}
                                                                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                                            >
                                                                <button
                                                                    className="page-link"
                                                                    onClick={() => changePage(index, i + 1)}
                                                                >
                                                                    {i + 1}
                                                                </button>
                                                            </li>
                                                        ))}

                                                        {/* Next Button */}
                                                        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => changePage(index, currentPage + 1)}
                                                                disabled={currentPage === totalPages}
                                                                aria-label="Next"
                                                            >
                                                                <span aria-hidden="true">&raquo;</span>
                                                                <span className="sr-only">Next</span>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    </div>
                    <div className="bottom">
                        <div className="btm">
                            <div className="input">
                            <textarea
                                rows="2"
                                id="input"
                                placeholder="Type your message"
                                ref={inputRef}
                                value={userQuery}
                                onChange={(e) => setUserQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault(); // Prevent new line
                                        handleQuery(); // Trigger the query
                                    }
                                }}
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
