import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Loader2, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Newsletter } from "@shared/schema";

const newsletterSchema = z.object({
  title: z.string().min(5, "Sarlavha kamida 5 ta belgi bo'lishi kerak"),
  message: z.string().min(10, "Xabar kamida 10 ta belgi bo'lishi kerak"),
  imageUrl: z.string().url("To'g'ri rasm URL'sini kiriting").optional().or(z.literal("")),
});

type NewsletterForm = z.infer<typeof newsletterSchema>;

export default function AdminRassilka() {
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string>("");

  const { data: newsletters = [] } = useQuery<Newsletter[]>({
    queryKey: ["/api/newsletters"],
  });

  const form = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      title: "",
      message: "",
      imageUrl: "",
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: NewsletterForm) => {
      return apiRequest("POST", "/api/admin/send-newsletter", {
        title: data.title,
        message: data.message,
        imageUrl: data.imageUrl || null,
      });
    },
    onSuccess: () => {
      toast({ title: "✅ Rassilka muvaffaqiyatli yuborildi" });
      form.reset();
      setPreviewImage("");
      queryClient.invalidateQueries({ queryKey: ["/api/newsletters"] });
    },
    onError: () => {
      toast({
        title: "❌ Xatolik",
        description: "Rassilka yuborilmadi. Telegram sozlamalari tekshiring",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewsletterForm) => {
    sendMutation.mutate(data);
  };

  return (
    <AdminLayout title="Rassilka - Newsletter">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Yangi rassilka jo'natish</CardTitle>
              <CardDescription>
                Barcha mijozlarimizga Telegram orqali reklama va yangiliklar jo'nating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sarlavha</FormLabel>
                        <FormControl>
                          <Input placeholder="Masalan: Yangi mahsulotlar keldi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xabar matni</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masalan: Yangi kolektsiyamiz sizni kutmoqda! 50% gacha chegirma..."
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rasm URL (ixtiyoriy)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value) {
                                setPreviewImage(e.target.value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {previewImage && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Rasm ko'rinishi:</p>
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={sendMutation.isPending}
                    className="w-full"
                    data-testid="button-send-newsletter"
                  >
                    {sendMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Jo'natilmoqda...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Rassilka jo'natish
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* History */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tarix</CardTitle>
              <CardDescription>Oxirgi rassilkalar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {newsletters.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Hali rassilka jo'natilmagan
                  </p>
                ) : (
                  newsletters.slice(0, 10).map((newsletter) => (
                    <div key={newsletter.id} className="p-3 border rounded-lg text-sm space-y-1">
                      <p className="font-medium line-clamp-1">{newsletter.title}</p>
                      <p className="text-muted-foreground line-clamp-2">{newsletter.message}</p>
                      {newsletter.imageUrl && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <ImageIcon className="h-3 w-3" />
                          Rasm mavjud
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {newsletter.createdAt
                          ? new Date(newsletter.createdAt).toLocaleDateString("uz-UZ")
                          : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
