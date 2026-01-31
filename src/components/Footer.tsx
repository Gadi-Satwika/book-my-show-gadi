import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    "Movies Now Showing": ["Action", "Comedy", "Drama", "Horror", "Romance", "Thriller"],
    "Upcoming Movies": ["English", "Hindi", "Tamil", "Telugu", "Malayalam"],
    "Help": ["About Us", "Contact Us", "FAQs", "Terms & Conditions", "Privacy Policy"],
  };

  return (
    <footer className="bg-secondary/50 border-t border-border mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-gradient mb-4">
              BookMyShow
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Your one-stop destination for booking movie tickets, events, and more.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 text-foreground">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 BookMyShow Clone. All rights reserved. Made with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
