
import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, MapPin, Building2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactCard = ({ contact }) => {
  const handleCall = () => {
    // For RMC results, phone is international_phone_number
    const phoneNumber = contact.phone || contact.international_phone_number;
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    // For RMC results, phone is international_phone_number
    const rawPhoneNumber = contact.phone || contact.international_phone_number;
    const phoneNumber = rawPhoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${phoneNumber}`, '_blank');
  };

  const handleEmail = () => {
    window.location.href = `mailto:${contact.email}`;
  };

  const handleWebsite = () => {
    if (contact.website) {
      let url = contact.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `http://${url}`;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleMap = () => {
    if (contact.map_location && contact.map_location.trim() !== '') {
      window.open(contact.map_location, '_blank', 'noopener,noreferrer');
    } else if (contact.address) {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`;
      window.open(mapUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const hasPhone = contact.phone || contact.international_phone_number;
  const displayDistrict = contact.district || 'Kerala';
  const displayAddress = contact.address || contact.formatted_address;


  const NameComponent = () => (
    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">
      {contact.name}
    </h3>
  );

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-effect rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {contact.website ? (
            <a href={contact.website} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); handleWebsite(); }}>
              <NameComponent />
            </a>
          ) : (
            <NameComponent />
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Building2 className="h-4 w-4 text-emerald-600" />
            <span>{contact.category}</span>
          </div>
          {displayDistrict && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>{displayDistrict}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {hasPhone && (
          <>
            <Button onClick={handleCall} className="bg-emerald-500 hover:bg-emerald-600 text-white" size="sm">
              <Phone className="h-4 w-4 mr-1" /> Call
            </Button>
            <Button onClick={handleWhatsApp} className="bg-green-500 hover:bg-green-600 text-white" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
            </Button>
          </>
        )}
        {contact.email && (
          <Button onClick={handleEmail} className="bg-blue-500 hover:bg-blue-600 text-white" size="sm">
            <Mail className="h-4 w-4 mr-1" /> Email
          </Button>
        )}
        {contact.website && (
          <Button onClick={handleWebsite} className="bg-purple-500 hover:bg-purple-600 text-white" size="sm">
            <Globe className="h-4 w-4 mr-1" /> Website
          </Button>
        )}
        {(displayAddress || (contact.map_location && contact.map_location.trim() !== '')) && (
           <Button onClick={handleMap} className="bg-orange-500 hover:bg-orange-600 text-white col-span-2" size="sm">
            <MapPin className="h-4 w-4 mr-1" /> View on Map
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ContactCard;
