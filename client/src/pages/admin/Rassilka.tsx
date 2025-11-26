import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Loader2, Image as ImageIcon, Upload, X, Users, Truck } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [courierPreviewImage, setCourierPreviewImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const courierFileInputRef = useRef<HTMLInputElement>(null);

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

  const courierForm = useForm<NewsletterForm>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      title: "",
      message: "",
      imageUrl: "",
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Xatolik", description: "Iltimos, rasm faylini tanlang", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      form.setValue("imageUrl", dataUrl);
      setPreviewImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleCourierFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Xatolik", description: "Iltimos, rasm faylini tanlang", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      courierForm.setValue("imageUrl", dataUrl);
      setCourierPreviewImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

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

  const sendCourierMutation = useMutation({
    mutationFn: async (data: NewsletterForm) => {
      return apiRequest("POST", "/api/admin/send-courier-rassilka", {
        title: data.title,
        message: data.message,
        imageUrl: data.imageUrl || null,
      });
    },
    onSuccess: () => {
      toast({ title: "✅ Kuryer rassilkasi muvaffaqiyatli yuborildi" });
      courierForm.reset();
      setCourierPreviewImage("");
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

  const onCourierSubmit = (data: NewsletterForm) => {
    sendCourierMutation.mutate(data);
  };

  return (
    <AdminLayout title="Rassilka - Newsletter">
      {/* Customers Rassilka */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Mijozlarga Rassilka
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Yangi rassilka</CardTitle>
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

                  <div className="space-y-3">
                    <FormLabel>Rasm (ixtiyoriy)</FormLabel>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Upload className="h-5 w-5 mx-auto mb-1" />
                        Rasm yuklash
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        data-testid="input-file-upload"
                      />
                      {previewImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage("");
                            form.setValue("imageUrl", "");
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="px-4 py-2 border rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                          data-testid="button-remove-image"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

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

          {/* History */}
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

      {/* Kuryerlarga Rassilka - Separate Section Below */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Truck className="w-6 h-6" />
          Kuryerlarga Rassilka
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Yangi rassilka</CardTitle>
              <CardDescription>
                Barcha faol kuryerlarimizga Telegram orqali yangiliklar va buyurtmalar jo'nating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...courierForm}>
                <form onSubmit={courierForm.handleSubmit(onCourierSubmit)} className="space-y-6">
                  <FormField
                    control={courierForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sarlavha</FormLabel>
                        <FormControl>
                          <Input placeholder="Masalan: Yangi buyurtmalar mavjud!" {...field} data-testid="input-courier-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courierForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xabar matni</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masalan: Yangi buyurtmalar sizni kutmoqda. App-ni ochasiz!"
                            rows={6}
                            {...field}
                            data-testid="textarea-courier-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <FormLabel>Rasm (ixtiyoriy)</FormLabel>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => courierFileInputRef.current?.click()}
                        className="flex-1 border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                        data-testid="button-upload-courier-image"
                      >
                        <Upload className="h-5 w-5 mx-auto mb-1" />
                        Rasm yuklash
                      </button>
                      <input
                        ref={courierFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCourierFileUpload}
                        className="hidden"
                        data-testid="input-file-upload-courier"
                      />
                      {courierPreviewImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setCourierPreviewImage("");
                            courierForm.setValue("imageUrl", "");
                            if (courierFileInputRef.current) courierFileInputRef.current.value = "";
                          }}
                          className="px-4 py-2 border rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                          data-testid="button-remove-courier-image"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {courierPreviewImage && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Rasm ko'rinishi:</p>
                      <img
                        src={courierPreviewImage}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={sendCourierMutation.isPending}
                    className="w-full"
                    data-testid="button-send-courier-rassilka"
                  >
                    {sendCourierMutation.isPending ? (
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
