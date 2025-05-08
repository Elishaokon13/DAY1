import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import * as fs from 'fs';
import * as path from 'path';

// Force dynamic rendering to ensure fresh image generation on each request
export const dynamic = "force-dynamic";

/**
 * POST handler for saving captured images to Blob storage
 * @param request - The incoming HTTP request with displayName and base64 image data
 * @returns JSON with the blob URL
 */
export async function POST(request: NextRequest) {
  try {
    // Extract the displayName and imageData from the request body
    const { displayName, imageData, storageOption = 'blob' } = await request.json();
    
    if (!displayName) {
      return new Response("Missing displayName parameter", { status: 400 });
    }
    
    if (!imageData) {
      return new Response("Missing imageData parameter", { status: 400 });
    }
    
    // Ensure imageData is properly formatted (should be a data URL)
    if (!imageData.startsWith('data:image/')) {
      return new Response("Invalid image data format", { status: 400 });
    }
    
    // URL encode the displayName to handle special characters like parentheses
    const encodedDisplayName = encodeURIComponent(displayName);

    // Option 1: Just return the data URL directly (no storage required)
    if (storageOption === 'data-url') {
      return Response.json({
        blobUrl: imageData,
        isDataUrl: true
      });
    }
    
    // Convert the base64 data URL to a buffer
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Option 2: Use local file storage if no Blob token or explicitly requested 
    if (storageOption === 'local' || (!process.env.BLOB_READ_WRITE_TOKEN && storageOption !== 'mock')) {
      console.warn("⚠️ Using local file storage for development.");
      
      // Create public/images directory if it doesn't exist
      const publicDir = path.join(process.cwd(), 'public');
      const imgDir = path.join(publicDir, 'images');
      
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
      }
      
      if (!fs.existsSync(imgDir)) {
        fs.mkdirSync(imgDir);
      }
      
      // Save the file locally
      const filename = `${encodedDisplayName}.png`;
      const filePath = path.join(imgDir, filename);
      fs.writeFileSync(filePath, buffer);
      
      // Return a local URL that points to the saved image
      const localUrl = `/images/${filename}`;
      
      return Response.json({ 
        blobUrl: localUrl,
        isLocal: true
      });
    }

    // Option 3: Use mock URL if no Blob token and mock option is selected
    if (!process.env.BLOB_READ_WRITE_TOKEN && storageOption === 'mock') {
      console.warn("⚠️ BLOB_READ_WRITE_TOKEN not found. Using mock Blob URL for development.");
      return Response.json({ 
        blobUrl: `https://example-mock-blob-url.vercel.app/images/${encodedDisplayName}.png`,
        isMock: true
      });
    }

    // Option 4: Default - Use Vercel Blob storage
    // Convert buffer to ReadableStream for Vercel Blob
    const readableStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(buffer));
        controller.close();
      },
    });

    // Save the image to Vercel Blob with encoded filename
    const blob = await put(`images/${encodedDisplayName}.png`, readableStream, {
      access: "public",
      contentType: "image/png",
      allowOverwrite: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Return the blob URL
    return Response.json({ blobUrl: blob.url });
  } catch (err: unknown) {
    console.error("❌ API error in /api/save-image:", err);
    return new Response(`Failed to save image: ${err instanceof Error ? err.message : String(err)}`, {
      status: 500,
    });
  }
}
