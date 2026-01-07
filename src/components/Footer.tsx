import { motion } from "framer-motion";
import { MapPin, Mail, Phone, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-navy-deep text-primary-foreground">
      {/* CTA Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Map Pakistan's Future?
            </h2>
            <p className="text-primary-foreground/60 mb-8">
              Join us in building the national mapping infrastructure that will serve 
              220+ million citizens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all">
                Contact Us
              </button>
              <button className="px-8 py-3 border-2 border-primary-foreground/30 text-primary-foreground rounded-lg font-semibold hover:bg-primary-foreground/10 transition-all">
                View Documentation
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-lg">NPMI</span>
                <span className="text-xs text-primary-foreground/60 ml-2">Pakistan</span>
              </div>
            </div>
            <p className="text-primary-foreground/60 text-sm max-w-md mb-4">
              National Public Mapping Initiative - Building Pakistan's sovereign, 
              scalable mapping platform with satellite imagery, real-time navigation, 
              and location-based services.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
              <Globe className="w-4 h-4" />
              <span>Government of Pakistan Initiative</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#roadmap" className="hover:text-primary transition-colors">Roadmap</a></li>
              <li><a href="#technology" className="hover:text-primary transition-colors">Technology</a></li>
              <li><a href="#team" className="hover:text-primary transition-colors">Team</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/60">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@npmi.gov.pk</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+92-51-XXXXXXX</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Survey of Pakistan,<br />Rawalpindi, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/50">
          <div>
            © 2026 National Public Mapping Initiative. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
