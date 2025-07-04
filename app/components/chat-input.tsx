import TextareaAutosize from "react-textarea-autosize";
import { Button } from "~/components/ui/button";
import { Flashlight, MicIcon, SendHorizonal } from "lucide-react"; // optional icon
import { Input } from "./ui/input";
import { useState } from "react";
import { useNavigation } from "@remix-run/react";
import { resolve } from "node:path";
import { rejects } from "node:assert";

export function ChatInput({
  input,
  setInput,
  isSubmitting,
  base64,
  setBase64,
  setAudioBase64,
  audioBase64,
}: {
  input: string;
  setInput: (value: string) => void;
  isSubmitting?: boolean;
  base64: any;
  setBase64: (value: any) => void;
  setAudioBase64: (value: string | null) => void;
  audioBase64: string | null;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const handleFiles = async (e: any) => {
    const files = Array.from(e.target.files);

    const base64proms = files.map((file) => toBas64(file));
    const base64results = await Promise.all(base64proms);
    setBase64(base64results);
  };

  const toBas64 = (file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        resolve({
          name: file.name,
          type: file.type,
          content: reader.result,
        });
      reader.onerror = (e) => reject(`Error:  ${e}`);
    });
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      const base64String = await blobToBase64(audioBlob);
      setAudioBase64(base64String);
      // handleAudioData(audioBlob);
    };
    recorder.start();

    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    console.log(audioBase64);
    if (mediaRecorder && mediaRecorder?.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (audio: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64audioString = reader.result as string;
        const b64audiodata = b64audioString.split(",")[1];
        resolve(b64audiodata);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audio);
    });
  };

  const handleAudioData = (audioBlob: Blob) => {
    console.log("Audio recorded:", audioBlob);
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log("Playback URL:", audioUrl);
  };

  return (
    <div className="flex flex-1 gap-2 p-4 border rounded-xl bg-background items-center">
      <TextareaAutosize
        value={input}
        onChange={(e) => setInput(e.target.value)}
        name="message"
        placeholder="Ask anything..."
        disabled={isSubmitting}
        className="w-full text-base md:text-lg placeholder:text-muted-foreground resize-none rounded-md px-4 py-3 bg-background "
        minRows={1}
        maxRows={6}
      />
      <input
        accept=" audio/*"
        className="w-20"
        onChange={handleFiles}
        type="file"
        multiple
      ></input>
      <Button
        type="submit"
        // disabled={isSubmitting || !input.trim()}
        size="icon"
        className="rounded-full h-5 w-5"
      >
        <SendHorizonal className="h-5 w-5" />
      </Button>
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        className="h-8 w-16"
      >
        {isRecording ? "stop" : "start"}
        <MicIcon></MicIcon>
      </Button>
    </div>
  );
}
