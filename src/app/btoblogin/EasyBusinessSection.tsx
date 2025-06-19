import React from 'react';
import Image from 'next/image';
import { FaExternalLinkAlt } from 'react-icons/fa';

export function EasyBusinessSection() {
  // Data for left column
  const itemsLeft = [
    {
      title: 'Free & Quick Registration',
      text: 'Register with us for free and get access to all products including 1M+ global properties, LCC and full-service carriers, 200,000+ global sightseeing, car rentals, local transfers, cruise and holiday packages in no time.',
      imgSrc: '/images/e1.png',
      alt: 'Laptop Registration',
    },
    {
      title: 'Rewards',
      text: 'Our popular rewards program is designed exclusively for all the bookers to earn reward points for each booking and redeem them for exciting gifts.',
      imgSrc: '/images/e2.png',
      alt: 'Trophy',
    },
    {
      title: 'Payment Options',
      text: 'We offer various payment methods such as credit card, net banking, bank transfer, cash deposit and other alternative payment options in more than 50 currencies. Bank guarantee and floating deposits are also accepted to open credit line subject to terms and conditions.',
      imgSrc: '/images/e3.png',
      alt: 'Payment Options',
    },
  ];

  // Data for right column
  const itemsRight = [
    {
      title: 'Online ledgers, Vouchers and Sales report',
      text: 'We offer online information such as ledgers, sales reports, vouchers, etc., which remarkably reduces the manual effort to manage accounts by agents.',
      imgSrc: '/images/e4.png',
      alt: 'Sales Graph',
      showHeader: true,
      headerText: 'Grow Your Business With Us',
    },
    {
      title: '24 Service Delivery',
      text: 'Our globally distributed customer service team that speaks your language in more than 100 countries provides all pre and post-booking support, 24x7 to all agent partners.',
      imgSrc: '/images/e5.png',
      alt: '24 Service Delivery',
    },
  ];

  return (
    <div className="bg-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      {/* Section header */}
      <div className="max-w-7xl mx-auto text-center relative">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Make It As Easy As Possible To Run Your Business
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          All you need to do is focus on your customer. We will take care of the rest!
        </p>
      </div>

      {/* Grid with larger gap and increased internal padding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-16 lg:gap-x-24 xl:gap-x-32 max-w-7xl mx-auto">
        {/* Left Column */}
        <div className="flex flex-col space-y-16 pr-8 md:pr-12 lg:pr-16 xl:pr-24">
          {itemsLeft.map((item, idx) => (
            <ColumnItemLeft key={idx} item={item} />
          ))}
        </div>

        {/* Right Column */}
        <div className="flex flex-col space-y-16 pl-8 md:pl-12 lg:pl-16 xl:pl-24">
          {itemsRight.map((item, idx) => (
            <ColumnItemRight key={idx} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Subcomponent for left-column items without clip-path but with bottom-right corner half-rounded
type ColumnItemLeftProps = {
  item: {
    title: string;
    text: string;
    imgSrc: string;
    alt: string;
  };
};

function ColumnItemLeft({ item }: ColumnItemLeftProps) {
  return (
    <div className="relative w-full h-56 lg:h-56 -ml-[220px]">
      {/* Image container full width with bottom-right corner half-rounded */}
      <div className="absolute inset-0 w-96 h-full overflow-hidden" style={{ borderBottomRightRadius: '50%' }}>
        <Image
          src={item.imgSrc}
          alt={item.alt}
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>

      {/* Floating card positioned at bottom-right */}
      <div className="absolute  bottom-4 -right-[390px] bg-gray-800 bg-opacity-90 text-white p-4 rounded-lg w-80 lg:w-[400px]">
        <h3 className="text-xl text-center font-semibold mb-2">{item.title}</h3>
        <p className="text-sm text-center">{item.text}</p>
      </div>
    </div>
  );
}

// Subcomponent for right-column items without clip-path but with bottom-right corner half-rounded
type ColumnItemRightProps = {
  item: {
    title: string;
    text: string;
    imgSrc: string;
    alt: string;
    showHeader?: boolean;
    headerText?: string;
  };
};

function ColumnItemRight({ item }: ColumnItemRightProps) {
  return (
    <div className="relative w-full h-56 lg:h-64 ml-[100px]">
      {/* Optional header */}
      {item.showHeader && (
        <div className="absolute -top-1 right-4 text-2xl font-bold text-blue-600 flex items-center z-10">
          {item.headerText}
          <FaExternalLinkAlt className="ml-2 text-xl" />
        </div>
      )}

      {/* Image container full width with bottom-right corner half-rounded */}
      <div className="absolute inset-0 mt-[120px] w-96 h-full overflow-hidden" style={{ borderBottomLeftRadius: '50%' }}>
        <Image
          src={item.imgSrc}
          alt={item.alt}
          layout="fill"
          objectFit={item.showHeader ? 'contain' : 'cover'}
          priority
        />
      </div>

      {/* Floating card positioned at bottom-left */}
      <div className="absolute mt-[190px]  -left-[220px] bg-gray-800 bg-opacity-90 text-white p-4 rounded-lg w-80 lg:w-[350px]">
        <h3 className="text-xl text-center font-semibold mb-2">{item.title}</h3>
        <p className="text-sm text-center">{item.text}</p>
      </div>
    </div>
  );
}
