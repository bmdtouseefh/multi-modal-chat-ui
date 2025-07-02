import { useEffect, useRef, useState } from "react";

export default function SpeechToText({
  input,
  setInput,
}: {
  input: string;
  setInput: (value: string) => void;
}) {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let liveTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          liveTranscript += event.results[i][0].transcript;
        }
        setInput(liveTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      alert("Your browser does not support Speech Recognition");
      return;
    }
  }, []);

  const handleStart = () => {
    recognitionRef.current?.start();
  };

  return (
    <div>
      <button
        onClick={handleStart}
        className="p-2 bg-blue-500 text-white rounded"
      >
        Start Listening
      </button>
      {isListening && <p>Listening</p>}
      <p className="mt-4 text-lg">Transcript: {input}</p>
    </div>
  );
}
