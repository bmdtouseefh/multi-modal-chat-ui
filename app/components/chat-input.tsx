import TextareaAutosize from "react-textarea-autosize";
import { Button } from "~/components/ui/button";
import { SendHorizonal } from "lucide-react"; // optional icon
import { Input } from "./ui/input";

export function ChatInput({
  input,
  setInput,
  isSubmitting,
  base64,
  setBase64,
}: {
  input: string;
  setInput: (value: string) => void;
  isSubmitting?: boolean;
  base64: any;
  setBase64: (value: any) => void;
}) {
  const handleFiles = async (e: any) => {
    const files = Array.from(e.target.files);
    const base64proms = files.map((file) => toBas64);
    const base64results = await Promise.all(base64proms);
    setBase64(base64results);
    console.log(base64);
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
      <Input
        accept="image/*, audio/*"
        // className="size-8"
        onChange={handleFiles}
        type="file"
        multiple
      ></Input>
      <Button
        type="submit"
        disabled={isSubmitting || !input.trim()}
        size="icon"
        className="rounded-full w-10 h-10"
      >
        <SendHorizonal className="h-5 w-5" />
      </Button>
    </div>
  );
}
