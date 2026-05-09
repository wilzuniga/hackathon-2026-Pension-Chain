interface ChatMessageProps {
  role: 'system' | 'assistant' | 'user';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  if (role === 'system') {
    return (
      <div className="flex justify-center">
        <p className="rounded-full bg-gray-800 px-3 py-1 text-xs italic text-gray-500">
          {content}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${
          role === 'user'
            ? 'rounded-br-sm bg-emerald-600 text-white'
            : 'rounded-bl-sm bg-gray-800 text-gray-200'
        }`}
      >
        {content}
      </div>
    </div>
  );
}
