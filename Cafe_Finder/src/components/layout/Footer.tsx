import React from 'react';
import Link from 'next/link';
import { Coffee, Heart, Globe, Wifi, ShieldCheck, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-nomad-navy-950 border-t border-nomad-navy-800 text-nomad-muted-dark py-12 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-nomad-teal-600 text-white flex items-center justify-center shadow-teal-glow">
                <Coffee className="w-4 h-4" />
              </div>
              <span className="font-serif font-black text-base tracking-tight text-nomad-sand-50">
                Nomad<span className="text-nomad-teal-400">Spot</span>
              </span>
            </div>
            <p className="text-xs text-nomad-muted-dark leading-relaxed">
              Global directory of work-friendly cafes and remote hubs with verified Wi-Fi speeds, plug density, and community reviews.
            </p>
          </div>

          {/* Directory Links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-nomad-sand-200 mb-3">
              Explore Spots
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/?city=San+Francisco" className="hover:text-nomad-teal-400 transition-colors">
                  San Francisco
                </Link>
              </li>
              <li>
                <Link href="/?city=New+York" className="hover:text-nomad-teal-400 transition-colors">
                  New York (Brooklyn)
                </Link>
              </li>
              <li>
                <Link href="/?city=Ratnagiri" className="hover:text-nomad-teal-400 transition-colors">
                  Ratnagiri & Konkan Coast
                </Link>
              </li>
              <li>
                <Link href="/?city=Bengaluru" className="hover:text-nomad-teal-400 transition-colors">
                  Bengaluru Tech Hubs
                </Link>
              </li>
            </ul>
          </div>

          {/* Nomad Features */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-nomad-sand-200 mb-3">
              Nomad Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-nomad-teal-400" />
                <span>Verified Wi-Fi Speed Tests</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-nomad-teal-400" />
                <span>Power Outlet Guarantee</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-nomad-teal-400" />
                <span>OpenStreetMap & Geolocation</span>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-nomad-sand-200 mb-3">
              Community
            </h4>
            <p className="text-xs text-nomad-muted-dark mb-3">
              Know a productive workspace or cafe that isn't listed? Add it to the map in seconds.
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-nomad-teal-400 hover:text-nomad-teal-300 transition-colors"
            >
              Submit a Workspace →
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t border-nomad-navy-800/80 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
          <p className="text-nomad-muted-dark">
            © {new Date().getFullYear()} NomadSpot Directory · Built for remote workers, designers & developers globally.
          </p>
          <div className="flex items-center gap-4 text-nomad-muted-dark">
            <span className="flex items-center gap-1">
              Data via <Globe className="w-3.5 h-3.5 text-nomad-teal-400 ml-1" /> OpenStreetMap
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
