import React, { useState, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, Building, MapPin, Briefcase, Plane, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [language, setLanguage] = useState('en');
  const pathname = usePathname() || '/';

  const navigation = [
    { name: 'Home', href: '/' },
    {
      name: 'Products',
      isProductDropdown: true,
      subItems: [
        { name: 'Hotels & Apartments', href: '/products/hotels-apartments', icon: Building },
        { name: 'Trip Planner', href: '/products/trip-planner', icon: MapPin },
        { name: 'Packages', href: '/products/packages', icon: Briefcase },
        { name: 'Flight Ticket', href: '/products/flight-ticket', icon: Plane },
      ],
    },
    {
      name: 'About',
      isAboutDropdown: true,
      subItems: [
        { name: 'About Company', href: '/about/company' },
        { name: 'Our Blog', href: '/blog' },
      ],
    },
    {
      name: 'Partners',
      isPartnersDropdown: true, // Added flag for Partners dropdown
      subItems: [
        { name: 'Hotel Partners', href: '/partners/hotel' },
        { name: 'Flight Partners', href: '/partners/flight' },
        { name: 'Activities & Tour Partners', href: '/partners/activities-tours' },
      ],
    },
    { name: 'Clients', href: '/clients' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Pricing', href: '/pricing' },
  ];

  const languages = [
    { code: 'en', label: 'English', flagSrc: '/images/us.png' },
    { code: 'es', label: 'Español', flagSrc: '/images/es.png' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <nav className="bg-white shadow-lg pt-4">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center ml-44">
              <Image
                src="/images/bdesk.jpg"
                alt="JETIXIA Logo"
                width={90}
                height={10}
                className="object-contain mt-3"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-1 justify-center space-x-6">
            {navigation.map((item) =>
              'subItems' in item ? (
                <Menu key={item.name} as="div" className="relative">
                  <Menu.Button
                    className={`inline-flex items-center px-1 pt-1 text-md font-medium ${
                      pathname === item.href ||
                      item.subItems.some((sub) => pathname === sub.href) ||
                      (item.subItems[0] &&
                        pathname.startsWith(`/${item.subItems[0].href.split('/')[1]}`))
                        ? 'text-black '
                        : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    {item.name}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Menu.Button>

                  {/* Use Transition.Root for multiple animating children */}
                  <Transition.Root as={Fragment}>
                    {/* Backdrop for dropdown focus */}
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="fixed inset-0 bg-black/10 z-[90]"></div>
                    </Transition.Child>

                    {/* Menu Items - now wrapped in Transition.Child */}
                    <Transition.Child
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-150"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      {item.isProductDropdown ? (
                        <Menu.Items className="absolute z-[999] mt-2 w-[400px] bg-[#EBF3FB] rounded-lg origin-top-left left-1/2 -translate-x-1/2">
                          <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">JETIXIA Products</h3>
                            <p className="text-gray-600 text-sm mb-6">
                              Explore our range of curated travel solutions tailored for your business needs.
                            </p>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Main Products</h4>
                            <div className="space-y-4">
                              {item.subItems.map((sub) => (
                                <Menu.Item key={sub.name}>
                                  {({ active }) => (
                                    <Link
                                      href={sub.href}
                                      className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                                        active ? 'bg-blue-100' : 'hover:bg-blue-50'
                                      }`}
                                    >
                                      <div className="flex items-center">
                                        {sub.icon && <sub.icon className="h-6 w-6 text-blue-600 mr-4" />}
                                        <span className="text-gray-800 text-lg font-medium">{sub.name}</span>
                                      </div>
                                      <ArrowRight className="h-5 w-5 text-gray-500" />
                                    </Link>
                                  )}
                                </Menu.Item>
                              ))}
                            </div>
                          </div>
                        </Menu.Items>
                      ) : item.isAboutDropdown ? (
                        <Menu.Items className="absolute z-[999] mt-2 w-[580px] bg-[#EBF3FB] rounded-lg origin-top-left left-1/2 -translate-x-1/2">
                          <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">We Are JETIXIA</h3>
                            <p className="text-gray-600 text-sm mb-6">
                              we are driven by a commitment to service excellence, trust, and innovation. Our experienced multilingual team ensures that each itinerary is not just a trip but a tailored travel experience aligned with our partners' goals.
                            </p>
                            <div className="divide-y divide-gray-200">
                              {item.subItems.map((sub) => (
                                <Menu.Item key={sub.name}>
                                  {({ active }) => (
                                    <Link
                                      href={sub.href}
                                      className={`flex items-center justify-between py-3 transition-colors duration-200 ${
                                        active ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:text-blue-700'
                                      }`}
                                    >
                                      <span className="text-lg font-medium">{sub.name}</span>
                                      <ArrowRight className="h-5 w-5 text-gray-500" />
                                    </Link>
                                  )}
                                </Menu.Item>
                              ))}
                            </div>
                          </div>
                        </Menu.Items>
                      ) : item.isPartnersDropdown ? ( // Conditional render for Partners dropdown
                        <Menu.Items className="absolute z-[999] mt-2 w-[580px] bg-[#EBF3FB] rounded-lg origin-top-left left-1/2 -translate-x-1/2">
                          <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Grow With Us</h3>
                            <p className="text-gray-600 text-sm mb-6">
                              Join our network of hotels, airlines, and service providers to reach more B2B clients across the globe.
                            </p>
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Our Partners</h4>
                            <div className="divide-y divide-gray-200">
                              {item.subItems.map((sub) => (
                                <Menu.Item key={sub.name}>
                                  {({ active }) => (
                                    <Link
                                      href={sub.href}
                                      className={`flex items-center justify-between py-3 transition-colors duration-200 ${
                                        active ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:text-blue-700'
                                      }`}
                                    >
                                      <span className="text-lg font-medium">{sub.name}</span>
                                      <ArrowRight className="h-5 w-5 text-gray-500" />
                                    </Link>
                                  )}
                                </Menu.Item>
                              ))}
                            </div>
                          </div>
                        </Menu.Items>
                      ) : (
                        // Default generic dropdown for any other items with subItems (if any)
                        <Menu.Items className="absolute z-[999] mt-2 w-48 bg-white rounded-md">
                          <div className="py-1">
                            {item.subItems.map((sub) => (
                              <Menu.Item key={sub.name}>
                                {({ active }) => (
                                  <Link
                                    href={sub.href}
                                    className={`block px-4 py-2 text-base ${
                                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                    }`}
                                  >
                                    {sub.name}
                                  </Link>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        </Menu.Items>
                      )}
                    </Transition.Child>
                  </Transition.Root>
                </Menu>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-md font-medium ${
                    pathname === item.href
                      ? 'text-black '
                      : 'text-gray-700 hover:text-black'
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>

          {/* Right-side: Language selector & Contact Us */}
          <div className="flex items-center space-x-4 mr-20">
            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex items-center px-2 py-1 text-base font-medium text-gray-700 hover:text-black">
                <Image
                  src={currentLang.flagSrc}
                  alt={currentLang.label}
                  width={25}
                  height={20}
                  className="object-contain"
                />
                <span className="ml-1 -mt-0.5">{currentLang.label}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </Menu.Button>
              {/* Use Transition.Root for multiple animating children */}
              <Transition.Root as={Fragment}>
                {/* Backdrop for dropdown focus */}
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/10 z-[90]"></div>
                </Transition.Child>

                {/* Language dropdown - wrapped in Transition.Child */}
                <Transition.Child
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-[999] mt-2 w-32 bg-white rounded-md">
                    <div className="py-1">
                      {languages.map((lang) => (
                        <Menu.Item key={lang.code}>
                          {({ active }) => (
                            <button
                              onClick={() => setLanguage(lang.code)}
                              className={`w-full text-left px-4 py-2 text-base flex items-center ${
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              <Image
                                src={lang.flagSrc}
                                alt={lang.label}
                                width={25}
                                height={20}
                                className="object-contain"
                              />
                              <span className="ml-2">{lang.label}</span>
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition.Child>
              </Transition.Root>
            </Menu>

            <Link
              href="/contact"
              className="inline-flex items-center px-4 ml-10 py-2 text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}