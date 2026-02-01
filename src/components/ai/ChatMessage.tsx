"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { StreamingCursor } from "./StreamingCursor";
import { PropertyCardRenderer } from "./PropertyCardRenderer";
import { ProviderCardRenderer } from "./ProviderCardRenderer";
import type { UIMessage } from "./hooks/useAIAssistantChat";

interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
}

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  toolCalls?: ToolCall[];
  userImage?: string;
  userName?: string;
}

// Memoize to prevent re-renders during streaming of other messages
export const ChatMessage = memo(function ChatMessage({
  role,
  content,
  timestamp,
  isStreaming = false,
  toolCalls,
  userImage,
  userName,
}: ChatMessageProps) {
  const isUser = role === "user";

  // Get user initials for fallback
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ms-auto flex-row-reverse" : "me-auto"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        {isUser ? (
          <>
            <AvatarImage src={userImage} alt={userName || "You"} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getInitials(userName)}
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback className="text-xs bg-muted">
              AI
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
        {/* Message bubble */}
        <div
          className={cn(
            "px-4 py-2 text-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-2xl rounded-ee-sm"
              : "bg-muted rounded-2xl rounded-es-sm"
          )}
        >
          {isUser ? (
            // User messages: plain text
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            // AI messages: markdown with code highlighting
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code(props) {
                    const { node, inline, className, children, ...rest } = props as any;
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");

                    if (!inline && match) {
                      return (
                        <SyntaxHighlighter
                          style={oneDark as any}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-md !my-2"
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      );
                    }

                    return (
                      <code
                        className={cn(
                          "bg-muted-foreground/20 px-1 py-0.5 rounded text-sm",
                          className
                        )}
                        {...rest}
                      >
                        {children}
                      </code>
                    );
                  },
                  // Ensure links open in new tab
                  a(props) {
                    const { children, href, ...rest } = props as any;
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                        {...rest}
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && <StreamingCursor />}

              {/* Property cards for assistant messages with tool results */}
              {role === "assistant" && (
                <PropertyCardRenderer
                  toolCalls={toolCalls}
                  isExecuting={
                    isStreaming &&
                    !toolCalls?.some(
                      (t) => t.toolName === "searchProperties" && t.result
                    )
                  }
                />
              )}

              {/* Provider cards for assistant messages with tool results */}
              {role === "assistant" && (
                <ProviderCardRenderer
                  toolCalls={toolCalls}
                  isExecuting={
                    isStreaming &&
                    !toolCalls?.some(
                      (t) => t.toolName === "searchProviders" && t.result
                    )
                  }
                />
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <time
          dateTime={new Date(timestamp).toISOString()}
          title={new Date(timestamp).toLocaleString()}
          className="text-xs text-muted-foreground mt-1"
        >
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </time>
      </div>
    </div>
  );
});

// =============================================================================
// StreamingChatMessage - NEW component for UIMessage streaming
// =============================================================================

interface StreamingChatMessageProps {
  message: UIMessage;
  userImage?: string;
  userName?: string;
  isLastAndStreaming?: boolean;
}

/**
 * StreamingChatMessage - Renders a UIMessage with real-time streaming support.
 *
 * Processes UIMessage.parts array to extract:
 * - Text parts (type: "text")
 * - Tool invocations (type: "tool-invocation")
 *
 * Features same layout as ChatMessage but adapted for UIMessage structure.
 */
export const StreamingChatMessage = memo(function StreamingChatMessage({
  message,
  userImage,
  userName,
  isLastAndStreaming = false,
}: StreamingChatMessageProps) {
  const isUser = message.role === "user";

  // Extract text content from parts
  const textContent = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");

  // Extract tool invocations from parts
  const toolInvocations = message.parts.filter(
    (p): p is any => p.type === "tool-invocation"
  );

  // Convert tool invocations to old ToolCall format for card renderers
  const toolCallsForRenderers = toolInvocations
    .filter((t) => t.state === "result")
    .map((t) => ({
      toolCallId: t.toolInvocationId,
      toolName: t.toolName,
      args: t.args,
      result: t.result,
    }));

  // Check if tools are currently executing
  const isToolExecuting = toolInvocations.some(
    (t) => t.state === "call" || t.state === "partial-call"
  );

  // Get user initials for fallback
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ms-auto flex-row-reverse" : "me-auto"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 flex-shrink-0">
        {isUser ? (
          <>
            <AvatarImage src={userImage} alt={userName || "You"} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getInitials(userName)}
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback className="text-xs bg-muted">AI</AvatarFallback>
          </>
        )}
      </Avatar>

      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
        {/* Message bubble */}
        <div
          className={cn(
            "px-4 py-2 text-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-2xl rounded-ee-sm"
              : "bg-muted rounded-2xl rounded-es-sm"
          )}
          dir="auto"
        >
          {isUser ? (
            // User messages: plain text
            <p className="whitespace-pre-wrap break-words">{textContent}</p>
          ) : (
            // AI messages: markdown with code highlighting
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code(props) {
                    const { node, inline, className, children, ...rest } = props as any;
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");

                    if (!inline && match) {
                      return (
                        <SyntaxHighlighter
                          style={oneDark as any}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-md !my-2"
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      );
                    }

                    return (
                      <code
                        className={cn(
                          "bg-muted-foreground/20 px-1 py-0.5 rounded text-sm",
                          className
                        )}
                        {...rest}
                      >
                        {children}
                      </code>
                    );
                  },
                  // Ensure links open in new tab
                  a(props) {
                    const { children, href, ...rest } = props as any;
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                        {...rest}
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {textContent}
              </ReactMarkdown>
              {isLastAndStreaming && !isUser && textContent && <StreamingCursor />}

              {/* Property cards for assistant messages with tool results */}
              {!isUser && (
                <PropertyCardRenderer
                  toolCalls={toolCallsForRenderers}
                  isExecuting={isLastAndStreaming && isToolExecuting}
                />
              )}

              {/* Provider cards for assistant messages with tool results */}
              {!isUser && (
                <ProviderCardRenderer
                  toolCalls={toolCallsForRenderers}
                  isExecuting={isLastAndStreaming && isToolExecuting}
                />
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <time
          dateTime={new Date(message._creationTime).toISOString()}
          title={new Date(message._creationTime).toLocaleString()}
          className="text-xs text-muted-foreground mt-1"
        >
          {formatDistanceToNow(message._creationTime, { addSuffix: true })}
        </time>
      </div>
    </div>
  );
});
