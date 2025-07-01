import TextareaAutosize from "react-textarea-autosize";
import { Button } from "~/components/ui/button";
import { SendHorizonal } from "lucide-react"; // optional icon

export function ChatInput({
  input,
  setInput,
  isSubmitting,
}: {
  input: string;
  setInput: (value: string) => void;
  isSubmitting?: boolean;
}) {
  return (
    <div className="flex flex-1 gap-2 p-4  rounded-xl bg-background items-center">
      <TextareaAutosize
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask anything..."
        disabled={isSubmitting}
        className="w-full text-base md:text-lg placeholder:text-muted-foreground resize-none rounded-md px-4 py-3 bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
        minRows={1}
        maxRows={6}
      />

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
