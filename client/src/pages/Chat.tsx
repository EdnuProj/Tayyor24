import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

export default function Chat() {
  const [, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const [customerPhone, setCustomerPhone] = useState(() => {
    const stored = localStorage.getItem("chatCustomerPhone");
    if (stored) return stored;
    const generated = `temp_${Date.now()}`;
    localStorage.setItem("chatCustomerPhone", generated);
    return generated;
  });
  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem("chatCustomerName") || "Mehmon";
  });
  const [showNameInput, setShowNameInput] = useState(
    !localStorage.getItem("chatCustomerName")
  );
  const [tempName, setTempName] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", customerPhone],
    enabled: !!customerPhone,
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
    onMutate: async (text: string) => {
      await queryClient.cancelQueries({
        queryKey: ["/api/chat", customerPhone],
      });

      const previousMessages = queryClient.getQueryData<ChatMessage[]>([
        "/api/chat",
        customerPhone,
      ]);

      const optimisticMessage: ChatMessage = {
        id: Math.random().toString(),
        customerPhone,
        customerName,
        message: text,
        senderType: "customer",
        isRead: false,
        createdAt: new Date(),
      };

      queryClient.setQueryData(
        ["/api/chat", customerPhone],
        (old: ChatMessage[] | undefined) => [...(old || []), optimisticMessage]
      );

      setMessage("");
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 0);

      return { previousMessages };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/chat", customerPhone],
      });
    },
    onError: (err, newTodo, context: any) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["/api/chat", customerPhone],
          context.previousMessages
        );
      }
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setCustomerName(tempName);
      localStorage.setItem("chatCustomerName", tempName);
      setShowNameInput(false);
      setTempName("");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
          data-testid="button-back-home"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Ortga
        </Button>

        <div className="max-w-2xl mx-auto h-[calc(100vh-150px)] flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">Qo'llab-quvvatlash</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Biz doimo sizga yordam berishga tayyorman
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <ScrollArea ref={scrollRef} className="flex-1 p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-3">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                    <p className="text-muted-foreground text-sm">
                      Xabar yozing va biz tez javob beramiz
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderType === "customer" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.senderType === "customer"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
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

            <CardContent className="border-t p-4 space-y-3">
              {showNameInput && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Ismingizni kiriting"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSaveName()
                    }
                    data-testid="input-chat-name"
                    className="text-sm"
                  />
                  <Button
                    onClick={handleSaveName}
                    disabled={!tempName.trim()}
                    size="sm"
                    data-testid="button-save-name"
                  >
                    Saqlash
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Xabar yozing..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-support-message"
                  className="text-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  size="icon"
                  data-testid="button-send-support"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StoreLayout>
  );
}
