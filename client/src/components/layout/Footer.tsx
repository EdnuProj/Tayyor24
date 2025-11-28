import { Link } from "wouter";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { SiTelegram, SiInstagram, SiFacebook } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoUrl from "@assets/photo_2025-05-11_15-33-54_1764328387857.jpg";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img src={logoUrl} alt="Lavyor" className="h-9 w-auto object-contain" />
              <span className="text-xl font-semibold">Tayyor24</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sifatli mahsulotlar va tez yetkazib berish xizmati. Bizning maqsadimiz - 
              sizning qulayligingiz va mamnuniyatingiz.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-muted hover-elevate"
                data-testid="link-social-telegram"
              >
                <SiTelegram className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/tayyor24/"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-muted hover-elevate"
                data-testid="link-social-instagram"
              >
                <SiInstagram className="h-4 w-4" />
              </a>
              <a
                href="#
                "
                className="flex h-9 w-9 items-center justify-center rounded-md bg-muted hover-elevate"
                data-testid="link-social-facebook"
              >
                <SiFacebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Tezkor havolalar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Barcha mahsulotlar
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Kategoriyalar
                </Link>
              </li>
              <li>
                <Link href="/products?filter=popular" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Ommabop mahsulotlar
                </Link>
              </li>
              <li>
                <Link href="/products?filter=new" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Yangi mahsulotlar
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Bog'lanish</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+998 33 020 60 00 </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@tayyor24.uz</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Ohanagaron shahar yoshlar tenxoparki</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Yangiliklar</h3>
            <p className="text-sm text-muted-foreground">
              Chegirmalar va yangi mahsulotlardan xabardor bo'ling
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Email manzilingiz"
                className="flex-1"
                data-testid="input-newsletter"
              />
              <Button size="icon" data-testid="button-newsletter-submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Tayyor24. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Maxfiylik siyosati
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Foydalanish shartlari
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
