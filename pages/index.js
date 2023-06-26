import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import styles from "./index.module.css";

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setResponse("Hello, I am an AI chatbot. How can I assist you?");
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
  .map((result) => result[0].transcript)
  .join("");

if (event.results[0].isFinal) {
  if (!isSpeakingRef.current) {
    recognitionRef.current.stop();
    processQuery(transcript);
  }
}

      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current.onend = () => {
        if (!isSpeakingRef.current) {
          setIsSpeaking(false);
        }
      };
    } else {
      console.log("Web Speech API is not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speakResponse = (text) => {
    return new Promise((resolve, reject) => {
      if ("speechSynthesis" in window) {
        const speechSynthesis = window.speechSynthesis;
        const speechUtterance = new SpeechSynthesisUtterance(text);
        isSpeakingRef.current = true;

        speechUtterance.onend = () => {
          isSpeakingRef.current = false;
          resolve();
        };

        speechSynthesis.speak(speechUtterance);

        recognitionRef.current.stop();
      } else {
        console.log("Speech synthesis is not supported in this browser.");
        recognitionRef.current.start();
        reject();
      }
    });
  };

  const processQuery = async (query) => {
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      const botResponse = data.response;
      setResponse(botResponse);
      await speakResponse(botResponse);
      setQuery("");

      setTimeout(() => {
        setIsSpeaking(false);
        if (!isSpeakingRef.current) {
          recognitionRef.current.start();
        }
      }, 500000);
      
    } catch (error) {
      console.error(error);
      setResponse("An error occurred while processing the request.");
    }
  };

  const handleStartRecognition = () => {
    setIsSpeaking(true);
    recognitionRef.current.start();
  };

  return (
    <div>
      <Head>
        <title>OPEN AI CHATBOT</title>
        <link rel="icon" href="/shuttle.png" sizes="128x128"/>
      </Head>

      <main className={styles.main}>
        <img src="/shuttle.png" className={styles.icon} />
        <h3>Please start speaking:</h3>
        <div className={styles.response}>{response}</div>
        <button disabled={isSpeaking} onClick={handleStartRecognition}>
          Start Recognition
        </button>
      </main>
      <footer className={styles.footer}>Made by Himanshu</footer>
    </div>
  );
}
