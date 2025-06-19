import React from 'react';
import Image from 'next/image';

export function NewsAndPartnershipSection() {
  const newsItems = [
    {
      image: '/images/t5.png', // Placeholder image for news
      title: 'JETIXIA.COM and WebEngage join hands to deliver hyper-personalized services to customers',
      description: 'the leading global travel distribution platform, has announced a strategic partnership with WebEngage, a leading marketing automation company, for a comprehensive digital transformation. TBO will harness WebEngage’s cutting-edge automation and AI-ML tools, journey designers, and personalization engines to empower travel agents to serve their customers effectively.',
      link: '#', // Link for "Read More"
    },
    {
      image: '/images/t5.png', // Placeholder image for news
      title: 'JETIXIA.COM and WebEngage join hands to deliver hyper-personalized services to customers',
      description: 'the leading global travel distribution platform, has announced a strategic partnership with WebEngage, a leading marketing automation company, for a comprehensive digital transformation. TBO will harness WebEngage’s cutting-edge automation and AI-ML tools, journey designers, and personalization engines to empower travel agents to serve their customers effectively.',
      link: '#', // Link for "Read More"
    },
    {
      image: '/images/t5.png', // Placeholder image for news
      title: 'JETIXIA.COM and WebEngage join hands to deliver hyper-personalized services to customers',
      description: 'the leading global travel distribution platform, has announced a strategic partnership with WebEngage, a leading marketing automation company, for a comprehensive digital transformation. TBO will harness WebEngage’s cutting-edge automation and AI-ML tools, journey designers, and personalization engines to empower travel agents to serve their customers effectively.',
      link: '#', // Link for "Read More"
    },
  ];

  return (
    <div className="bg-gray-100 py-5 mb-20 px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-7xl mx-auto">
        {/* You can add a section title here if needed, it's not explicitly in the provided image "added frmae.jpg" */}
        {/* <h2 className="text-4xl font-bold text-gray-800 mb-12">Latest News</h2> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col items-center">
              <div className="relative w-full h-48">
                <Image
                  src={item.image}
                  alt={item.title}
                  layout="fill"
                  objectFit="cover"
                  priority
                />
              </div>
              <div className="p-6 text-left flex-grow">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 leading-tight">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-4">{item.description}</p>
                <a href={item.link} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center">
                  Read More
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}