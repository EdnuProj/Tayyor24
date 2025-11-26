import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, ArrowLeft, Phone, User } from "lucide-react";
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

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8">
        {!isStarted ? (
          <div className="max-w-md mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="mb-6"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ortga
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Qo'llab-quvvatlash</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Bizga murojaat qiling va tez javob oling
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Ismingiz</label>
                    <Input
                      placeholder="Ismingizni kiriting"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      data-testid="input-chat-name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Telefon raqam
                    </label>
                    <Input
                      placeholder="+998 XX XXX XX XX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      data-testid="input-chat-phone"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={handleStart}
                    className="w-full"
                    disabled={!customerPhone.trim() || !customerName.trim()}
                    size="lg"
                    data-testid="button-start-support-chat"
                  >
                    Suhbatni boshlash
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto h-[calc(100vh-120px)] flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{customerName}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {customerPhone}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsStarted(false);
                      setCustomerPhone("");
                      setCustomerName("");
                      setMessage("");
                    }}
                    data-testid="button-end-chat"
                  >
                    Chiqish
                  </Button>
                </div>
              </CardHeader>

              <ScrollArea
                ref={scrollRef}
                className="flex-1 p-4 space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Suhbatni boshlang...</p>
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

              <CardContent className="border-t p-4 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Xabar yozing..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-support-message"
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
        )}
      </div>
    </StoreLayout>
  );
}
