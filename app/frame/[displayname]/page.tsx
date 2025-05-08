import { Metadata } from "next";

export async function generateMetadata({ 
  params, 
  searchParams 
}: { 
  params: { displayname: string }, 
  searchParams: { [key: string]: string | string[] | undefined } 
}): Promise<Metadata> {
  const displayName = params.displayname;
  const encodedDisplayName = encodeURIComponent(displayName);
  
  // Check if we're using a data URL approach
  const imageDataUrl = searchParams.imageDataUrl as string | undefined;
  
  // Determine image URL based on available parameters
  let imageUrl: string;
  
  if (imageDataUrl) {
    // Use the provided data URL
    imageUrl = imageDataUrl;
  } else if (process.env.BLOB_ACCOUNT) {
    // Use Vercel Blob storage
    imageUrl = `https://${process.env.BLOB_ACCOUNT}.public.blob.vercel-storage.com/images/${encodedDisplayName}.png`;
  } else {
    // Fallback to local storage option
    imageUrl = `${process.env.NEXT_PUBLIC_URL}/images/${encodedDisplayName}.png`;
  }

  // Full URL of this page for Twitter cards
  const pageUrl = `${process.env.NEXT_PUBLIC_URL}/frame/${encodedDisplayName}`;

  const frame = {
    version: "next",
    imageUrl: imageUrl,
    button: {
      title: "Generate Zora Collage",
      action: {
        type: "launch_frame",
        name: "Launch App",
        url: process.env.NEXT_PUBLIC_URL,
        splashImageUrl: `${process.env.NEXT_PUBLIC_URL}/images/splash.png`,
        splashBackgroundColor: "#000000",
      },
    },
  };

  return {
    title: `${displayName}'s Zora NFT Collage`,
    description: `Check out ${displayName}'s NFT collection visualized in this custom Zora Collage`,
    openGraph: {
      title: `${displayName}'s Zora NFT Collage`,
      description: `Check out ${displayName}'s NFT collection visualized in this custom Zora Collage`,
      images: [{ url: imageUrl, alt: `${displayName}'s Zora Collage` }],
      url: pageUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName}'s Zora NFT Collage`,
      description: `Check out ${displayName}'s NFT collection visualized in this custom Zora Collage`,
      images: [imageUrl],
      creator: "@zoratoken",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function FramePage({ 
  params,
  searchParams 
}: { 
  params: { displayname: string },
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const displayName = params.displayname;
  const imageDataUrl = searchParams.imageDataUrl as string | undefined;
  const encodedDisplayName = encodeURIComponent(displayName);
  
  // Determine image URL for display
  let imageUrl: string;
  
  if (imageDataUrl) {
    imageUrl = imageDataUrl;
  } else if (process.env.BLOB_ACCOUNT) {
    imageUrl = `https://${process.env.BLOB_ACCOUNT}.public.blob.vercel-storage.com/images/${encodedDisplayName}.png`;
  } else {
    imageUrl = `/images/${encodedDisplayName}.png`;
  }
  
  // Prepare Twitter share URL
  const tweetText = `Check out my Zora NFT Collage! Made with @zoratoken #ZoraCollage`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_URL}/frame/${encodedDisplayName}`)}`;
  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl w-full mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">
          {displayName}&apos;s Zora NFT Collage
        </h1>
        
        <div className="my-8 relative border-4 border-gray-900 shadow-xl">
          {/* Image preview - use img tag for data URLs */}
          {imageDataUrl ? (
            <img 
              src={imageDataUrl} 
              alt={`${displayName}'s collage`} 
              className="w-full"
            />
          ) : (
            <img 
              src={imageUrl} 
              alt={`${displayName}'s collage`} 
              className="w-full"
            />
          )}
        </div>
        
        <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
          <a 
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <svg width="20" height="16" viewBox="0 0 20 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 1.895a8.274 8.274 0 0 1-2.357.637A4.058 4.058 0 0 0 19.448.295a8.299 8.299 0 0 1-2.606.98A4.127 4.127 0 0 0 13.847 0c-2.65 0-4.596 2.433-3.998 4.959A11.702 11.702 0 0 1 1.392.739a4.022 4.022 0 0 0 1.27 5.393A4.122 4.122 0 0 1 .8 5.595v.05c0 2.015 1.44 3.695 3.356 4.079a4.169 4.169 0 0 1-1.849.07 4.108 4.108 0 0 0 3.831 2.807A8.306 8.306 0 0 1 0 14.185a11.717 11.717 0 0 0 6.29 1.832c7.618 0 11.922-6.434 11.663-12.205A8.354 8.354 0 0 0 20 1.895Z" fill="currentColor"/>
            </svg>
            Share on Twitter
          </a>
          
          <a 
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 text-black font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Create Your Own
          </a>
        </div>
        
        <p className="mt-8 text-gray-400 text-sm">
          Create your own NFT collage by entering your Zora handle on the homepage.
        </p>
      </div>
    </main>
  );
}
