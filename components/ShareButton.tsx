"use client";

import { sdk } from "@farcaster/frame-sdk";
import { useState, useEffect } from "react";
import * as htmlToImage from 'html-to-image';

interface ShareButtonProps {
  displayName: string;
}

export function ShareButton({ displayName }: ShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'capturing' | 'uploading' | 'ready' | 'sharing' | 'error'>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Storage preference - 'data-url', 'local', 'blob', or 'mock'
  const [storageOption] = useState<'data-url' | 'local' | 'blob' | 'mock'>('local');
  // Platform to share to - 'twitter' or 'farcaster'
  const [platform, setPlatform] = useState<'twitter' | 'farcaster'>('twitter');

  // Detect if user is on mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const captureAndSaveImage = async () => {
    // Reset state
    setStatus('capturing');
    setErrorMessage(null);
    
    // Get the collage element
    const collageContainer = document.getElementById('collage-container');
    
    if (!collageContainer) {
      setStatus('error');
      setErrorMessage('Could not find collage element');
      return;
    }
    
    try {
      // Create a dataUrl from the DOM node
      const dataUrl = await htmlToImage.toPng(collageContainer, {
        quality: 1.0,
        pixelRatio: isMobile ? 3 : 2, // Higher resolution for mobile
        cacheBust: true,
        backgroundColor: '#000000', // Explicitly set black background
        style: {
          transform: 'none',
          width: `${collageContainer.offsetWidth}px`,
          height: `${collageContainer.offsetHeight}px`,
          backgroundColor: '#000000' // Also set in style
        }
      });
      
      // If using data-url approach and sharing to Farcaster, we can skip the upload
      if (storageOption === 'data-url' && platform === 'farcaster') {
        setImageUrl(dataUrl);
        setStatus('ready');
        return;
      }
      
      // For Twitter, we need a public URL, so we'll upload to server
      setStatus('uploading');

      const saveRes = await fetch("/api/save-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          displayName,
          imageData: dataUrl,
          storageOption: platform === 'twitter' ? 'local' : storageOption // For Twitter, we need a public URL
        }),
      });
  
      if (!saveRes.ok) {
        const errorText = await saveRes.text();
        throw new Error(`Image save failed: ${saveRes.status} - ${errorText}`);
      }
  
      const { blobUrl } = await saveRes.json();
      console.log("✅ Image URL:", blobUrl);
      
      // Set state to ready for sharing
      setImageUrl(blobUrl);
      setStatus('ready');
    } catch (error) {
      console.error("❌ Failed to capture and save image:", error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const handleShare = async () => {
    if (!imageUrl) {
      return await captureAndSaveImage();
    }
    
    setStatus('sharing');
    
    try {
      // URL encode the displayName
      const encodedDisplayName = encodeURIComponent(displayName);
      
      if (platform === 'farcaster') {
        // Either use the frame URL or create a data URL frame
        let frameUrl;
        
        if (storageOption === 'data-url') {
          // For data URL approach, we need to pass the image directly to the frame endpoint
          frameUrl = `${process.env.NEXT_PUBLIC_URL}/frame/${encodedDisplayName}?imageDataUrl=${encodeURIComponent(imageUrl)}`;
        } else {
          frameUrl = `${process.env.NEXT_PUBLIC_URL}/frame/${encodedDisplayName}`;
        }
        
        await sdk.actions.composeCast({
          text: "Not financial advice. Just personal branding, this is my Zora Collage, whats yours?",
          embeds: [frameUrl],
        });
      } else if (platform === 'twitter') {
        // Generate a sharable URL to the public preview page
        const previewUrl = `${process.env.NEXT_PUBLIC_URL}/frame/${encodedDisplayName}`;
        
        // Create Twitter intent URL
        const tweetText = `Check out my Zora NFT Collage! Made with @zoratoken #ZoraCollage`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(previewUrl)}`;
        
        // Open Twitter intent in a new window
        window.open(twitterUrl, '_blank');
      }
      
      setStatus('idle');
    } catch (error) {
      console.error(`❌ Failed to share to ${platform}:`, error);
      setStatus('error');
      setErrorMessage(`Failed to share to ${platform === 'twitter' ? 'Twitter' : 'Farcaster'}`);
    }
  };

  // Button text based on status
  const getButtonText = () => {
    switch (status) {
      case 'capturing': return 'Capturing image...';
      case 'uploading': return 'Uploading...';
      case 'ready': return `Share to ${platform === 'twitter' ? 'Twitter' : 'Farcaster'}`;
      case 'sharing': return `Opening ${platform === 'twitter' ? 'Twitter' : 'Farcaster'}...`;
      case 'error': return 'Try again';
      default: return 'Create Shareable Image';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={status === 'ready' ? handleShare : captureAndSaveImage}
        disabled={['capturing', 'uploading', 'sharing'].includes(status)}
        className="border border-gray-700 hover:border-lime-300 text-gray-400 py-3 px-4 md:px-6 font-mono tracking-wider transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
      >
        {getButtonText()}
      </button>
      
      {status === 'idle' && (
        <div className="flex gap-2 mt-2">
          <button 
            onClick={() => setPlatform('twitter')}
            className={`text-xs py-1 px-2 rounded-md ${platform === 'twitter' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Twitter
          </button>
          <button 
            onClick={() => setPlatform('farcaster')}
            className={`text-xs py-1 px-2 rounded-md ${platform === 'farcaster' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Farcaster
          </button>
        </div>
      )}
      
      {errorMessage && (
        <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
      )}
    </div>
  );
}