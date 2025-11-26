import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, MessageCircle, Phone } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

interface ChatRoom {
  customerPhone: string;
  customerName: string;
  lastMessage?: ChatMessage;
}

export default function AdminChat() {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: rooms = [] } = useQuery<ChatRoom[]>({
    queryKey: ["/api/chat/rooms"],
  });

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: selectedPhone ? ["/api/chat", selectedPhone] : null,
    enabled: !!selectedPhone,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!selectedPhone) return;
      const selectedRoom = rooms.find(r => r.customerPhone === selectedPhone);
      return apiRequest("POST", "/api/chat/send", {
        customerPhone: selectedPhone,
        customerName: selectedRoom?.customerName || "Berilmagan",
        message: text,
        senderType: "admin",
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: selectedPhone ? ["/api/chat", selectedPhone] : null });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/rooms"] });
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    },
  });

  const handleSend = () => {
    if (message.trim() && selectedPhone) {
      sendMessageMutation.mutate(message);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const selectedRoom = rooms.find(r => r.customerPhone === selectedPhone);

  return (
    <AdminLayout title="Chat - Qo'llab-quvvatlash">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
        {/* Chat Rooms List */}
        <div className="lg:col-span-1 h-full">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5" />
                Suhbatlar
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-4">
                  {rooms.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Suhbat yo'q
                    </p>
                  ) : (
                    rooms.map((room) => (
                      <button
                        key={room.customerPhone}
                        onClick={() => setSelectedPhone(room.customerPhone)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedPhone === room.customerPhone
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        data-testid={`button-chat-room-${room.customerPhone}`}
                      >
                        <p className="font-medium truncate">{room.customerName}</p>
                        <p className="text-xs opacity-75 truncate">
                          {room.lastMessage?.message || "Hali xabar yo'q"}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 h-full">
          {selectedRoom ? (
            <Card className="flex flex-col h-full">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedRoom.customerName}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {selectedRoom.customerPhone}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea
                  ref={scrollRef}
                  className="h-full w-full p-4 space-y-4"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderType === "admin" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.senderType === "admin"
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
                  ))}
                </ScrollArea>
              </CardContent>

              {/* Input */}
              <div className="border-t p-4 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Xabar yozing..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-chat-message"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    size="icon"
                    data-testid="button-send-chat"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Suhbatni tanlang</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
