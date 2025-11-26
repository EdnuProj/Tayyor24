import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: isStarted && customerPhone ? ["/api/chat", customerPhone] : null,
    enabled: !!customerPhone && isStarted,
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest("POST", "/api/chat/send", {
        customerPhone,
        customerName,
        message: text,
        senderType: "customer",
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ["/api/chat", customerPhone],
      });
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    },
  });

  const handleStart = () => {
    if (customerPhone.trim() && customerName.trim()) {
      setIsStarted(true);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        data-testid="button-open-chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-h-96 shadow-xl z-40 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
        <CardTitle className="text-base">Qo'llab-quvvatlash</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsOpen(false);
            setIsStarted(false);
            setCustomerPhone("");
            setCustomerName("");
            setMessage("");
          }}
          className="h-6 w-6"
          data-testid="button-close-chat"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
        {!isStarted ? (
          <div className="flex flex-col gap-3 p-4">
            <div>
              <label className="text-sm font-medium">Ismingiz</label>
              <Input
                placeholder="Ismingizni kiriting"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                data-testid="input-support-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Telefon</label>
              <Input
                placeholder="+998 XX XXX XX XX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                data-testid="input-support-phone"
              />
            </div>
            <Button
              onClick={handleStart}
              className="w-full"
              disabled={!customerPhone.trim() || !customerName.trim()}
              data-testid="button-start-chat"
            >
              Suhbatni boshlash
            </Button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <ScrollArea
              ref={scrollRef}
              className="flex-1 p-4 space-y-3 w-full"
            >
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center">
                  Suhbatni boshlang...
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderType === "customer" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded text-sm ${
                        msg.senderType === "customer"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted rounded-bl-none"
                      }`}
                    >
                      <p className="break-words">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString("uz-UZ", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Xabar yozing..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-widget-message"
                  className="text-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  size="icon"
                  className="h-9 w-9"
                  data-testid="button-send-widget"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
