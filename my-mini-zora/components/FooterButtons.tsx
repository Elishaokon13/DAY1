'use client'
import React from 'react'
import { ShareButton } from './ShareButton';

interface FooterButtonsProps {
  onReset: () => void
  displayName: string
}

export function FooterButtons({ onReset, displayName }: FooterButtonsProps) {
  return (
    <div className="flex justify-center mt-4 mb-6 gap-3 flex-wrap px-2 bg-black">
      <ShareButton displayName={displayName} />
      <button 
        onClick={onReset}
        className="border border-gray-700 hover:border-lime-300 text-gray-400 py-3 px-4 md:px-6 font-mono tracking-wider transition-colors duration-300 text-sm md:text-base">
        Try another handle
      </button>
    </div>
  )
} 